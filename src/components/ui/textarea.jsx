
import React from "react";

export const Textarea = ({ value, onChange, placeholder, className }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 border rounded-md ${className}`}
    />
  );
};
