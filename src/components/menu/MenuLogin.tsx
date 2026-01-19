import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MenuLoginProps {
  isVisible: boolean;
  onClose: () => void;
}

const MenuLogin: React.FC<MenuLoginProps> = ({ isVisible, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
    logout();
    onClose(); // Close dropdown after action
    navigate('/login');
  };

  const handleAdminNavigation = () => {
    navigate('/admin');
    onClose(); // Close dropdown after action
  };

  // Check if user is an admin
  const isAdmin = user?.role === 'ADMIN';

  if (!isVisible) return null; // Hide component if not visible

  return (
    <div className="fixed right-4 top-[4rem] z-50 w-40 rounded-lg border border-pink-300 bg-pink-50 shadow-xl overflow-hidden dark:bg-[#2A1C22] dark:border-pink-800/40">
      {/* Admin option - only visible for admin users */}
      {isAdmin && (
        <button
          onClick={handleAdminNavigation}
          className="w-full px-4 py-2.5 text-left font-medium text-pink-800 dark:text-pink-300 transition hover:bg-pink-200/70 dark:hover:bg-pink-900/50 border-b border-pink-200 dark:border-pink-800/40 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          System Management
        </button>
      )}
      
      {/* Logout/Login button */}
      <button
        onClick={() => handleAuth()}
        className="w-full px-4 py-2.5 text-left font-medium text-pink-800 dark:text-pink-300 transition hover:bg-pink-200/70 dark:hover:bg-pink-900/50 flex items-center"
      >
        {user ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </>
        )}
      </button>
    </div>
  );
};

export default MenuLogin;
