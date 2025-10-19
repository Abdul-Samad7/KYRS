import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon, GlobeIcon, SearchIcon, BarChartIcon } from 'lucide-react';
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => {
    return location.pathname === path ? 'border-b-2 border-blue-400' : '';
  };
  return <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GlobeIcon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                ExoExplorer
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/" className={`text-gray-300 hover:text-white px-3 py-2 text-sm font-medium ${isActive('/')}`}>
                Home
              </Link>
              <Link to="/explore" className={`text-gray-300 hover:text-white px-3 py-2 text-sm font-medium ${isActive('/explore')}`}>
                Explore Exoplanets
              </Link>
              <Link to="/compare" className={`text-gray-300 hover:text-white px-3 py-2 text-sm font-medium ${isActive('/compare')}`}>
                Compare
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
              {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 ${isActive('/')}`} onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/explore" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 ${isActive('/explore')}`} onClick={() => setIsOpen(false)}>
              Explore Exoplanets
            </Link>
            <Link to="/compare" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 ${isActive('/compare')}`} onClick={() => setIsOpen(false)}>
              Compare
            </Link>
          </div>
        </div>}
    </nav>;
};
export default Navigation;