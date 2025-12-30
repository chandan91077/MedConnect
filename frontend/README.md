# MediConnect Frontend

Modern React-based frontend for the MediConnect healthcare platform.

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Navbar, Footer)
│   ├── patient/         # Patient-specific components
│   └── admin/           # Admin-specific components
├── pages/
│   ├── auth/            # Authentication pages
│   ├── patient/         # Patient portal pages
│   └── admin/           # Admin dashboard pages
├── services/
│   ├── api.js           # Axios instance & API calls
│   └── socket.js        # Socket.IO client
├── store/
│   └── authStore.js     # Zustand auth state
├── lib/
│   └── utils.js         # Utility functions
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run on http://localhost:3000

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔐 Authentication Flow

### Login Flow
1. User enters credentials
2. API call to `/api/auth/login`
3. JWT token stored in localStorage
4. User object stored in Zustand store
5. Socket.IO connection established
6. Redirect based on role

### Protected Routes
Routes are protected using the `ProtectedRoute` component:
```jsx
<ProtectedRoute allowedRoles={['patient']}>
  <PatientDashboard />
</ProtectedRoute>
```

## 📡 API Integration

### Axios Instance
All API calls use the configured Axios instance from `services/api.js`:

```javascript
import api from '@/services/api';

// Example usage
const doctors = await api.get('/patients/doctors');
```

**Features:**
- Automatic JWT token injection
- Base URL configuration
- 401 redirect to login
- Error handling

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register patient
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

**Patient:**
- `GET /api/patients/doctors` - Browse doctors
- `GET /api/patients/doctors/:id` - Doctor details
- `GET /api/patients/time-slots` - Available time slots

**Appointments:**
- `POST /api/appointments/scheduled` - Book scheduled
- `POST /api/appointments/emergency` - Book emergency
- `GET /api/appointments/my` - My appointments
- `GET /api/appointments/:id` - Appointment details

**Admin:**
- `POST /api/admin/doctors` - Create doctor
- `PATCH /api/admin/doctors/:id/approve` - Approve doctor
- `GET /api/admin/stats` - Dashboard statistics

## 🔌 Real-Time Features (Socket.IO)

### Connection
Socket connection is established automatically on login:

```javascript
import socketService from '@/services/socket';

// Connect (happens automatically on login)
socketService.connect(token);

// Join chat room
socketService.joinChat(appointmentId);

// Send message
socketService.sendMessage({
  appointment_id: appointmentId,
  message_text: 'Hello doctor'
});

// Listen for messages
socketService.onMessage((data) => {
  console.log('New message:', data.message);
});
```

### Socket Events

**Client → Server:**
- `join-chat` - Join appointment chat room
- `send-message` - Send message
- `typing` - Typing indicator
- `leave-chat` - Leave chat

**Server → Client:**
- `joined-chat` - Successfully joined
- `message-history` - Recent messages
- `receive-message` - New message received
- `prescription-shared` - Prescription notification

## 🎨 Styling with TailwindCSS

### Custom Classes
Predefined utility classes in `index.css`:

**Buttons:**
```jsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-danger">Danger</button>
<button className="btn-success">Success</button>
```

**Cards:**
```jsx
<div className="card p-6">Content</div>
<div className="card card-hover p-6">Hover effect</div>
```

**Inputs:**
```jsx
<input className="input" />
<input className="input input-error" />
```

**Badges:**
```jsx
<span className="badge badge-success">Approved</span>
<span className="badge badge-danger">Rejected</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-info">Info</span>
```

### Color Palette
```javascript
primary: {
  50-900 // Blue shades
}
success: {
  50-900 // Green shades
}
danger: {
  50-900 // Red shades
}
```

## 📦 State Management (Zustand)

### Auth Store
```javascript
import useAuthStore from '@/store/authStore';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome {user.email}</p>
      ) : (
        <button onClick={() => login(credentials)}>Login</button>
      )}
    </div>
  );
}
```

**Available Methods:**
- `login(credentials)` - Login user
- `register(userData)` - Register user
- `logout()` - Logout user
- `updateProfile(data)` - Update profile

**State:**
- `user` - User object
- `token` - JWT token
- `isAuthenticated` - Boolean
- `loading` - Loading state
- `error` - Error message

## 🧩 Component Usage

### Navbar
```jsx
import Navbar from '@/components/layout/Navbar';

<Navbar />
```

### Protected Route
```jsx
import { ProtectedRoute } from '@/App';

<ProtectedRoute allowedRoles={['patient', 'admin']}>
  <YourComponent />
</ProtectedRoute>
```

## 📄 Page Implementation Guide

### Pattern for Creating New Pages

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import useAuthStore from '@/store/authStore';

const YourPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/your-endpoint');
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Page</h1>
      {/* Your content */}
    </div>
  );
};

export default YourPage;
```

## 🎯 Completed Pages

- ✅ [Login.jsx](file:///C:/Users/chand/OneDrive/Desktop/platform/MedConnect/frontend/src/pages/auth/Login.jsx)
- ✅ [Register.jsx](file:///C:/Users/chand/OneDrive/Desktop/platform/MedConnect/frontend/src/pages/auth/Register.jsx)
- ✅ [AdminLogin.jsx](file:///C:/Users/chand/OneDrive/Desktop/platform/MedConnect/frontend/src/pages/admin/AdminLogin.jsx)
- ✅ [BrowseDoctors.jsx](file:///C:/Users/chand/OneDrive/Desktop/platform/MedConnect/frontend/src/pages/patient/BrowseDoctors.jsx)
- ✅ [Navbar.jsx](file:///C:/Users/chand/OneDrive/Desktop/platform/MedConnect/frontend/src/components/layout/Navbar.jsx)

## 🚧 Stub Pages (Ready for Implementation)

Implementation stubs are provided in:
- `src/pages/patient/` - Patient pages
- `src/pages/admin/` - Admin pages

**To implement a stub:**
1. Copy the pattern from `BrowseDoctors.jsx`
2. Add API integration
3. Create UI components
4. Add form validation if needed
5. Test with backend API

## 🔧 Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Usage in code:**
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 🐛 Development Tips

### Hot Reload
Vite provides instant hot reload. Save any file to see changes immediately.

### DevTools
- React DevTools for component inspection
- Network tab for API calls
- Console for Socket.IO events
- Application tab for localStorage

### Common Issues

**CORS Errors:**
Ensure backend is running and CORS is configured properly.

**Socket Not Connecting:**
Check if token is valid and backend is running.

**Routes Not Working:**
Ensure you're using `Link` from react-router-dom, not `<a>` tags.

## 📚 Useful Utilities

### Format Date
```javascript
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';

formatDate('2024-01-01'); // "January 1, 2024"
formatTime('14:30:00'); // "2:30 PM"
formatCurrency(1000); // "₹1,000"
```

### Class Name Merger
```javascript
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'active-class')} />
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/` folder.

### Environment Variables
Set production environment variables in your hosting platform.

### Recommended Hosts
- Vercel (automatic deployment)
- Netlify
- AWS Amplify
- GitHub Pages (with routing config)

## 📖 Learning Resources

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contributing

Follow these guidelines:
1. Use functional components with hooks
2. Follow TailwindCSS utility-first approach
3. Keep components small and reusable
4. Add proper error handling
5. Write clean, readable code
6. Document complex logic

---

**Ready to implement the full UI!** All stub pages are waiting for your creativity. 🎨
