import React from 'react';
import clsx from 'clsx';

const Button = ({ onClick, text, type = 'primary', icon }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full py-2 rounded transition duration-200',
        {
          'bg-red-600 text-white hover:bg-red-700': type === 'primary',
          'bg-transparent text-red-600 hover:bg-red-700 border border-red-600': type === 'secondary',
        }
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;