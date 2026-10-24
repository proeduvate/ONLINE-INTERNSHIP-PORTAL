import React from 'react';
import './Button.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const loadingClass = isLoading ? 'btn-loading' : '';
  const finalClassName = `${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`.trim();

  return (
    <button className={finalClassName} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="btn-spinner" />
      ) : null}
      <span className="btn-content">{children}</span>
    </button>
  );
};
