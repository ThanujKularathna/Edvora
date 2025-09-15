import React from "react";

function StatsCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default StatsCard;
