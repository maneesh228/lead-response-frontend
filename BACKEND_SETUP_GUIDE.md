# Backend Login Implementation Guide

## Current Status
Your backend **DOES NOT** have login functionality. Here's what needs to be added:

## Required Changes

### 1. Install Required Packages

```bash
cd ..\lead-response-backend
npm install bcryptjs jsonwebtoken cors
```

### 2. Update Staff Model

Add password field to `models/Staff.js`:

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const StaffSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["owner", "staff", "admin"], default: "staff" },
}, {
  timestamps: true
});

// Hash password before saving
StaffSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
StaffSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Staff", StaffSchema);
```

### 3. Create Authentication Middleware

Create `middleware/auth.js`:

```javascript
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticateToken;
```

### 4. Update server.js

Add these changes to `server.js`:

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./db/connect");
const Lead = require("./models/Lead");
const Staff = require("./models/Staff");
const Response = require("./models/Response");
const Score = require("./models/Score");
const authenticateToken = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json());

// Connect to MongoDB
connectDB();

// ============ AUTHENTICATION ROUTES ============

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await Staff.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return success response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred during login" 
    });
  }
});

// Register Route (for creating initial admin user)
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await Staff.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    // Create new user
    const user = new Staff({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      role: role || "staff",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred during registration" 
    });
  }
});

// Stats endpoint (Protected)
app.get("/api/stats", authenticateToken, async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const activeLeads = await Lead.countDocuments({ status: "active" });
    const respondedLeads = await Lead.countDocuments({ status: "responded" });
    const pendingLeads = await Lead.countDocuments({ status: "pending" });

    res.json({
      totalLeads,
      activeLeads,
      respondedLeads,
      pendingLeads,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============ PROTECTED ROUTES ============
// Add authenticateToken middleware to routes that need protection

app.get("/leads", authenticateToken, async (req, res) => {
  try {
    const leads = await Lead.find().populate("staff response score");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... keep all other existing routes ...
// Add authenticateToken middleware to other sensitive routes as needed

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5. Update .env File

Add JWT secret to `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_min_32_characters_long_123456
PORT=3001
```

### 6. Create a Test User

Run this in your backend terminal to create a test admin user:

```javascript
// create-admin.js
require("dotenv").config();
const connectDB = require("./db/connect");
const Staff = require("./models/Staff");

const createAdmin = async () => {
  await connectDB();
  
  const admin = new Staff({
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", // Will be hashed automatically
    role: "admin"
  });

  await admin.save();
  console.log("Admin user created successfully!");
  process.exit();
};

createAdmin();
```

Run it:
```bash
node create-admin.js
```

## Testing the Login

### Login Credentials:
- **Email**: admin@example.com
- **Password**: admin123

### Test with Postman or curl:

```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
```

## Start Both Servers

### Terminal 1 - Backend:
```bash
cd ..\lead-response-backend
node server.js
```

### Terminal 2 - Frontend:
```bash
cd lead-response-frontend
npm start
```

## Next Steps

1. Install the required npm packages
2. Update the Staff model
3. Create the auth middleware folder and file
4. Update server.js with the new routes
5. Add JWT_SECRET to .env
6. Create an admin user
7. Test the login from your frontend

Your frontend is already configured and ready to work with these backend changes!
