import React from "react";

export function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition ${className}`}
    >
      {children}
    </button>
  );
}
