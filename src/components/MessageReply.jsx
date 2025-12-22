// MessageReply Component
// Place this file in: src/components/MessageReply.jsx or MessageReply.js

import React, { useState } from 'react';
import { sendMessage } from '../services/facebookService';
import './MessageReply.css'; // Optional: Create corresponding CSS file

const MessageReply = ({ lead, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    const recipientId = lead?.facebookData?.senderId;
    
    if (!recipientId) {
      console.error('Lead data:', lead);
      setError(`Recipient ID not found. Available fields: ${Object.keys(lead || {}).join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendMessage(
        lead.channel || 'facebook',
        lead.facebookData.senderId,
        message,
        lead._id || lead.id
      );

      if (result.success) {
        setSuccess(true);
        setMessage(''); // Clear the input
        
        // Call callback to refresh messages or update UI
        if (onMessageSent) {
          onMessageSent({
            text: message,
            leadId: lead._id || lead.id,
            message_id: result.data?.message_id || result.data?.id
          });
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Handle error response from backend
        let errorMessage = 'Failed to send message';
        
        if (result.error) {
          // Check if it's a Facebook/Instagram API error
          if (result.error.error) {
            const fbError = result.error.error;
            
            // Handle specific Facebook error codes
            if (fbError.code === 10 && fbError.error_subcode === 2018278) {
              errorMessage = 'Message cannot be sent - The 24-hour messaging window has expired. The customer needs to send a new message first.';
            } else if (fbError.message) {
              errorMessage = fbError.message;
            }
          } else if (typeof result.error === 'string') {
            errorMessage = result.error;
          }
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      // Handle network or other errors
      let errorMessage = 'An error occurred while sending the message';
      
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        if (errorData.error && errorData.error.error) {
          const fbError = errorData.error.error;
          
          if (fbError.code === 10 && fbError.error_subcode === 2018278) {
            errorMessage = 'Message cannot be sent - The 24-hour messaging window has expired. The customer needs to send a new message first.';
          } else if (fbError.message) {
            errorMessage = fbError.message;
          }
        } else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="message-reply-container">
      <form onSubmit={handleSendMessage} className="message-reply-form">
        <div className="reply-header">
          <h3>Reply to {lead?.name || 'Customer'}</h3>
          <span className="channel-badge">
            {lead?.channel === 'instagram' || lead?.channel?.startsWith('instagram') 
              ? '📸 Instagram' 
              : '💬 Facebook'}
          </span>
        </div>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            ✅ Message sent successfully!
          </div>
        )}

        <div className="form-group">
          <textarea
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply here..."
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !message.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              <>
                <span>📤</span>
                Send Reply
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageReply;
