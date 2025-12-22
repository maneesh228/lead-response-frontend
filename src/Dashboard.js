import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import socketService from "./services/socketService";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import "./Dashboard.css";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { token } = useAuth();
  const { notifications, clearNotifications } = useNotifications();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClearNotifications = () => {
    clearNotifications();
    setShowNotifications(false);
  };

  // Initialize socket connection when dashboard mounts
  useEffect(() => {
    if (token) {
      socketService.connect(token);
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <header className="topbar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="page-title">Lead Response Dashboard</h1>
          
          {/* Notification Bell */}
          <div className="notification-container">
            <button className="notification-bell" onClick={toggleNotifications}>
              <span className="bell-icon">🔔</span>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button className="clear-btn" onClick={handleClearNotifications}>
                      Clear All
                    </button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No new notifications</div>
                  ) : (
                    notifications.slice().reverse().map(notif => (
                      <div key={notif.id} className="notification-item">
                        <div className="notif-channel">{notif.channel}</div>
                        <div className="notif-content">
                          <strong>{notif.leadName}</strong>: {notif.message}
                        </div>
                        <div className="notif-time">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
