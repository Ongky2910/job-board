
import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div
      className={`p-4 shadow-lg rounded-lg bg-white ${className}`}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children }) => {
  return <div className="space-y-2">{children}</div>;
};
