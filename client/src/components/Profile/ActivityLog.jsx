import React from "react";
import "./Profile.css";

export default function ActivityLog({ lastLogin, previousLogin }) {
  return (
    <div className="card2">
      <h3>Login Activity</h3>

      <div className="details-row">
        <label>Last Login</label>
        <div className="details-value">
          {lastLogin ? new Date(lastLogin).toLocaleString() : "No record"}
        </div>
      </div>

      <div className="details-row">
        <label>Previous Login</label>
        <div className="details-value">
          {previousLogin ? new Date(previousLogin).toLocaleString() : "No record"}
        </div>
      </div>
    </div>
  );
}
