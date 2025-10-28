'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, ChevronUp } from 'lucide-react';
import LogOutButton from './LogOutButton';


interface User{
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string | null;
}

const ProfilePopover = ({ sidebarCollapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    
    fetchUser();
  }, []);

  const getInitials = (firstName: string, lastName?: string): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={popoverRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 flex items-center gap-3 hover:bg-gray-100 transition-colors ${
          sidebarCollapsed ? 'justify-center' : ''
        } ${isOpen ? 'bg-gray-100' : ''}`}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
          ) : (
            user && getInitials(user?.firstName, user?.lastName)
          )}
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
            <ChevronUp
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            sidebarCollapsed ? 'left-full ml-2' : 'bottom-full mb-2'
          } ${
            sidebarCollapsed ? 'bottom-0' : 'left-0 right-0'
          } bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200`}
        >
          {/* User Info Section - Only show when collapsed */}
          {sidebarCollapsed && (
            <div className="p-3 border-b border-gray-100 min-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user && getInitials(user?.firstName, user?.lastName)
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className={`py-1 ${sidebarCollapsed ? 'min-w-[240px]' : ''}`}>
            <button
              onClick={() => {
                console.log('Opening settings...');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Settings</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <LogOutButton/>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePopover;