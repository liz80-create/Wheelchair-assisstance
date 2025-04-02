// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-brand-blue mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-500 mb-8">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link
        to="/"
        className="inline-block bg-brand-blue hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;