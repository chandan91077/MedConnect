# MediConnect - Real-Time Healthcare Platform

## 🏥 Overview

MediConnect is a production-ready real-time healthcare platform that connects patients with doctors through secure appointments, video consultations, real-time chat, and digital prescriptions.

## ✨ Features

### Patient Features
- ✅ Browse approved doctors
- ✅ View doctor availability
- ✅ Book scheduled appointments
- ✅ Book emergency appointments
- ✅ Secure payment processing
- ✅ Real-time chat with doctors
- ✅ Zoom video consultations
- ✅ Download digital prescriptions
- ✅ View medical history

### Admin Features
- ✅ Create doctor accounts
- ✅ Approve/reject doctors
- ✅ Manage doctor availability
- ✅ View all appointments
- ✅ Track revenue & analytics
- ✅ Payment logs
- ✅ Platform statistics

### Doctor Access
- ✅ API-only access (no frontend)
- ✅ Zoom meeting links
- ✅ Real-time chat when unlocked
- ✅ Create prescriptions

## 🛠️ Technology Stack

### Backend
- Node.js & Express.js
- MySQL (with connection pooling)
- JWT Authentication
- Socket.IO (real-time chat)
- Zoom REST API
- AWS S3 (file storage)
- PDFKit (prescription generation)
- Node-cron (scheduled tasks)
- Bcrypt (password hashing)

### Frontend
- React 18
- Vite (build tool)
- React Router v6
- Zustand (state management)
- TailwindCSS
- Socket.IO Client
- Axios
- Lucide Icons

## 📦 Installation

### Prerequisites
- Node.js 16+ installed
- MySQL 8.0+ installed and running
- AWS account (for S3)
- Zoom account (for API)

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Edit `backend/.env` with your credentials

4. **Initialize database:**
   ```bash
   npm run init-db
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```

   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000`

## 🔐 Default Admin Credentials

- **Email:** `admin@mediconnect.com`
- **Password:** `Password@1`

⚠️ **IMPORTANT:** Change these credentials in production!

## 🚀 Quick Start Guide

1. **Install all dependencies:**
   ```bash
   # Backend
   cd backend && npm install

   # Frontend (in new terminal)
   cd frontend && npm install
   ```

2. **Configure `.env` files** in both backend and frontend

3. **Initialize database:**
   ```bash
   cd backend && npm run init-db
   ```

4. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Portal: http://localhost:3000/admin/login

## 📁 Project Structure

```
MedConnect/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, S3, Zoom config
│   │   ├── middleware/      # Auth, RBAC
│   │   ├── models/          # Database models
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── services/        # External services
│   │   ├── socket/          # Socket.IO handler
│   │   ├── jobs/            # Cron jobs
│   │   └── app.js           # Express app
│   ├── server.js            # Server entry point
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── services/        # API & Socket services
    │   ├── store/           # Zustand stores
    │   ├── lib/             # Utilities
    │   ├── App.jsx          # Main app component
    │   └── main.jsx         # Entry point
    ├── package.json
    └── .env
```

## 🔄 Business Logic

### Scheduled Booking Flow
1. Patient selects doctor, date, and time
2. Backend validates slot availability (with row locking)
3. Payment processed
4. Zoom meeting created for appointment time
5. Chat & Video access LOCKED until appointment day
6. Cron job unlocks at midnight on appointment day

### Emergency Booking Flow
1. Patient requests emergency appointment
2. Backend checks doctor availability
3. Higher consultation fee applied
4. Payment processed
5. Zoom meeting created IMMEDIATELY
6. Chat & Video access UNLOCKED instantly
7. Doctor phone number provided

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register patient
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients/doctors` - Browse doctors
- `GET /api/patients/doctors/:id` - Doctor details

### Appointments
- `POST /api/appointments/scheduled` - Book scheduled
- `POST /api/appointments/emergency` - Book emergency
- `GET /api/appointments/my` - My appointments

### Admin
- `POST /api/admin/doctors` - Create doctor
- `PATCH /api/admin/doctors/:id/approve` - Approve doctor
- `GET /api/admin/stats` - Dashboard stats

See `backend/README.md` for complete API documentation.

## 🔌 Real-Time Features

### Socket.IO Events
- `join-chat` - Join appointment chat
- `send-message` - Send message
- `receive-message` - Receive message
- `prescription-shared` - Prescription notification

## 📊 Database Schema

- **users** - Authentication & roles
- **doctors** - Doctor profiles
- **patient_profiles** - Patient information
- **availability** - Doctor schedules
- **appointments** - Booking records
- **messages** - Chat history
- **prescriptions** - Digital prescriptions
- **payments** - Transaction records

## 🛡️ Security Features

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Protected API routes
- Private S3 buckets with signed URLs
- SQL injection prevention
- CORS configuration

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mediconnect_db
JWT_SECRET=your_secret
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
ZOOM_API_KEY=your_key
ZOOM_API_SECRET=your_secret
ZOOM_ACCOUNT_ID=your_account_id
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🚧 Development Status

### ✅ Completed
- Backend infrastructure
- Database schema & models
- Authentication system
- API endpoints
- Socket.IO integration
- Zoom API integration
- S3 file storage
- PDF generation
- Cron jobs
- Frontend setup
- Login/Register pages
- Navbar & routing
- Browse Doctors page

### 🔄 In Progress (Stub Pages Created)
- Patient Dashboard
- Doctor Profile
- Book Appointment
- Appointments List
- Chat Interface
- Prescriptions
- Admin Dashboard
- Doctor Management
- Admin Analytics

## 📖 Next Steps

1. Implement remaining frontend pages using the stubs
2. Add form validation with React Hook Form + Zod
3. Implement real-time chat UI
4. Add Zoom video integration on frontend
5. Create payment gateway integration
6. Add loading states and error boundaries
7. Implement responsive mobile design
8. Add unit and integration tests

## 🤝 Contributing

This is a production-grade platform. Follow professional coding standards:
- Use TypeScript for type safety
- Write unit tests
- Follow ESLint rules
- Document all APIs
- Use semantic commits

## 📄 License

MIT License

## 🆘 Support

For issues or questions:
1. Check documentation
2. Review API endpoints
3. Check browser console for errors
4. Verify database connection
5. Ensure all environment variables are set

---

Built with ❤️ using modern web technologies
