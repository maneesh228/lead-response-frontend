# Backend Socket.IO Setup Instructions

## 1. Install Socket.IO on the backend
```bash
npm install socket.io
```

## 2. Update your backend server.js file

Add the following code to your Express server:

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket']
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Verify JWT token here
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'User:', socket.userId);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io to use in other files
module.exports = { io };

// Start server with Socket.IO
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.IO`);
});
```

## 3. Emit events when new messages arrive

In your webhook handlers or message processing code:

```javascript
// When Facebook message is received
const { io } = require('./server'); // Import io from server.js

// In your Facebook webhook handler
app.post('/api/facebook/webhook', async (req, res) => {
  // ... process webhook data ...
  
  // Emit to all connected clients
  io.emit('facebook:new_message', {
    leadId: lead._id,
    message: {
      message_id: messageId,
      text: messageText,
      from: senderId,
      timestamp: new Date().toISOString(),
      isFromPage: false
    }
  });
  
  res.status(200).send('EVENT_RECEIVED');
});

// When Instagram message is received
app.post('/api/instagram/webhook', async (req, res) => {
  // ... process webhook data ...
  
  io.emit('instagram:new_message', {
    leadId: lead.id,
    message: {
      message_id: messageId,
      text: messageText,
      from: senderId,
      timestamp: new Date().toISOString(),
      isFromPage: false
    }
  });
  
  res.status(200).send('EVENT_RECEIVED');
});

// When staff sends a message
app.post('/api/facebook/send-message', async (req, res) => {
  // ... send message logic ...
  
  io.emit('message:sent', {
    leadId: req.body.leadId,
    message: {
      message_id: result.message_id,
      text: req.body.message,
      from: 'page',
      timestamp: new Date().toISOString(),
      isFromPage: true
    }
  });
  
  res.json({ success: true, message: result });
});
```

## 4. Important: Change from app.listen() to server.listen()

Replace this:
```javascript
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

With this:
```javascript
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.IO`);
});
```

## 5. Verify CORS settings

Make sure your CORS middleware allows the frontend origin:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

After implementing these changes, restart your backend server and the Socket.IO connection should work!
