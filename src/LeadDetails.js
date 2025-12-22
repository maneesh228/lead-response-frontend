import React from "react";

function LeadDetails({ lead, onClose }) {
  if (!lead) return null;
  return (
    <div className="lead-details">
      <h2>Lead Details</h2>
      <p>
        <strong>Channel:</strong> {lead.channel}
      </p>
      <p>
        <strong>Enquiry:</strong> {lead.enquiry}
      </p>
      <p>
        <strong>Status:</strong> {lead.status}
      </p>
      <p>
        <strong>Score:</strong> {lead.score?.value || "-"}
      </p>
      <h3>Staff Reply</h3>
      <p>{lead.response?.reply || "No reply yet"}</p>
      <h3>AI Analysis</h3>
      {lead.response?.aiAnalysis ? (
        <ul>
          <li>
            <strong>Tone:</strong> {lead.response.aiAnalysis.tone}
          </li>
          <li>
            <strong>Accuracy:</strong> {lead.response.aiAnalysis.accuracy}
          </li>
          <li>
            <strong>Professionalism:</strong>{" "}
            {lead.response.aiAnalysis.professionalism}
          </li>
          <li>
            <strong>Score:</strong> {lead.response.aiAnalysis.score}
          </li>
        </ul>
      ) : (
        <p>No AI analysis available.</p>
      )}
      <button className="lead-close-btn" onClick={onClose}>Close</button>
    </div>
  );
}

export default LeadDetails;
