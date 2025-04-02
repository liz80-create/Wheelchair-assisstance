// src/components/Alert.jsx
import React from 'react';

const Alert = ({ type = 'error', message }) => {
  if (!message) return null;

  const baseClasses = "p-4 rounded-md mb-4 text-sm";
  const typeClasses = {
    error: "bg-red-100 border border-red-400 text-red-700",
    success: "bg-green-100 border border-green-400 text-green-700",
    warning: "bg-yellow-100 border border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border border-blue-400 text-blue-700",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`} role="alert">
      <p>{message}</p>
    </div>
  );
};

export default Alert;