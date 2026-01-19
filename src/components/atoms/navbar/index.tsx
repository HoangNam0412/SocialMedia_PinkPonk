import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import MenuLogin from '../../menu/MenuLogin';
import MessageList from '../../messenger/MessageList';
import Avatar from '../Avatar';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadMessages, resetUnreadMessages, isMessageEditorOpen } = useNotification();
  const pathName = location?.pathname.split('/')[1];
  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMenuLogin = () => {
    setShowMenu((prev) => !prev);
  };

  const toggleMessageList = () => {
    setShowMessages((prev) => !prev);
    // Reset unread messages counter when opening the message list
    if (!showMessages) {
      resetUnreadMessages();
    }
  };

 
  return (
    <div>
      <MessageList
        isVisible={showMessages}
        onClose={() => setShowMessages(false)}
      />
      <MenuLogin isVisible={showMenu} onClose={() => setShowMenu(false)} />
      <div className="fixed z-50 w-full bg-gradient-to-r from-pink-50 via-pink-100 to-pink-200 shadow-lg transition-all duration-300 dark:from-[#1c1e21] dark:via-[#242526] dark:to-[#2a2c30]">
        <div className="mx-auto px-3 sm:px-4">
          <div className="flex h-16 justify-between">
            {/* Logo and Search - Left Section */}
            <div className="flex flex-shrink-0 items-center">
              <div className="flex items-center">
                <Link to="/" className="flex items-center group">
                  <span className="text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-300 transform group-hover:scale-105">
                    PinkPonk
                  </span>
                </Link>
              </div>
            </div>

            {/* User Actions - Right Section */}
            <div className="flex items-center justify-end space-x-4 pr-2">
              {/* Messages */}
              <div className="relative">
                <button
                  onClick={toggleMessageList}
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-200 text-pink-500 shadow-md transition-all duration-200 hover:from-pink-200 hover:to-pink-300 active:scale-95 dark:from-pink-900/30 dark:to-pink-800/40 dark:text-pink-300 dark:hover:from-pink-800/50 dark:hover:to-pink-700/60"
                  id="messages"
                >
                  <i className="fab fa-facebook-messenger text-lg transition-transform group-hover:scale-110"></i>
                  {unreadMessages > 0 && !isMessageEditorOpen && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white animate-pulse">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>
                <Tooltip
                  place="bottom"
                  anchorSelect="#messages"
                  content="Tin nhắn"
                />
              </div>

              {/* User Profile */}
              <Link to="/profile" className="group relative">
                <button className="flex h-10 items-center justify-center space-x-2 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 px-3 text-pink-800 shadow-md transition-all duration-200 hover:from-pink-200 hover:to-pink-300 active:scale-95 dark:from-pink-900/30 dark:to-pink-800/40 dark:text-pink-200 dark:hover:from-pink-800/50 dark:hover:to-pink-700/60">
                  <div className="relative">
                    <Avatar
                      src={user?.avatarUrl}
                      alt={user?.fullName || 'User avatar'}
                      size="sm"
                      className="border-2 border-pink-200 transition-all duration-300 group-hover:scale-105 dark:border-pink-800"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#242526]"></span>
                  </div>
                  {!isMobile && (
                    <div className="flex max-w-[120px] items-center overflow-hidden transition-all duration-200">
                      <p className="truncate text-sm font-semibold">
                        {user?.fullName || 'User'}
                      </p>
                    </div>
                  )}
                </button>
                <div className="absolute inset-0 rounded-full bg-pink-400 opacity-0 transition-opacity duration-200 group-hover:opacity-5"></div>
              </Link>

              {/* Menu */}
              <button
                onClick={toggleMenuLogin}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-200 text-pink-500 shadow-md transition-all duration-200 hover:from-pink-200 hover:to-pink-300 active:scale-95 dark:from-pink-900/30 dark:to-pink-800/40 dark:text-pink-300 dark:hover:from-pink-800/50 dark:hover:to-pink-700/60"
                id="menu"
              >
                <i className="fas fa-bars text-lg transition-transform group-hover:scale-110"></i>
              </button>
              <Tooltip place="bottom" anchorSelect="#menu" content="Menu" />
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="flex justify-around border-t border-pink-200/50 pb-2 dark:border-neutral-700/50">
              <Link
                to="/"
                className={`px-3 pt-2 transition-all duration-200 ${pathName === '' ? 'text-pink-500' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <div className="flex flex-col items-center">
                  <i className={`fas fa-home text-xl ${pathName === '' ? 'animate-pulse' : ''}`}></i>
                  <span className="mt-1 text-xs font-medium">Trang chủ</span>
                </div>
              </Link>
              <Link
                to="/users"
                className={`px-3 pt-2 transition-all duration-200 ${pathName === 'users' ? 'text-pink-500' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <div className="flex flex-col items-center">
                  <i className={`fas fa-users text-xl ${pathName === 'users' ? 'animate-pulse' : ''}`}></i>
                  <span className="mt-1 text-xs font-medium">Người dùng</span>
                </div>
              </Link>
              <button
                onClick={toggleMessageList}
                className={`px-3 pt-2 transition-all duration-200 text-gray-600 dark:text-gray-300`}
              >
                <div className="flex flex-col items-center relative">
                  <i className="fab fa-facebook-messenger text-xl"></i>
                  {unreadMessages > 0 && !isMessageEditorOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                  <span className="mt-1 text-xs font-medium">Tin nhắn</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
