import React from 'react';
import './ErrorMessage.css'; // Optional for additional styling

type ErrorMessageProps = {
  message: string;
  style?: React.CSSProperties;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, style }) => {
  return (
    <div className="centered-error" style={style}>
      <p>{message}</p>
    </div>
  );
};