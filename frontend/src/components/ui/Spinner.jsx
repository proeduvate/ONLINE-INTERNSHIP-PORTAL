import React from 'react';
import './Spinner.css';

export const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <div className={`spinner spinner-${size} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
