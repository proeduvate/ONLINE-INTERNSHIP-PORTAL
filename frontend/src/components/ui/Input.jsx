import React from 'react';
import './Input.css';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  helpText, 
  className = '', 
  id,
  ...props 
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {props.required && <span className="input-required">*</span>}
        </label>
      )}
      <input 
        id={inputId}
        ref={ref}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props} 
      />
      {error && <span className="input-error-msg">{error}</span>}
      {helpText && !error && <span className="input-help">{helpText}</span>}
    </div>
  );
});

Input.displayName = 'Input';
