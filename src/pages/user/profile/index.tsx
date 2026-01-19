import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../../components/atoms/Avatar';
import BackgroundImage from '../../../components/atoms/BackgroundImage';
import CreatePostBox from '../../../components/atoms/post/component/CreatePostBox';
import PostContainer from '../../../components/container/PostContainer';
import NewMessageComponent from '../../../components/messenger/NewMessageComponent';
import { useAuth } from '../../../contexts/AuthContext';
import friendshipService from '../../../services/friendship';
import userService, { FriendResponse, UserPublicResponse, UserRequest, UserResponse } from '../../../services/user';
import { TPostView } from '../../../types/post';
import EditAvatarModal from './components/EditAvatarModal';
import EditBioModal from './components/EditBioModal';
import EditCoverPhotoModal from './components/EditCoverPhotoModal';
import EditDetailModal from './components/EditDetailModal';

// Reusable fallback avatar component with user icon
const AvatarFallback: React.FC<{ friend: FriendResponse, className?: string, size?: string }> = ({ friend, className = "", size = "full" }) => {
  // Generate a consistent background color based on name
  const getBackgroundColor = () => {
    if (!friend.fullName) return 'bg-pink-400 dark:bg-pink-700';
    
    // Simple hash function to generate a number from a string
    const hash = friend.fullName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Use the hash to select from predefined colors
    const colors = [
      'bg-pink-400 dark:bg-pink-700',
      'bg-purple-400 dark:bg-purple-700',
      'bg-blue-400 dark:bg-blue-700',
      'bg-indigo-400 dark:bg-indigo-700',
      'bg-green-400 dark:bg-green-700',
      'bg-yellow-400 dark:bg-yellow-700',
      'bg-orange-400 dark:bg-orange-700',
      'bg-red-400 dark:bg-red-700',
    ];
    
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const bgColorClass = getBackgroundColor();
  const iconSize = size === 'small' ? 'text-xs' : 'text-base';

  return (
    <div className={`flex items-center justify-center rounded-full ${bgColorClass} text-white ${className}`}>
      <i className={`fas fa-user ${iconSize}`}></i>
    </div>
  );
};

// Friend avatar component with fallback
const FriendAvatar: React.FC<{ 
  friend: FriendResponse, 
  className?: string, 
  size?: string, 
  onClick?: () => void 
}> = ({ friend, className = "", size = "full", onClick }) => {
  const [hasError, setHasError] = useState(false);
  
  return (
    <div 
      onClick={onClick} 
      className={`h-full w-full ${onClick ? 'cursor-pointer' : ''}`}
    >
      {!friend.avatarUrl || hasError ? (
        <AvatarFallback friend={friend} className={className} size={size} />
      ) : (
        <img 
          src={friend.avatarUrl} 
          alt={friend.fullName || 'Friend'} 
          className={`object-cover ${className}`}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const [postsView, setPostsView] = useState<TPostView>('listView');
  const [user, setUser] = useState<UserResponse | UserPublicResponse | null>(null);
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBioModal, setShowBioModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showCoverPhotoModal, setShowCoverPhotoModal] = useState<boolean>(false);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [bioText, setBioText] = useState<string>('');
  const [savingBio, setSavingBio] = useState<boolean>(false);
  const [friendshipStatus, setFriendshipStatus] = useState<string | undefined>(undefined);
  const [friendshipId, setFriendshipId] = useState<number | undefined>(undefined);
  const [processingFriendship, setProcessingFriendship] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, refreshUser } = useAuth();
  const isOwnProfile = !id || (currentUser && currentUser.id === Number(id));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        let userData;
        if (isOwnProfile) {
          userData = await userService.getCurrentUserProfile();
        } else if (id) {
          userData = await userService.getUserPublicById(parseInt(id));
          
          // Set friendship status if viewing another user's profile
          if ('friendshipStatus' in userData) {
            setFriendshipStatus(userData.friendshipStatus);
            setFriendshipId(userData.friendshipId);
          }
        } else {
          throw new Error('User ID is required');
        }
        
        setUser(userData);
        if (userData?.bio) {
          setBioText(userData.bio);
        }
        
        // Fetch user's friends
        if (userData && 'id' in userData) {
          const friendsData = await userService.getUserFriends(userData.id);
          setFriends(friendsData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, isOwnProfile, currentUser?.id]);

  const handleEditProfile = () => {
    setShowDetailModal(true);
  };

  const handleEditBio = () => {
    if (user?.bio) {
      setBioText(user.bio);
    }
    setShowBioModal(true);
  };

  const handleEditDetails = () => {
    setShowDetailModal(true);
  };

  const handleEditCoverPhoto = () => {
    setShowCoverPhotoModal(true);
  };

  const handleEditAvatar = () => {
    setShowAvatarModal(true);
  };

  const handleSaveBio = async () => {
    if (!user || !('id' in user)) return;
    
    setSavingBio(true);
    try {
      const userData: UserRequest = {
        ...user,
        bio: bioText
      };
      
      await userService.updateUserProfile(user.id, userData);
      
      // Update local user state
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          bio: bioText
        };
      });
      
      // Update user in AuthContext if it's the current user's profile
      if (isOwnProfile) {
        await refreshUser();
      }
      
      setShowBioModal(false);
    } catch (err) {
      console.error('Error updating bio:', err);
    } finally {
      setSavingBio(false);
    }
  };

  const handleSaveDetails = async (userData: UserRequest) => {
    if (!user || !('id' in user)) return;
    
    const response = await userService.updateUserProfile(user.id, userData);
    
    // Update local user state with the new details
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        fullName: userData.fullName || prev.fullName,
        location: userData.location,
        age: userData.age,
        phoneNumber: userData.phoneNumber
      };
    });
    
    // Update user in AuthContext if it's the current user's profile
    if (isOwnProfile) {
      await refreshUser();
    }
    
    return response;
  };

  const handleSaveCoverPhoto = async (userData: UserRequest) => {
    if (!user || !('id' in user)) return;
    
    const response = await userService.updateUserProfile(user.id, userData);
    
    // Update local user state with the new cover photo
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        coverPhoto: userData.coverPhoto || prev.coverPhoto
      };
    });
    
    // Update user in AuthContext if it's the current user's profile
    if (isOwnProfile) {
      await refreshUser();
    }
    
    return response;
  };

  const handleSaveAvatar = async (userData: UserRequest) => {
    if (!user || !('id' in user)) return;
    
    const response = await userService.updateUserProfile(user.id, userData);
    
    // Update local user state with the new avatar
    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        avatarUrl: userData.avatarUrl || prev.avatarUrl
      };
    });
    
    // Update user in AuthContext if it's the current user's profile
    if (isOwnProfile) {
      await refreshUser();
    }
    
    return response;
  };

  // Handle friend request
  const handleFriendRequest = async () => {
    if (!currentUser?.id || !user || !('id' in user)) return;
    
    setProcessingFriendship(true);
    try {
      await friendshipService.sendFriendRequest(Number(currentUser.id), user.id);
      setFriendshipStatus('PENDING');
      
      // Refresh friends list
      const friendsData = await userService.getUserFriends(user.id);
      setFriends(friendsData);
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Lỗi khi gửi lời mời kết bạn. Vui lòng thử lại sau.');
    } finally {
      setProcessingFriendship(false);
    }
  };

  // Handle cancel friend request
  const handleCancelRequest = async () => {
    if (!friendshipId) return;
    
    setProcessingFriendship(true);
    try {
      await friendshipService.deleteFriendRequest(friendshipId);
      setFriendshipStatus(undefined);
      setFriendshipId(undefined);
      
      // Refresh friends list
      if (user && 'id' in user) {
        const friendsData = await userService.getUserFriends(user.id);
        setFriends(friendsData);
      }
    } catch (err) {
      console.error('Error canceling friend request:', err);
      alert('Lỗi khi hủy lời mời kết bạn. Vui lòng thử lại sau.');
    } finally {
      setProcessingFriendship(false);
    }
  };

  // Handle unfriend
  const handleUnfriend = async () => {
    if (!friendshipId) return;
    
    setProcessingFriendship(true);
    try {
      await friendshipService.deleteFriendRequest(friendshipId);
      setFriendshipStatus(undefined);
      setFriendshipId(undefined);
      
      // Refresh friends list
      if (user && 'id' in user) {
        const friendsData = await userService.getUserFriends(user.id);
        setFriends(friendsData);
      }
    } catch (err) {
      console.error('Error unfriending user:', err);
      alert('Lỗi khi hủy kết bạn. Vui lòng thử lại sau.');
    } finally {
      setProcessingFriendship(false);
    }
  };

  // Handle accept friend request
  const handleAcceptRequest = async () => {
    if (!friendshipId) return;
    
    setProcessingFriendship(true);
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      setFriendshipStatus('ACCEPTED');
      
      // Refresh friends list
      if (user && 'id' in user) {
        const friendsData = await userService.getUserFriends(user.id);
        setFriends(friendsData);
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      alert('Lỗi khi chấp nhận lời mời kết bạn. Vui lòng thử lại sau.');
    } finally {
      setProcessingFriendship(false);
    }
  };

  // Handle reject friend request
  const handleRejectRequest = async () => {
    if (!friendshipId) return;
    
    setProcessingFriendship(true);
    try {
      await friendshipService.deleteFriendRequest(friendshipId);
      setFriendshipStatus(undefined);
      setFriendshipId(undefined);
      
      // Refresh friends list
      if (user && 'id' in user) {
        const friendsData = await userService.getUserFriends(user.id);
        setFriends(friendsData);
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      alert('Lỗi khi từ chối lời mời kết bạn. Vui lòng thử lại sau.');
    } finally {
      setProcessingFriendship(false);
    }
  };

  // Handle messaging
  const handleSendMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user || !('id' in user)) return;
    
    // Toggle chat popup instead of navigating
    setActiveChatId(activeChatId === user.id ? null : user.id);
  };

  const handleCloseChat = () => {
    setActiveChatId(null);
  };

  const getActiveFriend = () => {
    return user && 'id' in user && activeChatId === user.id ? user as FriendResponse : null;
  };

  // Navigate to friend profile
  const navigateToFriendProfile = (friendId: number) => {
    navigate(`/profile/${friendId}`);
  };

  // Render friendship button based on status
  const renderFriendshipButton = () => {
    if (isOwnProfile) {
      return (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-pink-700 transition-all duration-200 hover:bg-pink-200 focus:outline-none dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
          onClick={handleEditProfile}
        >
          <i className="fas fa-pen mr-2"></i>Chỉnh sửa hồ sơ
        </motion.button>
      );
    }

    if (processingFriendship) {
      return (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-pink-700 transition-all duration-200 dark:bg-pink-900/30 dark:text-pink-300 opacity-70"
          disabled
        >
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang xử lý...
        </motion.button>
      );
    }

    switch (friendshipStatus) {
      case 'ACCEPTED':
        return (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-pink-700 transition-all duration-200 hover:bg-pink-200 focus:outline-none dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
            onClick={handleUnfriend}
          >
            <i className="fas fa-user-check mr-2"></i>Bạn bè
          </motion.button>
        );
      case 'PENDING':
        return (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-pink-700 transition-all duration-200 hover:bg-pink-200 focus:outline-none dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
            onClick={handleCancelRequest}
          >
            <i className="fas fa-clock mr-2"></i>Đã gửi lời mời
          </motion.button>
        );
      case 'REQUESTED':
        return (
          <div className="flex space-x-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-pink-600 hover:shadow-lg focus:outline-none dark:bg-pink-600 dark:hover:bg-pink-700"
              onClick={handleAcceptRequest}
            >
              <i className="fas fa-check mr-2"></i>Chấp nhận
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-pink-700 transition-all duration-200 hover:bg-pink-200 focus:outline-none dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
              onClick={handleRejectRequest}
            >
              <i className="fas fa-times mr-2"></i>Từ chối
            </motion.button>
          </div>
        );
      default:
        return (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-pink-600 hover:shadow-lg focus:outline-none dark:bg-pink-600 dark:hover:bg-pink-700"
            onClick={handleFriendRequest}
          >
            <i className="fas fa-user-plus mr-2"></i>Kết bạn
          </motion.button>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500 dark:border-pink-900 dark:border-t-pink-400"></div>
          <p className="mt-4 text-lg text-pink-600 dark:text-pink-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="rounded-lg bg-red-50 p-8 text-center shadow-lg dark:bg-red-900/20">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/30 dark:text-red-300">
              <i className="fas fa-exclamation-circle text-4xl"></i>
            </div>
          </div>
          <p className="text-xl text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="rounded-lg bg-pink-50 p-8 text-center shadow-lg dark:bg-pink-900/20">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-pink-100 p-3 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
              <i className="fas fa-user-slash text-4xl"></i>
            </div>
          </div>
          <p className="text-xl text-pink-600 dark:text-pink-300">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-pink-50 via-pink-50/70 to-white dark:from-[#2D1A24] dark:via-[#281820] dark:to-[#1F1720]">
      {/* Bio Edit Modal */}
      {showBioModal && (
        <EditBioModal
          setShowBioModal={setShowBioModal}
          bioText={bioText}
          setBioText={setBioText}
          handleSaveBio={handleSaveBio}
          savingBio={savingBio}
        />
      )}
      {/* Detail Edit Modal */}
      {showDetailModal && (
        <EditDetailModal
          user={user as UserResponse}
          setShowDetailModal={setShowDetailModal}
          onSaveDetails={handleSaveDetails}
        />
      )}
      {/* Cover Photo Edit Modal */}
      {showCoverPhotoModal && (
        <EditCoverPhotoModal
          user={user as UserResponse}
          setShowCoverPhotoModal={setShowCoverPhotoModal}
          onSaveCoverPhoto={handleSaveCoverPhoto}
        />
      )}
      {/* Avatar Edit Modal */}
      {showAvatarModal && (
        <EditAvatarModal
          user={user as UserResponse}
          setShowAvatarModal={setShowAvatarModal}
          onSaveAvatar={handleSaveAvatar}
        />
      )}
      
      {/* Chat popup */}
      {activeChatId && getActiveFriend() && (
        <NewMessageComponent 
          friend={getActiveFriend()!} 
          onClose={handleCloseChat} 
        />
      )}

      <div className="w-full shadow-xl">
        <div className="mx-auto h-full max-w-6xl">
          <div className="relative h-[30rem] max-h-[30rem] w-full rounded-b-xl overflow-hidden">
            {user.coverPhoto ? (
              <BackgroundImage
                src={user.coverPhoto}
                alt="Cover photo"
                className="h-full w-full object-cover"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
              </BackgroundImage>
            ) : (
              <div className="h-full w-full relative">
                {/* Animated gradient background when no cover photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500 dark:from-pink-700 dark:via-pink-800 dark:to-pink-900 animate-gradient-x">
                  {/* Wave pattern overlay */}
                  <div className="absolute inset-0 opacity-40">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="wave" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                          <path d="M0 15 Q 25 5, 50 15 T 100 15" fill="none" stroke="white" strokeWidth="2" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#wave)" />
                    </svg>
                  </div>
                  
                  {/* Floating bubbles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="bubble bubble-1"></div>
                    <div className="bubble bubble-2"></div>
                    <div className="bubble bubble-3"></div>
                    <div className="bubble bubble-4"></div>
                    <div className="bubble bubble-5"></div>
                  </div>
                  
                  {/* User's initials or name display in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-7xl font-bold text-white opacity-20 tracking-wider">
                      {user.fullName?.split(' ').map(name => name[0]).join('') || 'P'}
                    </h1>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            )}
            
            <div className="absolute flex w-full items-center justify-center" style={{ bottom: '-15px' }}>
              {isOwnProfile && (
                <div className="absolute bottom-[30px] right-[30px]">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-md transition-all duration-200 hover:bg-pink-50 hover:shadow-lg focus:outline-none dark:bg-[#2A1C22] dark:text-pink-300 dark:hover:bg-[#32222A] flex items-center space-x-2"
                    onClick={handleEditCoverPhoto}
                  >
                    <i className="fas fa-camera"></i>
                    <span className="ml-2">Chỉnh sửa ảnh bìa</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
              100% { transform: translateY(0px); }
            }
            
            @keyframes gradient-x {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            
            .animate-gradient-x {
              background-size: 200% 200%;
              animation: gradient-x 15s ease infinite;
            }
            
            .bubble {
              position: absolute;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(1px);
              box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
              animation: float 6s ease-in-out infinite;
            }
            
            .bubble-1 {
              width: 80px;
              height: 80px;
              top: 10%;
              left: 10%;
              animation-delay: 0s;
            }
            
            .bubble-2 {
              width: 60px;
              height: 60px;
              top: 20%;
              right: 20%;
              animation-delay: 1s;
            }
            
            .bubble-3 {
              width: 100px;
              height: 100px;
              bottom: 30%;
              right: 10%;
              animation-delay: 2s;
            }
            
            .bubble-4 {
              width: 50px;
              height: 50px;
              bottom: 10%;
              left: 20%;
              animation-delay: 3s;
            }
            
            .bubble-5 {
              width: 70px;
              height: 70px;
              top: 40%;
              left: 40%;
              animation-delay: 4s;
            }
          `}</style>
          <div className="mx-auto h-full px-10">
            <div className="flex items-end gap-5 border-b pb-5 dark:border-stone-700">
              <div className="z-10 -mt-20 h-[11.5rem] w-[11.5rem]">
                <div className="relative aspect-square">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.fullName || 'User avatar'}
                    size="xl"
                    className="w-full h-full rounded-full border-4 border-white shadow-xl dark:border-[#2A1C22]"
                  />
                  {isOwnProfile && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute bottom-2 right-2 rounded-full bg-pink-500 p-3 text-white shadow-md transition-all duration-200 hover:bg-pink-600 hover:shadow-lg focus:outline-none dark:bg-pink-600 dark:hover:bg-pink-700"
                      onClick={handleEditAvatar}
                    >
                      <i className="fas fa-camera"></i>
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="flex-1 flex-col pb-2">
                <h1 className="text-[2.25rem] font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-pink-500 dark:from-pink-300 dark:to-pink-400">
                   {user.fullName}
                </h1>
                <div className="mt-0.5 flex items-center">
                  <span className="cursor-pointer text-sm font-semibold text-pink-500/90 hover:underline dark:text-pink-400/90 flex items-center">
                    <i className="fas fa-user-friends mr-2"></i>
                    {friends.length} bạn bè
                  </span>
                  {friends.length > 0 && (
                    <div className="ml-3 flex -space-x-2">
                      {friends.slice(0, 3).map((friend, index) => (
                        <div key={index} className="relative h-7 w-7 rounded-full border-2 border-white dark:border-[#2A1C22] overflow-hidden">
                          <FriendAvatar 
                            friend={friend} 
                            className="h-full w-full" 
                            size="small"
                            onClick={() => navigateToFriendProfile(friend.id)}
                          />
                        </div>
                      ))}
                      {friends.length > 3 && (
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-pink-100 text-xs font-medium text-pink-500 dark:border-[#2A1C22] dark:bg-pink-900/40 dark:text-pink-300">
                          +{friends.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex w-full items-center justify-between">
                  <div className="mt-2 flex items-center">
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    {!isOwnProfile && renderFriendshipButton()}
                    
                    {!isOwnProfile && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-200 focus:outline-none dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50"
                        onClick={(e) => handleSendMessage(e)}
                      >
                        <i className="fas fa-comment-alt mr-2"></i>Tin nhắn
                      </motion.button>
                    )}
                    
                    {isOwnProfile && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-pink-700 transition-all duration-200 hover:bg-pink-200 focus:outline-none dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
                        onClick={handleEditProfile}
                      >
                        <i className="fas fa-pen mr-2"></i>Chỉnh sửa hồ sơ
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      {/* After bio content */}
      <div className="mx-auto my-6 h-full max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-2 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4 rounded-xl bg-white p-6 text-gray-600 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-[#2A1C22]/50 dark:text-gray-300 dark:shadow-pink-900/5"
            >
              <div className="flex items-center">
                <i className="fas fa-info-circle mr-2 text-pink-500 dark:text-pink-400"></i>
                <h2 className="text-xl font-bold text-pink-700 dark:text-pink-300">
                  Intro
                </h2>
              </div>
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="flex flex-col items-center">
                  {user.bio ? (
                    <p className="text-center text-base italic leading-relaxed">&ldquo;{user.bio}&rdquo;</p>
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">Chưa có giới thiệu</p>
                  )}
                </div>
                {isOwnProfile && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-full bg-pink-100 px-4 py-2.5 text-sm font-semibold text-pink-700 transition-all duration-200 hover:bg-pink-200 focus:outline-none dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
                    onClick={handleEditBio}
                  >
                    <i className="fas fa-edit mr-2"></i>Chỉnh sửa tiểu sử
                  </motion.button>
                )}
              </div>
              {'email' in user && (
                <div className="flex flex-col space-y-4 text-sm">
                  {user.age && (
                    <div className="flex items-center space-x-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
                        <i className="fas fa-birthday-cake"></i>
                      </span>
                      <p className="font-medium">Age: <span className="text-pink-600 dark:text-pink-300">{user.age}</span></p>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center space-x-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
                        <i className="fas fa-map-marker-alt"></i>
                      </span>
                      <p className="font-medium">
                        Lives in <span className="text-pink-600 dark:text-pink-300">{user.location}</span>
                      </p>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <p className="font-medium text-pink-600 dark:text-pink-300">{user.email}</p>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
                        <i className="fas fa-phone"></i>
                      </span>
                      <p className="font-medium text-pink-600 dark:text-pink-300">{user.phoneNumber}</p>
                    </div>
                  )}
                </div>
              )}

              {isOwnProfile && (
                <div className="mt-2">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-full bg-pink-100 px-4 py-2.5 text-sm font-semibold text-pink-700 transition-all duration-200 hover:bg-pink-200 focus:outline-none dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
                    onClick={handleEditDetails}
                  >
                    <i className="fas fa-user-edit mr-2"></i>Chỉnh sửa thông tin
                  </motion.button>
                </div>
              )}
               
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-[#2A1C22]/50 dark:shadow-pink-900/5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <i className="fas fa-user-friends mr-2 text-pink-500 dark:text-pink-400"></i>
                  <h2 className="text-xl font-bold text-pink-700 dark:text-pink-300">
                    Bạn bè
                  </h2>
                </div>
                <span className="text-sm font-semibold bg-pink-100 text-pink-600 px-2.5 py-1 rounded-full dark:bg-pink-900/40 dark:text-pink-300">
                  {friends.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-pink-500/90 dark:text-pink-400/90">
                  {friends.length > 0 ? `${friends.length} bạn bè` : 'Không có bạn bè'}
                </p>
                {friends.length > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer text-sm text-pink-600 hover:underline dark:text-pink-400 flex items-center"
                  >
                    <Link to={'/users'}>
                    Xem tất cả
                    <i className="fas fa-chevron-right ml-1 text-xs"></i>

                    </Link>
                  </motion.div>
                )}
              </div>
              
              {friends.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {friends.slice(0, 6).map((friend, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="relative rounded-lg overflow-hidden group cursor-pointer"
                      onClick={() => navigateToFriendProfile(friend.id)}
                    >
                      <div className="aspect-square flex items-center justify-center">
                        <FriendAvatar friend={friend} className="h-full w-full" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <p className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white text-center truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {friend.fullName}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          <div className="md:col-span-3">
            {/* Create post */}
            {isOwnProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center w-full"
              >
                <CreatePostBox className="w-full" />
              </motion.div>
            )}
            {/* post filter box */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 rounded-xl bg-white p-5 shadow-md transition-all duration-300 hover:shadow-lg dark:bg-[#2A1C22]/50 dark:shadow-pink-900/5"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-700">
                <div className="flex items-center">
                  <i className="fas fa-thumbtack mr-2 text-pink-500 dark:text-pink-400"></i>
                  <h2 className="text-xl font-bold text-pink-700 dark:text-pink-300">
                    Posts
                  </h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      postsView === 'listView'
                        ? 'bg-pink-500 text-white shadow-sm dark:bg-pink-600'
                        : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300'
                    }`}
                    onClick={() => setPostsView('listView')}
                  >
                    <i className="fas fa-list mr-1"></i> Danh sách
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      postsView === 'gridView'
                        ? 'bg-pink-500 text-white shadow-sm dark:bg-pink-600'
                        : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300'
                    }`}
                    onClick={() => setPostsView('gridView')}
                  >
                    <i className="fas fa-th-large mr-1"></i> Lưới
                  </motion.button>
                </div>
              </div>
              
            </motion.div>

            {/* user posts */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6"
            >
              <PostContainer postsView={postsView} userId={user ? Number(user.id) : undefined} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;