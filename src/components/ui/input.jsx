import React from "react";

export const Input = ({ label, type = "text", className, ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type={type}
        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
};
