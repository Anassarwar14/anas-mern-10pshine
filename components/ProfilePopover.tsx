'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import LogOutButton from './LogOutButton';

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string | null;
}

interface ProfilePopoverProps {
  sidebarCollapsed?: boolean;
  isInNavbar?: boolean;
}

const ProfilePopover = ({ sidebarCollapsed = false, isInNavbar = false }: ProfilePopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`);
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

  const getInitials = (firstName: string, lastName?: string): string =>
    ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={popoverRef} className="relative">
      {/* Profile button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors 
          ${sidebarCollapsed ? 'justify-center' : ''} 
          ${isOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.firstName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user && getInitials(user.firstName, user.lastName)
          )}
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate">
                {user?.firstName}
              </div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <ChevronUp
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {/* Popover menu */}
      {isOpen && (
        <div
          className={`absolute z-50 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-primary-foreground overflow-hidden
            animate-in fade-in duration-200
            ${
              isInNavbar
                ? 'top-full mt-2 -translate-x-3/4 min-w-[240px] slide-in-from-top-2' // 👈 Navbar mode: dropdown below centered
                : sidebarCollapsed
                ? 'left-full ml-2 bottom-0 min-w-[240px] slide-in-from-left-2' // Sidebar collapsed
                : 'bottom-full mb-2 left-0 right-0 slide-in-from-bottom-2' // Sidebar expanded
            }`}
        >
          {/* User info for collapsed / mobile */}
          {(sidebarCollapsed || isInNavbar) && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white font-semibold">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user && getInitials(user.firstName, user.lastName)
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                    {user?.firstName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-1">
            <LogOutButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePopover;
