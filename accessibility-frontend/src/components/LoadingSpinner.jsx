// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-blue"></div>
    <p className="ml-4 text-lg text-gray-600">Loading...</p>
  </div>
);

export default LoadingSpinner;