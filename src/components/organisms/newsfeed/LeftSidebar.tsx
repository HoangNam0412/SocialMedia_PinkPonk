import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import userService, { FriendResponse } from '../../../services/user';
import Avatar from '../../atoms/Avatar';
import NewMessageComponent from '../../messenger/NewMessageComponent';

const LeftSidebar: React.FC<{className?:string}> = ({className}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const pathName = location?.pathname.split('/')[1];

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const friendsData = await userService.getUserFriends(Number(user.id));
        setFriends(friendsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const handleNavigateToProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const handleChatClick = (e: React.MouseEvent, friendId: number) => {
    e.stopPropagation(); // Prevent navigating to profile
    setActiveChatId(activeChatId === friendId ? null : friendId);
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  const getActiveFriend = () => {
    return friends.find(friend => friend.id === activeChatId);
  };

  const filteredFriends = searchTerm 
    ? friends.filter(friend => 
        friend.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : friends;

  return (
    <div className={`bg-gradient-to-br from-pink-50 to-white scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent sticky top-[56px] h-[calc(100vh-56px)] w-[22.5rem] overflow-y-auto rounded-xl px-4 py-5 shadow-md transition-all duration-300 dark:from-[#2D1A24] dark:to-[#1F1720] dark:scrollbar-thumb-pink-900 ${className}`}>
      {/* Navigation Tabs */}
      <div className="mb-6 space-y-2">
        <div 
          className={`flex cursor-pointer items-center space-x-3 rounded-xl p-3 transition-all duration-200 
            ${pathName === '' || !pathName ? 
              'bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20 shadow-md' : 
              'hover:bg-pink-100/50 dark:hover:bg-pink-900/20'}`}
          onClick={() => navigate('/')}
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-full 
            ${pathName === '' || !pathName ? 'bg-pink-200 dark:bg-pink-800/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
            <i className={`fas fa-home text-lg ${pathName === '' || !pathName ? 'text-pink-600 dark:text-pink-300' : 'text-pink-500 dark:text-pink-400'}`}></i>
          </div>
          <span className={`text-base font-medium ${pathName === '' || !pathName ? 'text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-pink-100'}`}>
            Trang chủ
          </span>
        </div>

        <div 
          className={`flex cursor-pointer items-center space-x-3 rounded-xl p-3 transition-all duration-200 
            ${pathName === 'users' ? 
              'bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20 shadow-md' : 
              'hover:bg-pink-100/50 dark:hover:bg-pink-900/20'}`}
          onClick={() => navigate('/users')}
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-full 
            ${pathName === 'users' ? 'bg-pink-200 dark:bg-pink-800/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
            <i className={`fas fa-users text-lg ${pathName === 'users' ? 'text-pink-600 dark:text-pink-300' : 'text-pink-500 dark:text-pink-400'}`}></i>
          </div>
          <span className={`text-base font-medium ${pathName === 'users' ? 'text-pink-700 dark:text-pink-300' : 'text-gray-700 dark:text-pink-100'}`}>
            Người dùng
          </span>
        </div>

        <div 
          className="flex cursor-pointer items-center space-x-3 rounded-xl p-3 transition-all duration-200 hover:bg-pink-100/50 dark:hover:bg-pink-900/20"
          onClick={() => navigate('/profile')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
            <i className="fas fa-user text-lg text-pink-500 dark:text-pink-400"></i>
          </div>
          <span className="text-base font-medium text-gray-700 dark:text-pink-100">
            Trang cá nhân
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Tìm kiếm bạn bè..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full bg-pink-100/50 px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 dark:bg-pink-900/20 dark:text-pink-100 dark:placeholder-pink-300/50 dark:focus:ring-pink-700"
        />
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 dark:text-pink-500"></i>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 dark:text-pink-500 dark:hover:text-pink-300"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        )}
      </div>

      {/* Friends Section */}
      <div className="mb-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-pink-800 dark:text-pink-200">Bạn bè</h2>
          <span
            className="cursor-pointer text-sm text-pink-500 hover:text-pink-700 hover:underline dark:text-pink-400 dark:hover:text-pink-300"
            onClick={() => navigate('/users')}
          >
            Xem tất cả
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500 dark:border-pink-900 dark:border-t-pink-400"></div>
            <p className="text-sm text-pink-600 dark:text-pink-300">
              Đang tải danh sách bạn bè...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-lg bg-red-50 py-6 dark:bg-red-900/20">
            <i className="fas fa-exclamation-circle mb-2 text-2xl text-red-500"></i>
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            <button
              className="mt-3 rounded-full bg-pink-100 px-4 py-1 text-xs text-pink-500 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg bg-pink-50 py-8 dark:bg-pink-900/10">
            {searchTerm ? (
              <>
                <i className="fas fa-search mb-2 text-2xl text-pink-400"></i>
                <p className="text-sm text-pink-600 dark:text-pink-300">
                  Không tìm thấy bạn bè nào
                </p>
              </>
            ) : (
              <>
                <i className="fas fa-user-friends mb-2 text-2xl text-pink-400"></i>
                <p className="text-sm text-pink-600 dark:text-pink-300">
                  Bạn chưa có bạn bè nào
                </p>
                <button
                  className="mt-3 rounded-full bg-pink-100 px-4 py-1 text-xs text-pink-500 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
                  onClick={() => navigate('/users')}
                >
                  Tìm bạn bè
                </button>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {filteredFriends.map((friend, index) => (
              <li
                key={index}
                className="group relative flex cursor-pointer items-center space-x-3 rounded-lg p-2.5 transition-all duration-200 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                onClick={() => handleNavigateToProfile(friend.id)}
              >
                <div className="relative">
                  <Avatar
                    src={friend.avatarUrl}
                    alt={friend.fullName || 'User avatar'}
                    size="md"
                    className="border border-pink-200 transition-transform duration-300 group-hover:scale-105 dark:border-pink-800"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-[#1F1720]"></span>
                </div>
                <div className="min-w-0 flex-1 transition-all duration-200 group-hover:translate-x-0.5">
                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-pink-100">
                    {friend.fullName}
                  </p>
                </div>
                <button 
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-500 opacity-0 transition-all duration-200 hover:bg-pink-200 group-hover:opacity-100 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-800/70"
                  onClick={(e) => handleChatClick(e, friend.id)}
                  aria-label="Chat with friend"
                >
                  <i className="fas fa-comment text-xs"></i>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat popup */}
      {activeChatId && getActiveFriend() && (
        <NewMessageComponent 
          friend={getActiveFriend()!} 
          onClose={handleCloseChat} 
        />
      )}

      
    </div>
  );
};

export default LeftSidebar;
