// src/components/ui/Badge.jsx
import React from "react";

export function Badge({ children, color = "blue", className = "" }) {
  // Define colors
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
  };

  const appliedColor = colorClasses[color] || colorClasses.blue;

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${appliedColor} ${className}`}
    >
      {children}
    </span>
  );
}
