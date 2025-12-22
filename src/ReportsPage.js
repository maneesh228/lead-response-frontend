import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import ReportsDashboard from "./ReportsDashboard";

function ReportsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get("http://localhost:3001/leads", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLeads(response.data || []);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return <ReportsDashboard leads={leads} />;
}

export default ReportsPage;
