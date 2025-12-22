import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import LeadList from "./LeadList";
import LeadDetails from "./LeadDetails";
import "./LeadsPage.css";

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
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

  return (
    <div className="leads-page">
      <LeadList leads={leads} onSelect={setSelectedLead} />
      {selectedLead && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedLead(null)}></div>
          <LeadDetails lead={selectedLead} onClose={() => setSelectedLead(null)} />
        </>
      )}
    </div>
  );
}

export default LeadsPage;
