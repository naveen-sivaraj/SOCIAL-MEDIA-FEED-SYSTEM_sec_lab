import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <AlertTriangle size={32} color="#ff7b7b" />
      <p>{message || "Something went wrong while fetching data."}</p>
      {onRetry && (
        <button className="back-btn" onClick={onRetry} style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
