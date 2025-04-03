import React from "react";

export const Textarea = ({ value, onChange, placeholder, className, name, required }) => {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 border rounded-md ${className}`}
      required={required} 
    />
  );
};
