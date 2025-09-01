import React, { useState, useRef, useEffect } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onEditProfileClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onEditProfileClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useAuth();

  // Safely get user initials
  const getUserInitials = () => {
    try {
      if (currentUser) {
        const firstName = currentUser.firstName || '';
        const lastName = currentUser.lastName || '';
        
        if (firstName && lastName) {
          return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
        } else if (firstName) {
          return firstName.charAt(0).toUpperCase();
        } else if (lastName) {
          return lastName.charAt(0).toUpperCase();
        }
      }
      return '?';
    } catch (error) {
      console.error('Error getting user initials:', error);
      return '?';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) {
    return null;
  }

  const handleMenuAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center space-x-3">
          {currentUser.profileUrl ? (
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={currentUser.profileUrl}
              alt={currentUser.firstName + ' ' + currentUser.lastName}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {getUserInitials()}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-700">{currentUser.name}</div>
            <div className="text-xs text-gray-500">
              {currentUser.location?.district || 'Location not set'}
            </div>
          </div>
          <svg
            className={`ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* Profile Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {currentUser.verified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => handleMenuAction(onEditProfileClick)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              <Settings className="mr-3 h-4 w-4" />
              Edit Profile
            </button>

            <div className="border-t border-gray-100">
              <button
                onClick={() => handleMenuAction(logout)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
