import React from "react";

export function Checkbox({ checked, onChange, className = "" }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 text-green-500 border-gray-300 rounded ${className}`}
    />
  );
}
