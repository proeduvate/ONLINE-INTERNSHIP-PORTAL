import React from 'react';
import './Select.css';

export const Select = React.forwardRef(({ 
  label, 
  options = [], 
  error, 
  helpText, 
  className = '', 
  id,
  children,
  ...props 
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label} {props.required && <span className="select-required">*</span>}
        </label>
      )}
      <select 
        id={selectId}
        ref={ref}
        className={`select-field ${error ? 'select-error' : ''}`}
        {...props}
      >
        {options.length > 0 ? (
          options.map((opt, i) => (
            <option key={opt.value ?? i} value={opt.value}>
              {opt.label ?? opt.value}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && <span className="select-error-msg">{error}</span>}
      {helpText && !error && <span className="select-help">{helpText}</span>}
    </div>
  );
});

Select.displayName = 'Select';
