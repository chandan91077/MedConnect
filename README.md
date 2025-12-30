# MedConnect - Doctor Appointment Platform

A comprehensive telemedicine platform built with FastAPI, React, MongoDB, enabling seamless doctor-patient interactions through video consultations, chat, and appointment management.

## 🌟 Features

### Multi-Role System
- **Patients**: Book appointments, video consultations, chat with doctors, view prescriptions
- **Doctors**: Manage appointments, video calls, generate prescriptions, track earnings
- **Admin**: Approve doctors, manage platform, view analytics

### Core Functionality
- 🔐 **JWT Authentication**: Secure email/password authentication
- 📅 **Smart Booking**: Real-time slot availability with conflict prevention
- 💳 **Stripe Integration**: Payment processing with Stripe Connect for doctor payouts
- 💬 **Real-time Chat**: WebSocket-based instant messaging
- 🎥 **Video Consultations**: WebRTC-powered video calls with signaling
- 📄 **Digital Prescriptions**: PDF generation and secure storage
- 📁 **File Management**: AWS S3 integration for documents
- 🔔 **Notifications**: Real-time appointment and payment notifications
- 📊 **Analytics Dashboard**: Revenue tracking and platform statistics

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: PyJWT + bcrypt
- **Payments**: Stripe API + Stripe Connect
- **Storage**: AWS S3 (boto3)
- **Real-time**: WebSocket
- **PDF Generation**: ReportLab
- **Server**: Uvicorn with auto-reload

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **State Management**: Zustand
- **Server State**: TanStack React Query
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (Radix UI)
- **Real-time**: WebSocket API
- **Video**: WebRTC (simple-peer)
- **Payments**: Stripe React Elements
- **Notifications**: Sonner

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Navbar.jsx
│   │   │   └── ui/       # Shadcn UI components
│   │   ├── pages/        # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/     # API and WebSocket services
│   │   │   ├── api.js
│   │   │   └── websocket.js
│   │   ├── store/        # Zustand stores
│   │   │   └── authStore.js
│   │   ├── App.js        # Main App component
│   │   └── index.css     # Global styles
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 4.4+
- Yarn package manager
- AWS Account (for S3)
- Stripe Account

### Environment Setup

#### Backend (.env)
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="doctor_appointment_db"
CORS_ORIGINS="*"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION_HOURS=720

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="doctor-appointment-files"
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Doctor Management
- `POST /api/doctors/profile` - Create doctor profile (requires multipart/form-data)
- `GET /api/doctors` - List all approved doctors (with filters)
- `GET /api/doctors/{doctor_id}` - Get doctor details
- `PUT /api/doctors/profile` - Update doctor profile

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - List appointments (filtered by role)
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}/status` - Update appointment status

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment

### Prescriptions
- `POST /api/prescriptions` - Create prescription (generates PDF)
- `GET /api/prescriptions` - List prescriptions

### Chat & Files
- `GET /api/chat/messages/{appointment_id}` - Get chat messages
- `POST /api/files/upload` - Upload file to S3
- `GET /api/files` - List user files

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark as read

### Admin
- `GET /api/admin/doctors/pending` - Get pending doctor approvals
- `PUT /api/admin/doctors/{id}/approve` - Approve/reject doctor
- `GET /api/admin/stats` - Platform statistics

### WebSocket
- `WS /ws/{user_id}?token={jwt_token}` - WebSocket connection for real-time features

## 📊 Database Collections

- **users** - User accounts (patients, doctors, admin)
- **doctor_profiles** - Doctor professional information
- **appointments** - Appointment bookings
- **prescriptions** - Medical prescriptions with PDF URLs
- **chat_messages** - Chat messages between users
- **notifications** - User notifications
- **documents** - Uploaded files metadata

## 🚧 Implementation Status

### ✅ Completed (MVP Phase 1)
- Full authentication system (register, login, JWT)
- Doctor profile creation with file uploads
- Appointment booking with slot management
- Payment integration (Stripe PaymentIntent)
- Prescription PDF generation
- Real-time chat (WebSocket infrastructure)
- WebSocket signaling for video calls
- Notification system
- Admin approval workflow
- File upload to S3
- Landing page with hero section
- Login/Register pages with validation
- Responsive navbar
- Protected routes by role

### 📋 Remaining Features (For Full Production)
- Complete dashboard implementations (Patient, Doctor, Admin)
- Doctor onboarding multi-step form UI
- Browse doctors page with filters and search
- Video call UI component with WebRTC
- Chat interface component
- Prescription viewer component
- Appointment calendar view
- Stripe Connect doctor onboarding flow
- Settlement/payout automation
- Email notifications
- SMS reminders
- Review/rating system
- Follow-up appointment system
- Analytics charts

## 🧪 Testing

### Quick API Tests
```bash
# Register patient
curl -X POST "http://localhost:8001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","full_name":"Test User","role":"patient"}'

# Login
curl -X POST "http://localhost:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Test Users Created
- **Patient**: newpatient@test.com / test12345
- **Doctor**: drsmith@test.com / doctor123
- **Admin**: admin@medconnect.com / admin123

## 🎯 Current Platform Status

The platform is currently in **MVP Phase 1** with:
- ✅ Complete backend API infrastructure
- ✅ Authentication and authorization system
- ✅ Core database models and endpoints
- ✅ Payment processing integration
- ✅ Real-time communication infrastructure
- ✅ Landing and auth pages UI
- 🚧 Dashboard UIs (placeholder pages)
- 🚧 Full booking flow UI
- 🚧 Video call interface
- 🚧 Chat UI

## ⚙️ Configuration Notes

### Important Environment Variables
- `REACT_APP_BACKEND_URL`: Currently set to production URL
- All backend API routes use `/api` prefix for proper routing
- WebSocket connections auto-configured from backend URL
- Supervisor manages both frontend and backend services

### Required External Services Setup
1. **Stripe Account**: Get API keys from Stripe Dashboard
2. **AWS S3 Bucket**: Create bucket and configure IAM user
3. **MongoDB**: Already running locally

## 📝 Usage Flow

### Patient Journey
1. Register/Login → Browse doctors → Book appointment → Pay → Video consultation → Receive prescription

### Doctor Journey
1. Register → Complete profile → Admin approval → Set availability → Accept appointments → Conduct consultations → Generate prescriptions

### Admin Journey
1. Login → Review doctor applications → Approve/reject → Monitor platform statistics

## 📞 Support

API Documentation: http://localhost:8001/docs

---

**Note**: This is an MVP implementation. For production deployment, additional security measures, monitoring, and complete UI flows are required.
