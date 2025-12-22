import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

function Home() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    respondedLeads: 0,
    pendingLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <h2>Welcome to Lead Response Dashboard</h2>
      <p className="text-muted mb-4">Here's an overview of your leads</p>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Total Leads</h3>
            <span className="card-icon">📊</span>
          </div>
          <div className="card-value">{stats.totalLeads || 0}</div>
          <p className="card-description">All time leads</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Leads</h3>
            <span className="card-icon">✅</span>
          </div>
          <div className="card-value">{stats.activeLeads || 0}</div>
          <p className="card-description">Currently active</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Responded</h3>
            <span className="card-icon">💬</span>
          </div>
          <div className="card-value">{stats.respondedLeads || 0}</div>
          <p className="card-description">Leads responded to</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending</h3>
            <span className="card-icon">⏳</span>
          </div>
          <div className="card-value">{stats.pendingLeads || 0}</div>
          <p className="card-description">Awaiting response</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
