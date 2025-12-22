import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h4>Lead Response</h4>
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || "User"}</span>
            <span className="user-role">{user?.role || "Admin"}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className={`nav-item ${isActive("/dashboard")}`}>
            <Link to="/dashboard" className="nav-link">
              <i className="icon">📊</i>
              <span>Dashboard</span>
            </Link>
          </li>

          <li className={`nav-item ${isActive("/dashboard/leads")}`}>
            <Link to="/dashboard/leads" className="nav-link">
              <i className="icon">👥</i>
              <span>Leads</span>
            </Link>
          </li>

          <li className={`nav-item ${isActive("/dashboard/facebook-enquiries")}`}>
            <Link to="/dashboard/facebook-enquiries" className="nav-link">
              <i className="icon">📘</i>
              <span>Facebook Enquiries</span>
            </Link>
          </li>

          <li className={`nav-item ${isActive("/dashboard/instagram-enquiries")}`}>
            <Link to="/dashboard/instagram-enquiries" className="nav-link">
              <i className="icon">📷</i>
              <span>Instagram Enquiries</span>
            </Link>
          </li>

          <li className={`nav-item ${isActive("/dashboard/reports")}`}>
            <Link to="/dashboard/reports" className="nav-link">
              <i className="icon">📈</i>
              <span>Reports</span>
            </Link>
          </li>

          <li className="nav-item">
            <div
              className="nav-link submenu-toggle"
              onClick={() => toggleSubmenu("settings")}
            >
              <i className="icon">⚙️</i>
              <span>Settings</span>
              <i className={`arrow ${expandedMenus.settings ? "down" : "right"}`}>
                {expandedMenus.settings ? "▼" : "▶"}
              </i>
            </div>
            {expandedMenus.settings && (
              <ul className="submenu">
                <li className={isActive("/dashboard/settings/profile")}>
                  <Link to="/dashboard/settings/profile" className="submenu-link">
                    Profile
                  </Link>
                </li>
                <li className={isActive("/dashboard/settings/preferences")}>
                  <Link
                    to="/dashboard/settings/preferences"
                    className="submenu-link"
                  >
                    Preferences
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <i className="icon">🚪</i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
