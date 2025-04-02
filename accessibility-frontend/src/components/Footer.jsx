// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-6 py-4 text-center text-gray-600 text-sm">
        © {currentYear} AccessiWheels. All rights reserved. Making the world more accessible, one place at a time.
      </div>
    </footer>
  );
};

export default Footer;