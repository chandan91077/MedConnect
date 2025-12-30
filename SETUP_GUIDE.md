# MediConnect Platform - Complete Setup Guide

## 🎯 Quick Start (Step-by-Step)

### Step 1: Configure MySQL Database

1. Open MySQL and create a new database:
   ```sql
   CREATE DATABASE mediconnect_db;
   ```

2. Update `backend/.env` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD
   DB_NAME=mediconnect_db
   ```

### Step 2: Configure AWS S3 (Optional for Development)

1. Create an AWS account and S3 bucket
2. Get access credentials
3. Update `backend/.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your_bucket_name
   AWS_REGION=us-east-1
   ```

**For Development:** You can skip this and file uploads will fail gracefully.

### Step 3: Configure Zoom API (Optional for Development)

1. Create Zoom developer account
2. Create Server-to-Server OAuth app
3. Update `backend/.env`:
   ```env
   ZOOM_API_KEY=your_api_key
   ZOOM_API_SECRET=your_api_secret
   ZOOM_ACCOUNT_ID=your_account_id
   ```

**For Development:** You can skip this and video meetings will fail gracefully.

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 5: Initialize Database

```bash
cd backend
npm run init-db
```

**Expected Output:**
```
✅ Database "mediconnect_db" created/verified
✅ Users table created
✅ Doctors table created
✅ Availability table created
✅ Appointments table created
✅ Messages table created
✅ Prescriptions table created
✅ Payments table created
✅ Patient profiles table created
✅ Admin account seeded
📧 Admin Email: admin@mediconnect.com
🔑 Admin Password: Password@1
```

### Step 6: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
==================================================
🚀 MediConnect Backend Server
==================================================
📡 Server running on port 5000
🌐 API: http://localhost:5000
🔌 WebSocket: ws://localhost:5000
⚙️  Environment: development
==================================================
```

### Step 7: Install Frontend Dependencies

**Open a NEW terminal window:**

```bash
cd frontend
npm install
```

### Step 8: Start Frontend Server

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 500 ms

➜  __Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Step 9: Access the Application

1. **Patient Portal:** http://localhost:3000
2. **Admin Portal:** http://localhost:3000/admin/login

## 🔐 Test Credentials

### Admin Account (Pre-seeded)
- Email: `admin@mediconnect.com`
- Password: `Password@1`

### Create Test Patient Account
1. Go to http://localhost:3000/register
2. Register with your email
3. Login and explore

## 📝 Common Setup Issues

### Issue 1: Database Connection Failed
**Solution:**
- Verify MySQL is running
- Check credentials in `backend/.env`
- Ensure database exists

### Issue 2: Port Already in Use
**Solution:**
```bash
# Change port in backend/.env
PORT=5001

# Change port in frontend/vite.config.js
server: { port: 3001 }
```

### Issue 3: CORS Errors
**Solution:**
- Ensure backend is running
- Check `FRONTEND_URL` in `backend/.env` matches frontend port

### Issue 4: Module Not Found
**Solution:**
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## � Development Workflow

### Running Both Servers Simultaneously

**Option 1: Two Terminal Windows**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**Option 2: Using npm scripts (recommended)**

Create `package.json` in root:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "install-all": "npm install --prefix backend && npm install --prefix frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Then run:
```bash
npm install
npm run dev
```

## 🧪 Testing the Platform

### 1. Test Patient Registration
1. Navigate to http://localhost:3000/register
2. Fill in registration form
3. Submit and verify redirect to dashboard

### 2. Test Browse Doctors
1. Login as patient
2. Navigate to "Browse Doctors"
3. Should see empty list (no approved doctors yet)

### 3. Test Admin Functions
1. Navigate to http://localhost:3000/admin/login
2. Login with admin credentials
3. Access admin dashboard
4. Create a doctor account
5. Approve the doctor

### 4. Test Complete Booking Flow
1. Login as patient
2. Browse doctors (should see approved doctor)
3. Click on doctor profile
4. Book appointment
5. Complete payment
6. View appointment in dashboard

### 5. Test Real-Time Chat
1. Navigate to appointment
2. Open chat
3. Send messages
4. Verify Socket.IO connection in browser console

## 🔧 Configuration Reference

### Backend Environment Variables

**Required for Basic Functionality:**
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mediconnect_db
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

**Optional (Can use placeholders):**
```env
AWS_ACCESS_KEY_ID=placeholder
AWS_SECRET_ACCESS_KEY=placeholder
AWS_S3_BUCKET=placeholder
AWS_REGION=us-east-1
ZOOM_API_KEY=placeholder
ZOOM_API_SECRET=placeholder
ZOOM_ACCOUNT_ID=placeholder
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📊 Database Schema Overview

The platform uses 8 main tables:

1. **users** - Authentication (patient, doctor, admin)
2. **doctors** - Doctor profiles and approval status
3. **patient_profiles** - Patient information
4. **availability** - Doctor schedules
5. **appointments** - Booking records
6. **messages** - Chat history
7. **prescriptions** - Digital prescriptions
8. **payments** - Transaction records

## 🚀 Deployment Checklist

- [ ] Change admin default credentials
- [ ] Set strong JWT_SECRET
- [ ] Configure production database
- [ ] Set up AWS S3 bucket
- [ ] Configure Zoom API
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure proper CORS
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Set up monitoring

## 📖 API Documentation

Full API documentation available in `backend/README.md`

Key endpoints:
- `POST /api/auth/register` - Register patient
- `POST /api/auth/login` - Login
- `GET /api/patients/doctors` - Browse doctors
- `POST /api/appointments/scheduled` - Book appointment
- `POST /api/admin/doctors` - Create doctor (admin only)

## 🎓 Learning Resources

### Technologies Used
- **Backend:** Node.js, Express, MySQL, Socket.IO
- **Frontend:** React, Vite, TailwindCSS, Zustand
- **APIs:** Zoom REST API, AWS S3
- **Authentication:** JWT, Bcrypt

### Recommended Reading
- Express.js documentation
- Socket.IO documentation
- React Router documentation
- Zustand state management
- TailwindCSS utility classes

## 💡 Tips for Development

1. **Use Browser DevTools:**
   - Network tab for API calls
   - Console for errors
   - Application tab for localStorage

2. **Check Backend Logs:**
   - All requests are logged
   - Socket connections logged
   - Database queries visible

3. **Database Management:**
   - Use MySQL Workbench for visual interface
   - Run queries to inspect data
   - Reset database: `npm run init-db`

4. **Frontend Development:**
   - Hot reload enabled (auto-refresh on save)
   - TailwindCSS utilities for styling
   - Zustand store for state management

## ��� Troubleshooting

### Backend Not Starting
```bash
# Check if port is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F

# Restart
npm run dev
```

### Frontend Build Errors
```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Restart
npm run dev
```

### Database Issues
```bash
# Reset database
npm run init-db

# Check MySQL service
# Services > MySQL > Start
```

## ✅ Next Steps

After setup is complete:

1. [ ] Explore the platform as both patient and admin
2. [ ] Review the code structure
3. [ ] Implement missing pages (stubs are provided)
4. [ ] Add form validation
5. [ ] Implement real-time chat UI
6. [ ] Add payment gateway integration
7. [ ] Create comprehensive tests
8. [ ] Deploy to production

---

**Need Help?** Check the main README.md for more detailed information.

**Ready to Code?** All backend APIs are functional. Frontend stubs are ready for implementation.

**Happy Coding! 🚀**
