import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useAuth } from "./AuthContext";
import MessageReply from "./components/MessageReply";
import socketService from "./services/socketService";
import "./FacebookEnquiries.css";

function FacebookEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [filterText, setFilterText] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/facebook/enquiries", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEnquiries(response.data || []);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
        setError("Failed to load Facebook enquiries");
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [token]);

  // Socket.IO real-time updates
  // Socket.IO real-time updates
  const handleFacebookMessage = useCallback((data) => {
    console.log('New Facebook message received:', data);
    
    // Update enquiries list
    setEnquiries(prev => {
      const leadId = data.lead?._id || data.lead?.id || data.leadId;
      const existingIndex = prev.findIndex(e => 
        e._id === leadId || e.id === leadId
      );

      if (existingIndex !== -1) {
        // Update existing enquiry
        const updated = [...prev];
        const enquiry = updated[existingIndex];
        
        // Create new message object
        const newMessage = {
          id: data.messageId || `msg_${Date.now()}_${Math.random()}`,
          message: typeof data.message === 'string' ? data.message : (data.message?.text || data.message?.message || ''),
          from: data.from || data.senderId || 'unknown',
          createdAt: data.timestamp || data.createdAt || new Date().toISOString(),
          isFromPage: data.isFromPage || false
        };
        
        updated[existingIndex] = {
          ...enquiry,
          formData: {
            ...enquiry.formData,
            allMessages: [
              ...(enquiry.formData?.allMessages || []),
              newMessage
            ]
          }
        };

        // Update selected enquiry if it's the same one
        setSelectedEnquiry(current => {
          if (current && (current._id === leadId || current.id === leadId)) {
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

    // Listen for new Facebook messages
    socketService.onFacebookMessage(handleFacebookMessage);

    // Cleanup on unmount
    return () => {
      socketService.off('facebook:new_message', handleFacebookMessage);
    };
  }, [token, handleFacebookMessage]);

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
      id: data.message_id || data.id || `msg_${Date.now()}_${Math.random()}`,
      message: messageText,
      from: 'page',
      createdAt: new Date().toISOString(),
      isFromPage: true
    };

    console.log('Adding new message:', newMessage);

    // Update selected enquiry using functional update
    setSelectedEnquiry(current => {
      if (!current) return current;
      
      return {
        ...current,
        formData: {
          ...current.formData,
          allMessages: [
            ...(current.formData?.allMessages || []),
            newMessage
          ]
        }
      };
    });

    // Update enquiries list using functional update
    const leadId = data.leadId || result.leadId;
    setEnquiries(prev => prev.map(enq => {
      if (enq._id === leadId || enq.id === leadId) {
        return {
          ...enq,
          formData: {
            ...enq.formData,
            allMessages: [
              ...(enq.formData?.allMessages || []),
              newMessage
            ]
          }
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
      selector: row => row.createdAt || row.date,
      sortable: true,
      width: "180px",
      cell: row => formatDate(row.createdAt || row.date),
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
        <p>Loading Facebook enquiries...</p>
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
    <div className="facebook-enquiries">
      <div className="enquiries-header">
        <h2>Facebook Enquiries</h2>
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
              <p>No Facebook enquiries found</p>
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
                <span className="value">{formatDate(selectedEnquiry.createdAt || selectedEnquiry.date)}</span>
              </div>

              {selectedEnquiry.formData.allMessages && selectedEnquiry.formData.allMessages.length > 0 ? (
                <div className="conversation-section">
                  <span className="label">Conversation:</span>
                  <div className="conversation-container">
                    {[...selectedEnquiry.formData.allMessages]
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map((msg, index) => (
                      <div key={msg.id || index} className={`message-bubble ${msg.isFromPage || msg.from === 'page' ? 'staff' : 'customer'}`}>
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
                        <span className="message-time">{formatDate(selectedEnquiry.createdAt || selectedEnquiry.date)}</span>
                      </div>
                      <div className="message-text">{selectedEnquiry.message}</div>
                    </div>
                  </div>
                </div>
              )}

              <MessageReply 
                lead={{
                  ...selectedEnquiry,
                  channel: 'facebook',
                  facebookData: {
                    senderId: selectedEnquiry.senderId || 
                             selectedEnquiry.from || 
                             selectedEnquiry.formData?.from ||
                             (selectedEnquiry.formData?.allMessages?.[0]?.from)
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

export default FacebookEnquiries;
