
import React from "react";

export const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
