import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Target, Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const NavLink = ({
    to,
    children,
    hasDropdown = false,
  }: {
    to: string;
    children: React.ReactNode;
    hasDropdown?: boolean;
  }) => (
    <div className="relative group">
      <Link
        to={to}
        className={`relative transition-colors duration-200 flex items-center ${
          isActive(to)
            ? 'text-blue-600 font-bold'
            : 'text-gray-700 hover:text-blue-600 font-semibold'
        }`}
        onMouseEnter={() => hasDropdown && setIsServicesOpen(true)}
      >
        {children}
        {hasDropdown && <ChevronDown className="h-4 w-4 ml-1" />}
        {isActive(to) && (
          <>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full opacity-20 blur-sm"></span>
          </>
        )}
        {!isActive(to) && (
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
        )}
      </Link>
    </div>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Target className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">PNWLeads</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/case-studies">Case Studies</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="flex items-center">
            <Link
              to="/contact"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-4 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/services"
                className="text-gray-700 hover:text-blue-600 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/case-studies"
                className="text-gray-700 hover:text-blue-600 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Case Studies
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
