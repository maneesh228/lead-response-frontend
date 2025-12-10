import React, { useEffect, useState } from "react";
import axios from "axios";
import LeadList from "./LeadList";
import LeadDetails from "./LeadDetails";
import ReportsDashboard from "./ReportsDashboard";


function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/leads")
      .then((res) => {
        setLeads(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h1>Lead Response Monitoring Dashboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <LeadList leads={leads} onSelect={setSelectedLead} />
          <ReportsDashboard leads={leads} />
          <LeadDetails lead={selectedLead} onClose={() => setSelectedLead(null)} />
        </>
      )}
    </div>
  );
}

export default App;
