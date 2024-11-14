import React from 'react';
import clsx from 'clsx';

const Logo = ({ src, alt, className }) => {
  return (
    <div className={clsx('flex justify-center items-center mb-5', className)}>
      <img src={src} alt={alt} className="max-w-xs" />
    </div>
  );
};

export default Logo;
