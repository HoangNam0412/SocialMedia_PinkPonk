import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/atoms/Avatar';
import { useAuth } from '../contexts/AuthContext';
import friendshipService from '../services/friendship';
import userService, { UserPublicResponse } from '../services/user';

const UserSearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserPublicResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'friends' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Get all users with search keyword
        const usersData = await userService.getAllUsersPublic(searchTerm);
        setUsers(usersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user, searchTerm]);

  // Filter users based on filter
  const filteredUsers = users.filter(u => {
    if (filter === 'friends') {
      return u.friendshipStatus === 'ACCEPTED';
    } else if (filter === 'pending') {
      return u.friendshipStatus === 'PENDING' || u.friendshipStatus === 'REQUESTED';
    } else {
      return true;
    }
  });

  // Handle navigation to user profile
  const navigateToUserProfile = (userId: number, e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/profile/${userId}`);
  };

  // Handle friend request
  const handleFriendRequest = async (userId: number) => {
    if (!user?.id) return;
    
    try {
      await friendshipService.sendFriendRequest(Number(user.id), userId);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          friendshipStatus: 'PENDING' 
        } : u
      ));
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Failed to send friend request. Please try again.');
    }
  };

  // Handle cancel friend request
  const handleCancelRequest = async (userId: number, friendshipId?: number) => {
    if (!friendshipId) return;
    
    try {
      await friendshipService.deleteFriendRequest(friendshipId);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          friendshipStatus: undefined,
          friendshipId: undefined 
        } : u
      ));
    } catch (err) {
      console.error('Error canceling friend request:', err);
      alert('Failed to cancel friend request. Please try again.');
    }
  };

  // Handle unfriend
  const handleUnfriend = async (userId: number, friendshipId?: number) => {
    if (!friendshipId) return;
    
    try {
      await friendshipService.deleteFriendRequest(friendshipId);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          friendshipStatus: undefined,
          friendshipId: undefined 
        } : u
      ));
    } catch (err) {
      console.error('Error unfriending user:', err);
      alert('Failed to unfriend user. Please try again.');
    }
  };

  // Handle accept friend request
  const handleAcceptRequest = async (userId: number, friendshipId?: number) => {
    if (!friendshipId) return;
    
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          friendshipStatus: 'ACCEPTED'
        } : u
      ));
    } catch (err) {
      console.error('Error accepting friend request:', err);
      alert('Failed to accept friend request. Please try again.');
    }
  };

  // Handle reject friend request
  const handleRejectRequest = async (userId: number, friendshipId?: number) => {
    if (!friendshipId) return;
    
    try {
      await friendshipService.deleteFriendRequest(friendshipId);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          friendshipStatus: 'REJECTED'
        } : u
      ));
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      alert('Failed to reject friend request. Please try again.');
    }
  };

  // Effect for loading state
  useEffect(() => {
    if (filter !== 'all') {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filter]);

  // Check if the friend request is incoming (REQUESTED)
  const isIncomingRequest = (user: UserPublicResponse) => {
    return user.friendshipStatus === 'REQUESTED';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-[#2D1A24] dark:to-[#1F1720]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-300">Tìm kiếm người dùng</h1>
          <p className="mt-2 text-pink-500/70 dark:text-pink-400/70">
            Tìm kiếm và kết bạn với những người dùng khác trên PinkPonk
          </p>
        </div>

        <div className="mb-8 rounded-xl bg-white p-5 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-[#2A1C22]/50 dark:shadow-pink-900/5">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, tên người dùng hoặc giới thiệu..."
                className="w-full rounded-full border border-pink-200 bg-pink-50/50 px-5 py-3 pl-12 text-pink-800 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:border-pink-900/30 dark:bg-pink-900/10 dark:text-pink-100 dark:placeholder-pink-400/30 dark:focus:border-pink-700 dark:focus:ring-pink-700/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-pink-400 dark:text-pink-500/70"></i>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 dark:text-pink-500 dark:hover:text-pink-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                className={`rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 dark:bg-pink-600 dark:shadow-pink-900/30 dark:hover:bg-pink-700'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50'
                }`}
                onClick={() => setFilter('all')}
              >
                <i className="fas fa-users mr-2"></i>
                Tất cả
              </button>
              <button
                className={`rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 ${
                  filter === 'friends'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 dark:bg-pink-600 dark:shadow-pink-900/30 dark:hover:bg-pink-700'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50'
                }`}
                onClick={() => setFilter('friends')}
              >
                <i className="fas fa-user-friends mr-2"></i>
                Bạn bè
              </button>
              <button
                className={`rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 ${
                  filter === 'pending'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 dark:bg-pink-600 dark:shadow-pink-900/30 dark:hover:bg-pink-700'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50'
                }`}
                onClick={() => setFilter('pending')}
              >
                <i className="fas fa-clock mr-2"></i>
                Đang chờ
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600 shadow-sm dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2 text-xl text-red-500"></i>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500 dark:border-pink-900 dark:border-t-pink-400"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-[#2A1C22]/50 dark:shadow-pink-900/5"
                onClick={(e) => navigateToUserProfile(user.id, e)}
              >
                <div className="relative h-32 bg-gradient-to-r from-pink-400 to-pink-500 dark:from-pink-700 dark:to-pink-800">
                  {user.coverPhoto && (
                    <img 
                      src={user.coverPhoto} 
                      alt="Cover" 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute -bottom-10 left-4">
                    <Avatar
                      src={user.avatarUrl || ''}
                      alt={user.fullName}
                      size="lg"
                      className="border-4 border-white ring-2 ring-pink-300/20 transition-transform duration-300 group-hover:scale-105 dark:border-[#2A1C22] dark:ring-pink-900/30"
                    />
                  </div>
                </div>
                <div className="mt-14 p-4">
                  <h3 className="text-xl font-semibold text-pink-700 dark:text-pink-300">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-pink-500/70 dark:text-pink-400/70">@{user.username}</p>
                  <p className="mt-2 line-clamp-2 min-h-[40px] text-sm text-gray-600 dark:text-gray-300">{user.bio || 'Không có giới thiệu'}</p>
                  <div className="mt-4 flex justify-end">
                    {user.friendshipStatus === 'ACCEPTED' ? (
                      <button
                        className="flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 transition-all duration-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnfriend(user.id, user.friendshipId);
                        }}
                      >
                        <i className="fas fa-user-minus mr-2"></i>
                        Bạn bè
                      </button>
                    ) : user.friendshipStatus === 'REQUESTED' ? (
                      <div className="flex space-x-2">
                        <button
                          className="flex items-center rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-500/20 transition-all duration-200 hover:bg-pink-600 dark:bg-pink-600 dark:shadow-pink-900/30 dark:hover:bg-pink-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptRequest(user.id, user.friendshipId);
                          }}
                        >
                          <i className="fas fa-check mr-2"></i>
                          Chấp nhận
                        </button>
                        <button
                          className="flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 transition-all duration-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectRequest(user.id, user.friendshipId);
                          }}
                        >
                          <i className="fas fa-times mr-2"></i>
                          Từ chối
                        </button>
                      </div>
                    ) : user.friendshipStatus === 'PENDING' ? (
                      <button
                        className="flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 transition-all duration-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelRequest(user.id, user.friendshipId);
                        }}
                      >
                        <i className="fas fa-clock mr-2"></i>
                        Đang chờ
                      </button>
                    ) : (
                      <button
                        className="flex items-center rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-500/20 transition-all duration-200 hover:bg-pink-600 dark:bg-pink-600 dark:shadow-pink-900/30 dark:hover:bg-pink-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFriendRequest(user.id);
                        }}
                      >
                        <i className="fas fa-user-plus mr-2"></i>
                        Kết bạn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-md transition-all duration-300 hover:shadow-lg dark:bg-[#2A1C22]/50 dark:shadow-pink-900/5">
            <div className="mb-4 rounded-full bg-pink-100 p-5 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
              <i className="fas fa-search text-4xl"></i>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-pink-700 dark:text-pink-300">
              Không tìm thấy kết quả
            </h3>
            <p className="text-pink-500/70 dark:text-pink-400/70">
              Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
            </p>
          </div>
        )}

        {filteredUsers.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-pink-500/70 dark:text-pink-400/70">
              Hiển thị {filteredUsers.length} người dùng
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700 transition-all duration-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50">
                <i className="fas fa-chevron-left mr-2"></i>
                Trước
              </button>
              <button className="flex items-center rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-500/20 transition-all duration-200 hover:bg-pink-600 dark:bg-pink-600 dark:shadow-pink-900/30 dark:hover:bg-pink-700">
                Sau
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch; 