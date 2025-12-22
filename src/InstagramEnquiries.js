import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useAuth } from "./AuthContext";
import MessageReply from "./components/MessageReply";
import socketService from "./services/socketService";
import "./InstagramEnquiries.css";

function InstagramEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [filterText, setFilterText] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/instagram/enquiries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Instagram API Response:", response.data);
        
        // Handle the response structure with success, count, and data
        const data = response.data?.data || [];
        
        console.log("Processed enquiries:", data);
        setEnquiries(data);
      } catch (error) {
        console.error("Error fetching Instagram enquiries:", error);
        console.error("Error details:", error.response?.data);
        setError("Failed to load Instagram enquiries");
        setEnquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [token]);

  // Socket.IO real-time updates
  const handleInstagramMessage = useCallback((data) => {
    console.log('New Instagram message received:', data);
    
    // Update enquiries list
    setEnquiries(prev => {
      const leadId = data.lead?.id || data.leadId;
      const existingIndex = prev.findIndex(e => e.id === leadId);

      if (existingIndex !== -1) {
        // Update existing enquiry
        const updated = [...prev];
        const enquiry = updated[existingIndex];
        
        // Create new message object
        const newMessage = {
          messageId: data.messageId || `msg_${Date.now()}_${Math.random()}`,
          message: typeof data.message === 'string' ? data.message : (data.message?.text || data.message?.message || ''),
          from: data.from || data.senderId || 'unknown',
          createdAt: data.timestamp || data.createdAt || new Date().toISOString(),
          isFromPage: data.isFromPage || false,
          _id: `msg_${Date.now()}_${Math.random()}`
        };
        
        updated[existingIndex] = {
          ...enquiry,
          allMessages: [
            ...(enquiry.allMessages || []),
            newMessage
          ],
          messageCount: (enquiry.messageCount || 0) + 1,
          lastMessageTime: newMessage.createdAt
        };

        // Update selected enquiry if it's the same one
        setSelectedEnquiry(current => {
          if (current && current.id === leadId) {
            return updated[existingIndex];
          }
          return current;
        });

        return updated;
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (!token) return;

    // Connect to socket
    socketService.connect(token);

    // Listen for new Instagram messages
    socketService.onInstagramMessage(handleInstagramMessage);

    // Cleanup on unmount
    return () => {
      socketService.off('instagram:new_message', handleInstagramMessage);
    };
  }, [token, handleInstagramMessage]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
  };

  const handleMessageSent = (result) => {
    console.log('handleMessageSent called with:', result);
    
    // Extract data from response structure {success: true, data: {...}}
    const data = result.data || result;
    
    // Extract message text from various possible structures
    const messageText = data.text || data.message?.text || data.message?.message || data.message;
    
    if (!messageText) {
      console.error('No message text found in result:', result);
      return;
    }

    const newMessage = {
      messageId: data.message_id || data.id || `msg_${Date.now()}_${Math.random()}`,
      message: messageText,
      from: 'page',
      createdAt: new Date().toISOString(),
      isFromPage: true,
      _id: `msg_${Date.now()}_${Math.random()}`
    };

    console.log('Adding new message:', newMessage);

    // Update selected enquiry using functional update
    // setSelectedEnquiry(current => {
    //   if (!current) return current;
      
    //   return {
    //     ...current,
    //     allMessages: [
    //       ...(current.allMessages || []),
    //       newMessage
    //     ],
    //     messageCount: (current.messageCount || 0) + 1,
    //     lastMessageTime: new Date().toISOString()
    //   };
    // });

    // Update enquiries list using functional update
    const leadId = data.leadId || result.leadId;
    setEnquiries(prev => prev.map(enq => {
      if (enq.id === leadId) {
        return {
          ...enq,
          allMessages: [
            ...(enq.allMessages || []),
            newMessage
          ],
          messageCount: (enq.messageCount || 0) + 1,
          lastMessageTime: new Date().toISOString()
        };
      }
      return enq;
    }));
  };

  const columns = [
    {
      name: "Name",
      selector: row => row.name || "N/A",
      sortable: true,
      width: "180px",
    },
    {
      name: "Email",
      selector: row => row.email || "N/A",
      sortable: true,
      width: "220px",
    },
    {
      name: "Phone",
      selector: row => row.phone || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: "Status",
      selector: row => row.status || "new",
      sortable: true,
      width: "120px",
      cell: row => (
        <span className={`status-badge ${row.status || "new"}`}>
          {(row.status || "new").toUpperCase()}
        </span>
      ),
    },
    {
      name: "Message",
      selector: row => row.message || "",
      sortable: false,
      width: "250px",
      cell: row => (
        <div className="message-preview">
          {row.message ? row.message.substring(0, 60) + (row.message.length > 60 ? '...' : '') : 'No message'}
        </div>
      ),
    },
    {
      name: "Date",
      selector: row => row.receivedAt || row.lastMessageTime || row.createdAt,
      sortable: true,
      width: "180px",
      cell: row => formatDate(row.receivedAt || row.lastMessageTime || row.createdAt),
    },
    {
      name: "Actions",
      width: "120px",
      cell: row => (
        <button 
          className="btn-view-small" 
          onClick={() => setSelectedEnquiry(row)}
        >
          View
        </button>
      ),
    },
  ];

  const filteredEnquiries = enquiries.filter(
    item => 
      (item.name && item.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.phone && item.phone.includes(filterText)) ||
      (item.message && item.message.toLowerCase().includes(filterText.toLowerCase()))
  );

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        fontWeight: '600',
        fontSize: '14px',
        color: '#2c3e50',
        borderBottom: '2px solid #dee2e6',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        color: '#495057',
        '&:hover': {
          backgroundColor: '#f1f3f5',
          cursor: 'pointer',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        fontSize: '14px',
      },
    },
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status"></div>
        <p>Loading Instagram enquiries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="instagram-enquiries">
      <div className="enquiries-header">
        <h2>Instagram Enquiries</h2>
        <p className="text-muted">Total: {enquiries.length} enquiries</p>
      </div>

      <div className="table-controls">
        <input
          type="text"
          placeholder="Search enquiries..."
          className="search-input"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      <div className="table-container">
        <DataTable
          columns={columns}
          data={filteredEnquiries}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          responsive
          customStyles={customStyles}
          noDataComponent={
            <div className="no-data">
              <p>No Instagram enquiries found</p>
            </div>
          }
        />
      </div>

      {selectedEnquiry && (
        <div className="modal-overlay" onClick={() => setSelectedEnquiry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enquiry Details</h3>
              <button className="close-btn" onClick={() => setSelectedEnquiry(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{selectedEnquiry.name || "N/A"}</span>
              </div>

              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{selectedEnquiry.email || "N/A"}</span>
              </div>

              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">{selectedEnquiry.phone || "N/A"}</span>
              </div>

              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${selectedEnquiry.status || "new"}`}>
                  {(selectedEnquiry.status || "new").toUpperCase()}
                </span>
              </div>

              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{formatDate(selectedEnquiry.receivedAt || selectedEnquiry.lastMessageTime || selectedEnquiry.createdAt)}</span>
              </div>

              {selectedEnquiry.allMessages && selectedEnquiry.allMessages.length > 0 ? (
                <div className="conversation-section">
                  <span className="label">Conversation:</span>
                  <div className="conversation-container">
                    {[...selectedEnquiry.allMessages]
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map((msg, index) => (
                      <div key={msg.messageId || msg._id || index} className={`message-bubble ${msg.isFromPage || msg.from === 'page' ? 'staff' : 'customer'}`}>
                        <div className="message-header">
                          <span className="sender-name">{msg.isFromPage || msg.from === 'page' ? 'You (Staff)' : (selectedEnquiry.name || "Customer")}</span>
                          <span className="message-time">{formatDate(msg.createdAt)}</span>
                        </div>
                        <div className="message-text">{msg.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedEnquiry.message && (
                <div className="conversation-section">
                  <span className="label">Conversation:</span>
                  <div className="conversation-container">
                    <div className="message-bubble customer">
                      <div className="message-header">
                        <span className="sender-name">{selectedEnquiry.name || "Customer"}</span>
                        <span className="message-time">{formatDate(selectedEnquiry.receivedAt || selectedEnquiry.lastMessageTime)}</span>
                      </div>
                      <div className="message-text">{selectedEnquiry.message}</div>
                    </div>
                  </div>
                </div>
              )}

              <MessageReply 
                lead={{
                  ...selectedEnquiry,
                  channel: 'instagram',
                  facebookData: {
                    senderId: selectedEnquiry.senderId || 
                             selectedEnquiry.from ||
                             (selectedEnquiry.allMessages?.[0]?.from)
                  }
                }}
                onMessageSent={handleMessageSent}
              />
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setSelectedEnquiry(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstagramEnquiries;
