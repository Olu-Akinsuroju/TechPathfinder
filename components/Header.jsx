import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-indigo-200">
          Tech Path Finder
        </Link>
        {/* Add other nav links here if needed, e.g., About page */}
      </nav>
    </header>
  );
};

export default Header;
