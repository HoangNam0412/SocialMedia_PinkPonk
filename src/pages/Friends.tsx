import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Mock data for friends and friend requests
const mockFriends = [
  {
    id: 1,
    fullName: 'Nguyễn Văn A',
    username: 'nguyenvana',
    avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    mutualFriends: 15,
    lastActive: '2024-03-15T10:30:00',
  },
  {
    id: 2,
    fullName: 'Trần Thị B',
    username: 'tranthib',
    avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    mutualFriends: 8,
    lastActive: '2024-03-15T09:45:00',
  },
  {
    id: 3,
    fullName: 'Lê Văn C',
    username: 'levanc',
    avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    mutualFriends: 12,
    lastActive: '2024-03-15T11:20:00',
  },
];

const mockFriendRequests = [
  {
    id: 4,
    fullName: 'Phạm Thị D',
    username: 'phamthid',
    avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    mutualFriends: 5,
    requestedAt: '2024-03-14T15:30:00',
  },
  {
    id: 5,
    fullName: 'Hoàng Văn E',
    username: 'hoangvane',
    avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
    mutualFriends: 3,
    requestedAt: '2024-03-14T16:45:00',
  },
];

const mockSentRequests = [
  {
    id: 6,
    fullName: 'Mai Thị F',
    username: 'maithif',
    avatarUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
    mutualFriends: 7,
    sentAt: '2024-03-14T14:20:00',
  },
];

const Friends: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'sent'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter friends based on search term
  const filteredFriends = mockFriends.filter(friend =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter friend requests based on search term
  const filteredRequests = mockFriendRequests.filter(request =>
    request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter sent requests based on search term
  const filteredSentRequests = mockSentRequests.filter(request =>
    request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle accept friend request
  const handleAcceptRequest = (requestId: number) => {
    // Handle accept friend request logic here
    console.log('Accept friend request:', requestId);
  };

  // Handle reject friend request
  const handleRejectRequest = (requestId: number) => {
    // Handle reject friend request logic here
    console.log('Reject friend request:', requestId);
  };

  // Handle cancel sent request
  const handleCancelRequest = (requestId: number) => {
    // Handle cancel sent request logic here
    console.log('Cancel sent request:', requestId);
  };

  // Handle unfriend
  const handleUnfriend = (friendId: number) => {
    // Handle unfriend logic here
    console.log('Unfriend:', friendId);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Bạn bè</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Quản lý danh sách bạn bè và lời mời kết bạn
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-neutral-800">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex space-x-4">
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600'
                }`}
                onClick={() => setActiveTab('all')}
              >
                <i className="fas fa-user-friends mr-2"></i>
                Tất cả bạn bè ({mockFriends.length})
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  activeTab === 'requests'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600'
                }`}
                onClick={() => setActiveTab('requests')}
              >
                <i className="fas fa-user-plus mr-2"></i>
                Lời mời kết bạn ({mockFriendRequests.length})
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  activeTab === 'sent'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600'
                }`}
                onClick={() => setActiveTab('sent')}
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Đã gửi ({mockSentRequests.length})
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bạn bè..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {activeTab === 'all' && (
            <>
              {filteredFriends.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-md dark:bg-neutral-800"
                    >
                      <img
                        src={friend.avatarUrl}
                        alt={friend.fullName}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {friend.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{friend.username}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {friend.mutualFriends} bạn chung
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnfriend(friend.id)}
                        className="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600"
                      >
                        <i className="fas fa-user-minus"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-white text-center dark:bg-neutral-800">
                  <i className="fas fa-user-friends mb-4 text-4xl text-gray-400"></i>
                  <p className="text-gray-500 dark:text-gray-400">Không tìm thấy bạn bè nào</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              {filteredRequests.length > 0 ? (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-md dark:bg-neutral-800"
                    >
                      <img
                        src={request.avatarUrl}
                        alt={request.fullName}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {request.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{request.username}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {request.mutualFriends} bạn chung
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                          Đồng ý
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-white text-center dark:bg-neutral-800">
                  <i className="fas fa-user-plus mb-4 text-4xl text-gray-400"></i>
                  <p className="text-gray-500 dark:text-gray-400">Không có lời mời kết bạn nào</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {filteredSentRequests.length > 0 ? (
                <div className="space-y-4">
                  {filteredSentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-md dark:bg-neutral-800"
                    >
                      <img
                        src={request.avatarUrl}
                        alt={request.fullName}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {request.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{request.username}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {request.mutualFriends} bạn chung
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600"
                      >
                        Hủy yêu cầu
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg bg-white text-center dark:bg-neutral-800">
                  <i className="fas fa-paper-plane mb-4 text-4xl text-gray-400"></i>
                  <p className="text-gray-500 dark:text-gray-400">Không có yêu cầu kết bạn nào đã gửi</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends; 