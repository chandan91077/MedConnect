from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, UploadFile, File, Form, Query, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import stripe
import boto3
from botocore.exceptions import ClientError
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import asyncio
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_placeholder')

# AWS S3
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID', ''),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY', ''),
    region_name=os.environ.get('AWS_REGION', 'us-east-1')
)
S3_BUCKET = os.environ.get('S3_BUCKET_NAME', 'doctor-appointment-files')

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
JWT_EXPIRATION = int(os.environ['JWT_EXPIRATION_HOURS'])

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)
        self.doctor_status: Dict[str, str] = {}  # doctor_id: online/offline
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                if user_id in self.doctor_status:
                    del self.doctor_status[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast(self, message: dict):
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_role(required_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

async def upload_to_s3(file_data: bytes, filename: str, folder: str = "uploads") -> str:
    """Upload file to S3 and return URL"""
    try:
        key = f"{folder}/{uuid.uuid4()}_{filename}"
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=file_data,
            ContentType='application/octet-stream'
        )
        url = f"https://{S3_BUCKET}.s3.amazonaws.com/{key}"
        return url
    except Exception as e:
        logging.error(f"S3 upload error: {e}")
        return f"local_storage/{filename}"

# Models
class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str  # patient, doctor, admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "patient"  # patient or doctor

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DoctorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str
    specialization: str
    degrees: List[str]
    license_number: str
    experience_years: int
    languages: List[str]
    bio: str
    consultation_fee: float
    id_proof_url: Optional[str] = None
    certificate_urls: List[str] = []
    bank_account: Optional[str] = None
    stripe_account_id: Optional[str] = None
    approval_status: str = "pending"  # pending, approved, rejected
    rating: float = 0.0
    total_reviews: int = 0
    available_days: List[str] = []  # ['Monday', 'Tuesday', ...]
    available_hours: Dict[str, List[str]] = {}  # {'Monday': ['09:00', '10:00', ...]}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    doctor_id: str
    appointment_date: datetime
    slot_time: str  # "09:00", "10:00", etc.
    consultation_fee: float
    status: str = "pending"  # pending, confirmed, completed, cancelled, refunded
    payment_status: str = "pending"  # pending, paid, refunded
    payment_intent_id: Optional[str] = None
    is_emergency: bool = False
    notes: Optional[str] = None
    prescription_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Prescription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    appointment_id: str
    patient_id: str
    doctor_id: str
    diagnosis: str
    medications: List[Dict[str, str]]  # [{name, dosage, duration}, ...]
    instructions: str
    file_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    appointment_id: str
    sender_id: str
    receiver_id: str
    message: str
    file_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_read: bool = False

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str  # appointment, payment, general
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Routes
@api_router.get("/")
async def root():
    return {"message": "Doctor Appointment Platform API", "version": "1.0"}

# Authentication Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = UserBase(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return {
        "user": user.model_dump(),
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get('is_active', True):
        raise HTTPException(status_code=403, detail="Account is inactive")
    
    token = create_access_token({"sub": user['id'], "role": user['role']})
    
    user_data = {k: v for k, v in user.items() if k not in ['_id', 'password']}
    
    return {
        "user": user_data,
        "token": token
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Doctor Routes
@api_router.post("/doctors/profile")
async def create_doctor_profile(
    profile_data: str = Form(...),
    id_proof: Optional[UploadFile] = File(None),
    certificates: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'doctor':
        raise HTTPException(status_code=403, detail="Only doctors can create profiles")
    
    import json
    profile_dict = json.loads(profile_data)
    
    # Upload files
    if id_proof:
        id_data = await id_proof.read()
        id_url = await upload_to_s3(id_data, id_proof.filename, "doctor_docs")
        profile_dict['id_proof_url'] = id_url
    
    cert_urls = []
    if certificates:
        for cert in certificates:
            cert_data = await cert.read()
            cert_url = await upload_to_s3(cert_data, cert.filename, "doctor_docs")
            cert_urls.append(cert_url)
    profile_dict['certificate_urls'] = cert_urls
    
    profile = DoctorProfile(user_id=current_user['id'], **profile_dict)
    profile_dict = profile.model_dump()
    profile_dict['created_at'] = profile_dict['created_at'].isoformat()
    
    await db.doctor_profiles.insert_one(profile_dict)
    
    return {"message": "Profile created, pending admin approval", "profile": profile.model_dump()}

@api_router.get("/doctors")
async def get_doctors(
    specialization: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_fee: Optional[float] = None,
    online_only: bool = False
):
    query = {"approval_status": "approved"}
    
    if specialization:
        query['specialization'] = {"$regex": specialization, "$options": "i"}
    if min_rating:
        query['rating'] = {"$gte": min_rating}
    if max_fee:
        query['consultation_fee'] = {"$lte": max_fee}
    
    doctors = await db.doctor_profiles.find(query, {"_id": 0}).to_list(1000)
    
    # Get user details
    for doctor in doctors:
        user = await db.users.find_one({"id": doctor['user_id']}, {"_id": 0, "password": 0})
        if user:
            doctor['user_details'] = user
            doctor['is_online'] = manager.doctor_status.get(doctor['user_id']) == 'online'
    
    if online_only:
        doctors = [d for d in doctors if d.get('is_online')]
    
    return doctors

@api_router.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    doctor = await db.doctor_profiles.find_one({"user_id": doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    user = await db.users.find_one({"id": doctor_id}, {"_id": 0, "password": 0})
    if user:
        doctor['user_details'] = user
    
    return doctor

@api_router.put("/doctors/profile")
async def update_doctor_profile(
    profile_update: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'doctor':
        raise HTTPException(status_code=403, detail="Only doctors can update profiles")
    
    await db.doctor_profiles.update_one(
        {"user_id": current_user['id']},
        {"$set": profile_update}
    )
    
    return {"message": "Profile updated"}

# Appointment Routes
@api_router.post("/appointments")
async def create_appointment(
    appointment_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'patient':
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    # Check doctor availability
    doctor = await db.doctor_profiles.find_one({"user_id": appointment_data['doctor_id']})
    if not doctor or doctor['approval_status'] != 'approved':
        raise HTTPException(status_code=400, detail="Doctor not available")
    
    # Check slot availability
    appointment_date = datetime.fromisoformat(appointment_data['appointment_date'])
    existing = await db.appointments.find_one({
        "doctor_id": appointment_data['doctor_id'],
        "appointment_date": appointment_date.isoformat(),
        "slot_time": appointment_data['slot_time'],
        "status": {"$nin": ["cancelled", "refunded"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")
    
    appointment = Appointment(
        patient_id=current_user['id'],
        doctor_id=appointment_data['doctor_id'],
        appointment_date=appointment_date,
        slot_time=appointment_data['slot_time'],
        consultation_fee=doctor['consultation_fee'],
        is_emergency=appointment_data.get('is_emergency', False)
    )
    
    appt_dict = appointment.model_dump()
    appt_dict['appointment_date'] = appt_dict['appointment_date'].isoformat()
    appt_dict['created_at'] = appt_dict['created_at'].isoformat()
    
    await db.appointments.insert_one(appt_dict)
    
    # Create notification
    notification = Notification(
        user_id=appointment_data['doctor_id'],
        title="New Appointment",
        message=f"New appointment booked by {current_user['full_name']}",
        type="appointment"
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    await manager.send_personal_message({
        "type": "new_appointment",
        "data": appt_dict
    }, appointment_data['doctor_id'])
    
    return appt_dict

@api_router.get("/appointments")
async def get_appointments(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if current_user['role'] == 'patient':
        query['patient_id'] = current_user['id']
    elif current_user['role'] == 'doctor':
        query['doctor_id'] = current_user['id']
    
    if status:
        query['status'] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).to_list(1000)
    
    # Enrich with user details
    for appt in appointments:
        patient = await db.users.find_one({"id": appt['patient_id']}, {"_id": 0, "password": 0})
        doctor = await db.users.find_one({"id": appt['doctor_id']}, {"_id": 0, "password": 0})
        doctor_profile = await db.doctor_profiles.find_one({"user_id": appt['doctor_id']}, {"_id": 0})
        
        appt['patient_details'] = patient
        appt['doctor_details'] = doctor
        appt['doctor_profile'] = doctor_profile
    
    return appointments

@api_router.get("/appointments/{appointment_id}")
async def get_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check access
    if current_user['role'] not in ['admin'] and current_user['id'] not in [appointment['patient_id'], appointment['doctor_id']]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return appointment

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status_update: dict,
    current_user: dict = Depends(get_current_user)
):
    appointment = await db.appointments.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    new_status = status_update.get('status')
    
    await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": new_status}}
    )
    
    # Notify users
    await manager.send_personal_message({
        "type": "appointment_status_update",
        "appointment_id": appointment_id,
        "status": new_status
    }, appointment['patient_id'])
    
    await manager.send_personal_message({
        "type": "appointment_status_update",
        "appointment_id": appointment_id,
        "status": new_status
    }, appointment['doctor_id'])
    
    return {"message": "Status updated", "status": new_status}

# Payment Routes
@api_router.post("/payments/create-intent")
async def create_payment_intent(
    payment_data: dict,
    current_user: dict = Depends(get_current_user)
):
    try:
        appointment = await db.appointments.find_one({"id": payment_data['appointment_id']})
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        intent = stripe.PaymentIntent.create(
            amount=int(appointment['consultation_fee'] * 100),  # Convert to cents
            currency="usd",
            metadata={"appointment_id": payment_data['appointment_id']}
        )
        
        await db.appointments.update_one(
            {"id": payment_data['appointment_id']},
            {"$set": {"payment_intent_id": intent.id}}
        )
        
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payments/confirm")
async def confirm_payment(
    payment_data: dict,
    current_user: dict = Depends(get_current_user)
):
    appointment_id = payment_data['appointment_id']
    
    await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"payment_status": "paid", "status": "confirmed"}}
    )
    
    appointment = await db.appointments.find_one({"id": appointment_id})
    
    # Notify doctor
    await manager.send_personal_message({
        "type": "payment_confirmed",
        "appointment_id": appointment_id
    }, appointment['doctor_id'])
    
    return {"message": "Payment confirmed"}

# Prescription Routes
@api_router.post("/prescriptions")
async def create_prescription(
    prescription_data: dict,
    current_user: dict = Depends(get_current_user)
):
    if current_user['role'] != 'doctor':
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")
    
    prescription = Prescription(**prescription_data)
    
    # Generate PDF
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Header
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#2563eb'), alignment=TA_CENTER)
    story.append(Paragraph("Medical Prescription", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Patient & Doctor Info
    patient = await db.users.find_one({"id": prescription_data['patient_id']}, {"_id": 0})
    doctor = await db.users.find_one({"id": current_user['id']}, {"_id": 0})
    
    story.append(Paragraph(f"<b>Patient:</b> {patient['full_name']}", styles['Normal']))
    story.append(Paragraph(f"<b>Doctor:</b> {doctor['full_name']}", styles['Normal']))
    story.append(Paragraph(f"<b>Date:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Diagnosis
    story.append(Paragraph(f"<b>Diagnosis:</b> {prescription_data['diagnosis']}", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Medications
    story.append(Paragraph("<b>Medications:</b>", styles['Heading2']))
    for med in prescription_data['medications']:
        story.append(Paragraph(f"• {med['name']} - {med['dosage']} for {med['duration']}", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Instructions
    story.append(Paragraph(f"<b>Instructions:</b> {prescription_data['instructions']}", styles['Normal']))
    
    doc.build(story)
    pdf_buffer.seek(0)
    
    # Upload PDF
    pdf_url = await upload_to_s3(pdf_buffer.getvalue(), f"prescription_{prescription.id}.pdf", "prescriptions")
    
    presc_dict = prescription.model_dump()
    presc_dict['file_url'] = pdf_url
    presc_dict['created_at'] = presc_dict['created_at'].isoformat()
    
    await db.prescriptions.insert_one(presc_dict)
    
    # Update appointment
    await db.appointments.update_one(
        {"id": prescription_data['appointment_id']},
        {"$set": {"prescription_id": prescription.id}}
    )
    
    return presc_dict

@api_router.get("/prescriptions")
async def get_prescriptions(current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user['role'] == 'patient':
        query['patient_id'] = current_user['id']
    elif current_user['role'] == 'doctor':
        query['doctor_id'] = current_user['id']
    
    prescriptions = await db.prescriptions.find(query, {"_id": 0}).to_list(1000)
    return prescriptions

# Chat Routes
@api_router.get("/chat/messages/{appointment_id}")
async def get_messages(
    appointment_id: str,
    current_user: dict = Depends(get_current_user)
):
    messages = await db.chat_messages.find(
        {"appointment_id": appointment_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    
    return messages

# File Upload
@api_router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Form("patient_docs"),
    current_user: dict = Depends(get_current_user)
):
    file_data = await file.read()
    file_url = await upload_to_s3(file_data, file.filename, folder)
    
    # Save document record
    doc_record = {
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "filename": file.filename,
        "file_url": file_url,
        "folder": folder,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.documents.insert_one(doc_record)
    
    return {"file_url": file_url, "document": doc_record}

@api_router.get("/files")
async def get_files(current_user: dict = Depends(get_current_user)):
    documents = await db.documents.find({"user_id": current_user['id']}, {"_id": 0}).to_list(1000)
    return documents

# Notifications
@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user['id']},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}

# Admin Routes
@api_router.get("/admin/doctors/pending")
async def get_pending_doctors(
    current_user: dict = Depends(require_role(["admin"]))
):
    doctors = await db.doctor_profiles.find(
        {"approval_status": "pending"},
        {"_id": 0}
    ).to_list(1000)
    
    for doctor in doctors:
        user = await db.users.find_one({"id": doctor['user_id']}, {"_id": 0, "password": 0})
        if user:
            doctor['user_details'] = user
    
    return doctors

@api_router.put("/admin/doctors/{doctor_id}/approve")
async def approve_doctor(
    doctor_id: str,
    approval_data: dict,
    current_user: dict = Depends(require_role(["admin"]))
):
    await db.doctor_profiles.update_one(
        {"user_id": doctor_id},
        {"$set": {"approval_status": approval_data['status']}}
    )
    
    # Notify doctor
    notification = Notification(
        user_id=doctor_id,
        title="Profile Status Updated",
        message=f"Your profile has been {approval_data['status']}",
        type="general"
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    await manager.send_personal_message({
        "type": "profile_status_update",
        "status": approval_data['status']
    }, doctor_id)
    
    return {"message": f"Doctor {approval_data['status']}"}

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(require_role(["admin"]))):
    total_users = await db.users.count_documents({})
    total_doctors = await db.doctor_profiles.count_documents({"approval_status": "approved"})
    total_appointments = await db.appointments.count_documents({})
    pending_doctors = await db.doctor_profiles.count_documents({"approval_status": "pending"})
    
    # Revenue calculation
    completed_appointments = await db.appointments.find(
        {"payment_status": "paid"}
    ).to_list(10000)
    total_revenue = sum(appt.get('consultation_fee', 0) for appt in completed_appointments)
    
    return {
        "total_users": total_users,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "pending_doctors": pending_doctors,
        "total_revenue": total_revenue,
        "active_doctors_online": len(manager.doctor_status)
    }

# WebSocket for Real-time Features
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str = Query(...)):
    try:
        # Verify token
        payload = decode_token(token)
        if payload.get("sub") != user_id:
            await websocket.close(code=1008)
            return
        
        await manager.connect(websocket, user_id)
        
        # Update doctor online status
        user = await db.users.find_one({"id": user_id})
        if user and user['role'] == 'doctor':
            manager.doctor_status[user_id] = 'online'
            await manager.broadcast({
                "type": "doctor_status_update",
                "doctor_id": user_id,
                "status": "online"
            })
        
        try:
            while True:
                data = await websocket.receive_json()
                
                if data['type'] == 'chat_message':
                    # Save message
                    message = ChatMessage(
                        appointment_id=data['appointment_id'],
                        sender_id=user_id,
                        receiver_id=data['receiver_id'],
                        message=data['message']
                    )
                    msg_dict = message.model_dump()
                    msg_dict['timestamp'] = msg_dict['timestamp'].isoformat()
                    await db.chat_messages.insert_one(msg_dict)
                    
                    # Send to receiver
                    await manager.send_personal_message({
                        "type": "chat_message",
                        "data": msg_dict
                    }, data['receiver_id'])
                    
                elif data['type'] == 'video_signal':
                    # Forward WebRTC signaling
                    await manager.send_personal_message({
                        "type": "video_signal",
                        "data": data['signal'],
                        "from": user_id
                    }, data['to'])
                
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id)
            
            # Update doctor offline status
            if user and user['role'] == 'doctor':
                manager.doctor_status[user_id] = 'offline'
                await manager.broadcast({
                    "type": "doctor_status_update",
                    "doctor_id": user_id,
                    "status": "offline"
                })
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        await websocket.close()

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()