import React from "react";

function ReportsDashboard({ leads }) {
  // Example calculations
  const missed = leads.filter((l) => l.status === "missed").length;
  const delayed = leads.filter((l) => l.status === "delayed").length;
  const responded = leads.filter((l) => l.status === "responded").length;
  const hot = leads.filter((l) => l.score?.value === "hot").length;
  const warm = leads.filter((l) => l.score?.value === "warm").length;
  const cold = leads.filter((l) => l.score?.value === "cold").length;

  return (
    <div>
      <h2>Performance Reports</h2>
      <ul>
        <li>Missed Leads: {missed}</li>
        <li>Delayed Leads: {delayed}</li>
        <li>Responded Leads: {responded}</li>
        <li>Hot Leads: {hot}</li>
        <li>Warm Leads: {warm}</li>
        <li>Cold Leads: {cold}</li>
      </ul>
      {/* Add charts and more analytics here */}
    </div>
  );
}

export default ReportsDashboard;
