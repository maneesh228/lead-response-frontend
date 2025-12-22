import React from "react";

function LeadList({ leads, onSelect }) {
  return (
    <div className="table-container">
      <div className="leads-header">
        <h2>All Leads</h2>
      </div>
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
          {leads.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                No leads found
              </td>
            </tr>
          ) : (
            leads.map((lead) => (
              <tr key={lead._id}>
                <td>{lead._id}</td>
                <td>{lead.channel}</td>
                <td>{lead.status}</td>
                <td>{lead.score?.value || "-"}</td>
                <td>
                  <button className="btn-details" onClick={() => onSelect(lead)}>
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LeadList;
