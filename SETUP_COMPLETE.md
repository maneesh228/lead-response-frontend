# 🎉 Backend Setup Complete!

## ✅ What I've Done

1. ✅ Installed required packages (bcryptjs, jsonwebtoken, cors)
2. ✅ Updated Staff model with password hashing
3. ✅ Created authentication middleware
4. ✅ Updated server.js with login/register routes
5. ✅ Added stats endpoint
6. ✅ Created .env file with JWT secret
7. ✅ Created admin user creation script

## ⚠️ MongoDB Not Running

MongoDB is not installed or not running on your system. You have two options:

### Option 1: Use MongoDB Atlas (Cloud - Recommended for Quick Start)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `.env` in backend folder:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-response?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars_12345
PORT=3001
```

Replace `username` and `password` with your MongoDB Atlas credentials.

### Option 2: Install MongoDB Locally

1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service
4. The default connection string in `.env` will work

## 🚀 Starting Your Application

### Step 1: Create Admin User

Once MongoDB is connected, run:

```bash
cd ..\lead-response-backend
node create-admin.js
```

This creates:
- **Email**: admin@example.com
- **Password**: admin123

### Step 2: Start Backend Server

```bash
cd ..\lead-response-backend
node server.js
```

You should see:
```
MongoDB connected
Server running on port 3001
```

### Step 3: Start Frontend (in new terminal)

```bash
cd ..\lead-response-frontend
npm start
```

## 🔐 Login to Your Application

1. Open http://localhost:3000
2. You'll be redirected to login page
3. Enter credentials:
   - **Email**: admin@example.com
   - **Password**: admin123
4. Click "Sign In"
5. You'll be redirected to the dashboard!

## 📝 API Endpoints Created

### Authentication (No token required)
- `POST /api/login` - User login
- `POST /api/register` - Register new user

### Protected Endpoints (Require token)
- `GET /api/stats` - Dashboard statistics
- `GET /leads` - Get all leads
- Other existing endpoints...

## 🧪 Test Login API

You can test the login endpoint directly:

```bash
curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

## 📁 Files Modified/Created

### Backend Files:
- ✅ `models/Staff.js` - Added password field with hashing
- ✅ `middleware/auth.js` - JWT authentication middleware
- ✅ `server.js` - Added login, register, stats routes + CORS
- ✅ `db/connect.js` - Fixed deprecated MongoDB options
- ✅ `.env` - Added JWT_SECRET and MONGODB_URI
- ✅ `create-admin.js` - Script to create admin user

### Frontend Files (Already Created Earlier):
- ✅ All authentication components
- ✅ Dashboard with sidebar
- ✅ Protected routes
- ✅ Login page

## 🔧 Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running (locally or use Atlas)
- Check your MONGODB_URI in `.env`

### "Invalid credentials" on login
- Make sure you ran `node create-admin.js` successfully
- Check the email and password are correct

### CORS errors
- Backend is already configured with CORS
- Make sure backend is running on port 3001
- Make sure frontend is running on port 3000

## 🎯 Next Steps

1. Choose MongoDB option (Atlas or Local)
2. Update `.env` with correct MongoDB URI
3. Run `node create-admin.js`
4. Start backend: `node server.js`
5. Start frontend: `npm start`
6. Login with admin@example.com / admin123

Enjoy your new authenticated dashboard! 🚀
