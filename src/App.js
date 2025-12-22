import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { NotificationProvider } from "./NotificationContext";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Home from "./Home";
import LeadsPage from "./LeadsPage";
import ReportsPage from "./ReportsPage";
import FacebookEnquiries from "./FacebookEnquiries";
import InstagramEnquiries from "./InstagramEnquiries";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="facebook-enquiries" element={<FacebookEnquiries />} />
            <Route path="instagram-enquiries" element={<InstagramEnquiries />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
