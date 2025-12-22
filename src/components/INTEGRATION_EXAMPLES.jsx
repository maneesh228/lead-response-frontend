// Example: How to integrate MessageReply component into your existing pages
// This shows different usage patterns

// ========================================
// EXAMPLE 1: In a Lead Details Page/Modal
// ========================================

import React, { useState, useEffect } from 'react';
import MessageReply from '../components/MessageReply';
import { getFacebookEnquiries } from '../services/facebookService';

const LeadDetailsPage = ({ leadId }) => {
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch lead details
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      const enquiries = await getFacebookEnquiries();
      const selectedLead = enquiries.find(l => l._id === leadId);
      setLead(selectedLead);
      setMessages(selectedLead?.formData?.allMessages || []);
    } catch (error) {
      console.error('Error fetching lead:', error);
    }
  };

  const handleMessageSent = (result) => {
    // Refresh the lead details to show the new message
    fetchLeadDetails();
    
    // Or manually add the message to the list
    // const newMessage = {
    //   message: result.data.message,
    //   from: 'page',
    //   createdAt: new Date(),
    //   isFromPage: true
    // };
    // setMessages([newMessage, ...messages]);
  };

  return (
    <div className="lead-details-page">
      <h1>Lead Details</h1>
      
      {/* Lead Information */}
      <div className="lead-info">
        <h2>{lead?.name}</h2>
        <p>Email: {lead?.email}</p>
        <p>Phone: {lead?.phone}</p>
        <p>Status: {lead?.status}</p>
      </div>

      {/* Conversation History */}
      <div className="conversation-history">
        <h3>Conversation History</h3>
        <div className="messages-list">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.isFromPage ? 'from-page' : 'from-customer'}`}
            >
              <p>{msg.message}</p>
              <span className="timestamp">
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Component */}
      <MessageReply 
        lead={lead} 
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

// ========================================
// EXAMPLE 2: In a Lead List with Reply Modal
// ========================================

import React, { useState } from 'react';
import MessageReply from '../components/MessageReply';

const LeadListPage = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);

  const handleReplyClick = (lead) => {
    setSelectedLead(lead);
    setShowReplyModal(true);
  };

  const handleMessageSent = () => {
    setShowReplyModal(false);
    // Optionally refresh the leads list
  };

  return (
    <div className="lead-list-page">
      <h1>Leads</h1>
      
      <table className="leads-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Message</th>
            <th>Channel</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>{lead.message}</td>
              <td>{lead.channel}</td>
              <td>
                <button onClick={() => handleReplyClick(lead)}>
                  Reply
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn" 
              onClick={() => setShowReplyModal(false)}
            >
              ✕
            </button>
            <MessageReply 
              lead={selectedLead} 
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// EXAMPLE 3: Inline Reply in Accordion/Expandable Row
// ========================================

import React, { useState } from 'react';
import MessageReply from '../components/MessageReply';

const LeadAccordionItem = ({ lead }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="accordion-item">
      <div 
        className="accordion-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>{lead.name}</h3>
        <span>{lead.message}</span>
      </div>

      {isExpanded && (
        <div className="accordion-content">
          <div className="lead-details">
            <p><strong>Email:</strong> {lead.email}</p>
            <p><strong>Phone:</strong> {lead.phone}</p>
            <p><strong>Received:</strong> {new Date(lead.createdAt).toLocaleString()}</p>
          </div>

          <div className="conversation">
            <h4>Messages ({lead.formData?.messageCount || 0})</h4>
            {lead.formData?.allMessages?.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.isFromPage ? 'sent' : 'received'}`}>
                <p>{msg.message}</p>
              </div>
            ))}
          </div>

          <button 
            className="toggle-reply-btn"
            onClick={() => setShowReply(!showReply)}
          >
            {showReply ? 'Hide Reply' : 'Send Reply'}
          </button>

          {showReply && (
            <MessageReply 
              lead={lead}
              onMessageSent={() => {
                setShowReply(false);
                // Refresh or update messages
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ========================================
// EXAMPLE 4: Using the service directly (without component)
// ========================================

import { sendMessage } from '../services/facebookService';

const QuickReplyButton = ({ lead }) => {
  const sendQuickReply = async (template) => {
    try {
      const result = await sendMessage(
        lead.channel,
        lead.facebookData.senderId,
        template,
        lead._id
      );

      if (result.success) {
        alert('Message sent successfully!');
      }
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  };

  return (
    <div className="quick-replies">
      <button onClick={() => sendQuickReply('Thank you for your message! We will get back to you shortly.')}>
        Quick Reply 1
      </button>
      <button onClick={() => sendQuickReply('Hi! How can we help you today?')}>
        Quick Reply 2
      </button>
    </div>
  );
};

// ========================================
// EXAMPLE 5: With Auto-refresh after sending
// ========================================

import React, { useState, useEffect } from 'react';
import MessageReply from '../components/MessageReply';
import { getFacebookEnquiries, getInstagramEnquiries } from '../services/facebookService';

const MessagesPage = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const fbLeads = await getFacebookEnquiries();
      const igData = await getInstagramEnquiries();
      const allLeads = [...fbLeads, ...(igData.data || [])];
      setLeads(allLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const handleMessageSent = async (result) => {
    // Reload leads to get the updated conversation
    await loadLeads();
    
    // Update the selected lead with new message
    const updatedLead = leads.find(l => l._id === selectedLead._id);
    if (updatedLead) {
      setSelectedLead(updatedLead);
    }
    
    alert('Message sent successfully!');
  };

  return (
    <div className="messages-page">
      <div className="leads-sidebar">
        {leads.map(lead => (
          <div 
            key={lead._id}
            className={`lead-item ${selectedLead?._id === lead._id ? 'active' : ''}`}
            onClick={() => setSelectedLead(lead)}
          >
            <h4>{lead.name}</h4>
            <p>{lead.message}</p>
          </div>
        ))}
      </div>

      <div className="conversation-panel">
        {selectedLead ? (
          <>
            <div className="messages">
              {selectedLead.formData?.allMessages?.map((msg, idx) => (
                <div key={idx} className={msg.isFromPage ? 'sent' : 'received'}>
                  {msg.message}
                </div>
              ))}
            </div>
            <MessageReply 
              lead={selectedLead}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <p>Select a lead to view conversation</p>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
