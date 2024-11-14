import React from 'react';
import clsx from 'clsx';

const InputField = ({ id, label, type, placeholder, value, onChange, showToggle, toggleVisibility }) => {
  return (
    <div className="mb-4 w-full">
      <label className="block text-white text-sm mb-2" htmlFor={id}>
        {label} 
      </label>
      <div className="flex flex-col items-center">
    
    </div>
      <div className="relative flex flex-col items-center justify-center">
        <input
          id={id}
          label={label}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={clsx(
            'w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none transition duration-200',
            {
              'focus:border-blue-500': type === 'text',
              'focus:border-red-500': type === 'password',
            }
          )}
          
            
        />
        {showToggle && (
          <span
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 cursor-pointer"
            onClick={toggleVisibility}
          >
            {type === 'password' ? '👁️' : '🙈'}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;