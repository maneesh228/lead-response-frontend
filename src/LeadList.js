import React from "react";

function LeadList({ leads, onSelect }) {
  return (
    <div>
      <h2>All Leads</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Channel</th>
            <th>Status</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id}>
              <td>{lead._id}</td>
              <td>{lead.channel}</td>
              <td>{lead.status}</td>
              <td>{lead.score?.value || "-"}</td>
              <td>
                <button onClick={() => onSelect(lead)}>Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeadList;
