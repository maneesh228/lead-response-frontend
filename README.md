# Facebook/Instagram Message Reply Integration Guide

## 📁 Files to Copy to Your Frontend Project

This folder contains all the necessary files to integrate Facebook and Instagram message reply functionality into your React frontend.

### Files Included:

1. **`facebookService.js`** - API service functions
2. **`MessageReply.jsx`** - React component for sending replies
3. **`MessageReply.css`** - Styles for the reply component
4. **`INTEGRATION_EXAMPLES.jsx`** - Multiple usage examples

---

## 🚀 Quick Start

### Step 1: Copy Files to Your Frontend Project

```bash
# Copy to your frontend project
cp facebookService.js C:\Users\mpmin\nithin_chettan_projects\lead-response-frontend\src\services\
cp MessageReply.jsx C:\Users\mpmin\nithin_chettan_projects\lead-response-frontend\src\components\
cp MessageReply.css C:\Users\mpmin\nithin_chettan_projects\lead-response-frontend\src\components\
```

### Step 2: Set Environment Variable

Create or update `.env` file in your frontend project:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 3: Import and Use

```jsx
import MessageReply from './components/MessageReply';
import { sendMessage } from './services/facebookService';

function MyComponent() {
  const lead = {
    _id: '123',
    name: 'John Doe',
    channel: 'facebook',
    facebookData: {
      senderId: 'USER_FB_ID'
    }
  };

  const handleMessageSent = (result) => {
    console.log('Message sent:', result);
  };

  return (
    <MessageReply 
      lead={lead} 
      onMessageSent={handleMessageSent}
    />
  );
}
```

---

## 📋 API Reference

### Service Functions

#### `sendMessage(channel, recipientId, message, leadId)`
Send a message to Facebook or Instagram based on channel.

**Parameters:**
- `channel` (string): 'facebook' or 'instagram'
- `recipientId` (string): The user's Facebook/Instagram ID
- `message` (string): The message text to send
- `leadId` (string, optional): Database lead ID to save the message

**Returns:** Promise<Object>

**Example:**
```javascript
import { sendMessage } from './services/facebookService';

const result = await sendMessage(
  'facebook',
  'FB_USER_ID',
  'Thank you for your inquiry!',
  'lead_id_123'
);

if (result.success) {
  console.log('Message sent!');
}
```

#### `sendFacebookMessage(recipientId, message, leadId)`
Send a message specifically to Facebook Messenger.

#### `sendInstagramMessage(recipientId, message, leadId)`
Send a message specifically to Instagram.

#### `getFacebookEnquiries()`
Fetch all Facebook enquiries from the database.

**Returns:** Promise<Array>

#### `getInstagramEnquiries()`
Fetch all Instagram enquiries from the database.

**Returns:** Promise<Object>

#### `syncFacebookEnquiries()`
Sync Facebook messages from Meta API to your database.

**Returns:** Promise<Object>

#### `syncInstagramEnquiries()`
Sync Instagram messages from Meta API to your database.

**Returns:** Promise<Object>

---

## 🎨 Component Props

### MessageReply Component

```jsx
<MessageReply 
  lead={leadObject}
  onMessageSent={callbackFunction}
/>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lead` | Object | Yes | Lead object containing recipient information |
| `onMessageSent` | Function | No | Callback function called after message is sent successfully |

**Lead Object Structure:**
```javascript
{
  _id: 'lead_id',
  name: 'Customer Name',
  channel: 'facebook' | 'instagram',
  facebookData: {
    senderId: 'RECIPIENT_ID', // Required for sending messages
    conversationId: 'conversation_id'
  },
  formData: {
    allMessages: [...] // Array of message objects
  }
}
```

---

## 💡 Usage Examples

See `INTEGRATION_EXAMPLES.jsx` for complete examples including:

1. ✅ Lead Details Page with Reply
2. ✅ Lead List with Reply Modal
3. ✅ Inline Reply in Accordion
4. ✅ Quick Reply Buttons
5. ✅ Messages Page with Auto-refresh

---

## 🎨 Customization

### Styling

The `MessageReply.css` file can be customized to match your design system:

```css
/* Change primary color */
.btn-primary {
  background: #your-brand-color;
}

/* Adjust spacing */
.message-reply-container {
  padding: your-padding;
  border-radius: your-radius;
}
```

### Component Customization

You can modify the `MessageReply.jsx` component to:
- Add emoji picker
- Add file attachments
- Add message templates
- Add character counter
- Add auto-save drafts

---

## 🔧 Backend API Endpoints Used

- `POST /api/facebook/send-message` - Send Facebook message
- `POST /api/instagram/send-message` - Send Instagram message
- `GET /api/facebook/enquiries` - Get Facebook enquiries
- `GET /api/instagram/enquiries` - Get Instagram enquiries
- `POST /api/facebook/sync` - Sync Facebook messages
- `POST /api/instagram/sync` - Sync Instagram messages

---

## 🛠️ Troubleshooting

### Error: "recipientId not found"
**Solution:** Ensure the lead object has `facebookData.senderId` populated.

```javascript
// Check before rendering
if (!lead?.facebookData?.senderId) {
  return <p>Cannot send message - recipient ID missing</p>;
}
```

### Error: "Failed to send message"
**Possible causes:**
1. Facebook/Instagram access token expired
2. Missing permissions (pages_messaging, instagram_manage_messages)
3. Recipient hasn't messaged you first (can't initiate new conversations)
4. API URL incorrect in .env file

### Messages not appearing in database
**Solution:** Make sure you're passing the `leadId` parameter:

```javascript
await sendMessage(channel, recipientId, message, leadId); // ← Include leadId
```

---

## 📱 Mobile Responsive

The component is fully responsive and works on mobile devices. The CSS includes media queries for screens < 768px.

---

## 🔐 Security Notes

- Never expose your Facebook Access Token in frontend code
- All sensitive operations happen on the backend
- The frontend only sends message text and recipient IDs
- API calls go through your backend server

---

## 🚦 Next Steps

1. Copy the files to your frontend project
2. Install any missing dependencies: `npm install` (no additional packages needed if you already have React)
3. Update your .env file with the correct API URL
4. Import and use the MessageReply component in your pages
5. Test sending messages to Facebook and Instagram

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend server is running on correct port
3. Check CORS settings in backend
4. Ensure Facebook/Instagram tokens are valid
5. Check backend terminal logs for detailed error messages

---

## ✨ Features

- ✅ Send replies to Facebook Messenger
- ✅ Send replies to Instagram DMs
- ✅ Auto-detect channel (Facebook/Instagram)
- ✅ Save sent messages to database
- ✅ Real-time success/error feedback
- ✅ Loading states
- ✅ Responsive design
- ✅ Easy to integrate
- ✅ Customizable styling

---

**Happy Coding! 🎉**
