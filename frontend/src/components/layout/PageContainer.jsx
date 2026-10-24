import React from 'react';
import './PageContainer.css';

export const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={`page-container ${className}`}>
      {children}
    </div>
  );
};

export const PageSection = ({ children, className = '' }) => {
  return (
    <section className={`page-section ${className}`}>
      {children}
    </section>
  );
};
