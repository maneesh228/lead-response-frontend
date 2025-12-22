# Authentication & Backend API Requirements

This frontend application expects the following backend API endpoints:

## Authentication Endpoint

### POST /api/login
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "Admin"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Protected Endpoints

All protected endpoints should accept the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### GET /api/stats
Returns dashboard statistics.

**Response:**
```json
{
  "totalLeads": 150,
  "activeLeads": 45,
  "respondedLeads": 90,
  "pendingLeads": 15
}
```

### GET /leads
Returns all leads (should be updated to /api/leads for consistency).

**Response:**
```json
[
  {
    "_id": "lead_id",
    "channel": "Email",
    "status": "active",
    "score": {
      "value": "hot"
    }
  }
]
```

## CORS Configuration

The backend should allow requests from the frontend origin (default: http://localhost:3000).

## Example Backend Routes (Express.js)

```javascript
// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials
  // Generate JWT token
  // Return user and token
  
  res.json({
    success: true,
    token: generatedToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Stats route (protected)
app.get('/api/stats', authenticateToken, async (req, res) => {
  // Calculate statistics
  res.json({
    totalLeads: total,
    activeLeads: active,
    respondedLeads: responded,
    pendingLeads: pending
  });
});

// Middleware for authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```
