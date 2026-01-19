// Post.tsx
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Globe, Heart, ImageIcon, Lock, Maximize, MessageCircle, Share2, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import postService, { PostResponse } from '../../../services/post';
import reactionService from '../../../services/reaction';
import Avatar from '../Avatar';
import DropdownMenu from '../DropdownMenu';
import CommentPopup from './component/CommentPopup';
import ReportModal from './component/ReportModal';
import ShareModal from './component/ShareModal';

interface IProps {
  post: PostResponse;
  className?: string;
  onEditPost?: (postId: number) => void;
  onDeletePost?: (postId: number) => void;
  onReportPost?: (postId: number) => void;
  onSharePost?: (postId: number, shareText: string) => Promise<void>;
  onShareSuccess?: () => void;
  onCommentCountChange?: (postId: number, newCount: number) => void;
  isCommenting?: boolean;
}

// Popup Portal Component để render các popup vào root DOM
const PopupPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const portalRoot = document.getElementById('portal-root') || document.body;
  return ReactDOM.createPortal(children, portalRoot);
};

const Post: React.FC<IProps> = (props) => {
  const {
    post,
    className = '',
    onEditPost,
    onDeletePost,
    onReportPost,
    onSharePost,
    onShareSuccess,
    onCommentCountChange,
    isCommenting = false,
  } = props;
  const {
    author,
    content,
    mediaUrls,
    likeCount,
    commentCount,
    shareCount,
    likedByUser,
    createdAt,
    id,
    originalPost,
    privacy,
  } = post;
  const { user } = useAuth();

  // State to control comment popup visibility
  const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(likedByUser);
  const [likesCount, setLikesCount] = useState(likeCount);
  const [commentsCount, setCommentsCount] = useState(commentCount);
  const [sharesCount, setSharesCount] = useState(shareCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [originalPostDetails, setOriginalPostDetails] =
    useState<PostResponse | null>(null);
  const [isLoadingOriginalPost, setIsLoadingOriginalPost] = useState(false);
  
  // New state for image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const hasMultipleImages = mediaUrls && mediaUrls.length > 1;

  // Cập nhật state commentsCount khi props thay đổi
  useEffect(() => {
    if (post.commentCount !== commentsCount) {
      setCommentsCount(post.commentCount);
    }
  }, [post.commentCount]);

  // Fetch original post details if needed
  useEffect(() => {
    const fetchOriginalPostDetails = async () => {
      if (originalPost && originalPost.id && !originalPostDetails) {
        setIsLoadingOriginalPost(true);
        try {
          // Fetch all posts and find the one that matches the originalPost.id
          const allPosts = await postService.getPosts();
          const foundPost = allPosts.find((p) => p.id === originalPost.id);
          if (foundPost) {
            setOriginalPostDetails(foundPost);
          }
        } catch (error) {
          console.error('Error fetching original post details:', error);
        } finally {
          setIsLoadingOriginalPost(false);
        }
      }
    };

    fetchOriginalPostDetails();
  }, [originalPost, originalPostDetails]);

  // Function to toggle comment popup visibility
  const toggleCommentPopup = () => {
    setIsCommentPopupOpen(!isCommentPopupOpen);
  };

  // Function to toggle share modal visibility
  const toggleShareModal = () => {
    setIsShareModalOpen(!isShareModalOpen);
  };

  // Function to toggle report modal visibility
  const toggleReportModal = () => {
    setIsReportModalOpen(!isReportModalOpen);
  };

  // Function to handle like/unlike
  const handleLike = async () => {
    if (!user || isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      await reactionService.toggleReaction(Number(user.id), Number(id));
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the optimistic update if the API call fails
      setIsLiked(isLiked);
      setLikesCount(likeCount);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Handle share success
  const handleShareSuccess = () => {
    // Increment share count
    setSharesCount((prev) => prev + 1);

    // Call the parent component's callback if provided
    if (onShareSuccess) {
      onShareSuccess();
    }
  };

  // Handle comment success - Được sửa để đảm bảo callback được gọi đúng
  const handleCommentSuccess = () => {
    // Tăng số lượng bình luận
    const newCommentCount = commentsCount + 1;
    setCommentsCount(newCommentCount);
    
    // Thông báo cho component cha biết số lượng bình luận đã thay đổi
    if (onCommentCountChange) {
      onCommentCountChange(id, newCommentCount);
    }
  };

  // Format the date to a relative time (e.g., "2 giờ trước")
  const formatTime = (dateString: string) => {
    try {
      // Tách các phần từ chuỗi gốc
      const [timePart, datePart] = dateString.split(' '); // timePart = "13:27:53", datePart = "10/04/2025"
      const [day, month, year] = datePart.split('/');

      // Chuyển về dạng ISO
      const isoString = `${year}-${month}-${day}T${timePart}`;

      // Trả về khoảng cách đến hiện tại
      return formatDistanceToNow(new Date(isoString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return 'Vừa xong';
    }
  };

  // Handle dropdown menu actions
  const handleEdit = () => {
    if (onEditPost) {
      onEditPost(id);
    }
    setIsDropdownOpen(false);
  };

  const handleDelete = () => {
    console.log('deleting');

    if (onDeletePost) {
      onDeletePost(id);
    }
    setIsDropdownOpen(false);
  };

  const handleReport = () => {
    // Open the report modal instead of just calling the callback
    toggleReportModal();
    setIsDropdownOpen(false);
  };

  // Image gallery functions
  const showNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaUrls && mediaUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % mediaUrls.length);
    }
  };

  const showPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaUrls && mediaUrls.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + mediaUrls.length) % mediaUrls.length);
    }
  };

  const toggleLightbox = () => {
    setIsLightboxOpen(!isLightboxOpen);
  };

  const closeLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLightboxOpen(false);
  };

  // Get privacy icon based on privacy setting
  const getPrivacyIcon = () => {
    switch (privacy) {
      case 'PUBLIC':
        return (
          <div className="group relative">
            <div className="flex items-center space-x-1 rounded-full bg-pink-100/80 px-1.5 py-0.5 dark:bg-pink-900/40">
              <Globe size={11} className="text-pink-500 dark:text-pink-300" />
              <span className="text-[10px] font-medium text-pink-600 dark:text-pink-300">Công khai</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 z-10 w-16 -translate-x-1/2 transform rounded bg-black/80 px-2 py-1 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Bài viết công khai
            </div>
          </div>
        );
      case 'FRIENDS':
        return (
          <div className="group relative">
            <div className="flex items-center space-x-1 rounded-full bg-blue-100/80 px-1.5 py-0.5 dark:bg-blue-900/40">
              <Users size={11} className="text-blue-500 dark:text-blue-300" />
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-300">Bạn bè</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 z-10 w-16 -translate-x-1/2 transform rounded bg-black/80 px-2 py-1 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Chỉ bạn bè
            </div>
          </div>
        );
      case 'PRIVATE':
        return (
          <div className="group relative">
            <div className="flex items-center space-x-1 rounded-full bg-purple-100/80 px-1.5 py-0.5 dark:bg-purple-900/40">
              <Lock size={11} className="text-purple-500 dark:text-purple-300" />
              <span className="text-[10px] font-medium text-purple-600 dark:text-purple-300">Chỉ mình tôi</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 z-10 w-16 -translate-x-1/2 transform rounded bg-black/80 px-2 py-1 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Chỉ mình tôi
            </div>
          </div>
        );
      default:
        return (
          <div className="group relative">
            <div className="flex items-center space-x-1 rounded-full bg-pink-100/80 px-1.5 py-0.5 dark:bg-pink-900/40">
              <Globe size={11} className="text-pink-500 dark:text-pink-300" />
              <span className="text-[10px] font-medium text-pink-600 dark:text-pink-300">Public</span>
            </div>
            <div className="absolute -bottom-8 left-1/2 z-10 w-16 -translate-x-1/2 transform rounded bg-black/80 px-2 py-1 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Public post
            </div>
          </div>
        );
    }
  };

  // Render popup components
  const renderPopups = () => {
    return (
      <>
        {isCommentPopupOpen && (
          <PopupPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <CommentPopup
              isOpen={isCommentPopupOpen}
              onClose={toggleCommentPopup}
              post={post}
              onFinishAddComment={handleCommentSuccess}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              onReportPost={onReportPost}
            />
            </div>
          </PopupPortal>
        )}

        {isShareModalOpen && (
          <PopupPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <ShareModal
                isOpen={isShareModalOpen}
                onClose={toggleShareModal}
                postId={id}
                postContent={content || ''}
                postImage={
                  mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : undefined
                }
                mediaUrls={mediaUrls}
                onShareSuccess={handleShareSuccess}
              />
            </div>
          </PopupPortal>
        )}

        {isReportModalOpen && (
          <PopupPortal>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <ReportModal
                isOpen={isReportModalOpen}
                onClose={toggleReportModal}
                postId={id}
                authorId={author?.id || 0}
              />
            </div>
          </PopupPortal>
        )}
        
        {/* Lightbox for enlarged image view */}
        <AnimatePresence>
          {isLightboxOpen && mediaUrls && mediaUrls.length > 0 && (
            <PopupPortal>
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
              >
                <motion.div 
                  className="relative max-w-[90vw] max-h-[90vh] px-2"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                >
                  {/* Close button */}
                  <button 
                    className="absolute -top-12 right-2 z-50 p-2 text-white hover:bg-white/10 rounded-full"
                    onClick={closeLightbox}
                  >
                    <X size={24} />
                  </button>
                  
                  <img 
                    src={mediaUrls[currentImageIndex]} 
                    alt={`Post image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg mx-2"
                  />
                  
                  {/* Image counter */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                      <span className="bg-black/50 px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {mediaUrls.length}
                      </span>
                    </div>
                  )}
                  
                  {/* Navigation buttons for lightbox */}
                  {hasMultipleImages && (
                    <>
                      <button 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                        onClick={showPrevImage}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                        onClick={showNextImage}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </PopupPortal>
          )}
        </AnimatePresence>
      </>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0.8, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`h-auto w-full rounded-xl bg-gradient-to-br from-pink-50 to-white shadow-[0_8px_30px_-5px_rgba(224,178,203,0.3)] dark:from-[#2D1A24] dark:to-[#271520] ${className} transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(224,178,203,0.4)] dark:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)] border border-pink-100/30 dark:border-pink-800/20 backdrop-blur-sm hover:scale-[1.01] hover:-translate-y-1`}
      >
        <div className="flex items-center space-x-2 border-b border-pink-100/80 p-3 px-4 dark:border-pink-900/50">
          <Link to={`/profile/${author?.id}`} className="group relative">
            <motion.div whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Avatar
                src={author?.avatarUrl}
                alt={author?.fullName || 'User avatar'}
                size="sm"
                className="border-2 border-pink-300 shadow-sm"
              />
              <span className="absolute inset-0 rounded-full bg-pink-400 opacity-0 transition-opacity duration-200 group-hover:opacity-10"></span>
            </motion.div>
          </Link>

          <div className="flex flex-grow flex-col">
            <Link
              to={`/profile/${author?.id}`}
              className="inline-block transition-colors duration-200 hover:text-pink-600 dark:hover:text-pink-300"
            >
              <p className="text-sm font-semibold text-pink-800 dark:text-pink-200">
                {author?.fullName || 'Anonymous'}
              </p>
            </Link>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-thin text-pink-600 dark:text-pink-400">
                {formatTime(createdAt)}
              </span>
              <motion.div 
                initial={{ opacity: 0.6, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-1.5"
              >
                {getPrivacyIcon()}
              </motion.div>
            </div>
          </div>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="h-8 w-8 rounded-full text-pink-500 hover:bg-pink-100 focus:outline-none dark:text-pink-400 dark:hover:bg-pink-900/60"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <i className="fas fa-ellipsis-h"></i>
            </motion.button>
            <DropdownMenu
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              postAuthorId={author?.id ? String(author.id) : ''}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={handleReport}
            />
          </div>
        </div>

        {content && (
          <div className="px-5 py-4">
            <p className="whitespace-pre-line text-pink-900 dark:text-pink-100 leading-relaxed">
              {content}
            </p>
          </div>
        )}

        {originalPost && (
          <div className="mx-4 mb-4 rounded-lg border border-pink-200 bg-white/80 p-4 backdrop-blur-sm shadow-sm dark:border-pink-900/70 dark:bg-[#331B28]/90">
            <div className="mb-2 flex items-center space-x-2">
              {isLoadingOriginalPost ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-pink-200 dark:bg-pink-900/50"></div>
              ) : originalPostDetails?.author ? (
                <Link
                  to={`/profile/${originalPostDetails.author.id}`}
                  className="group relative"
                >
                  <Avatar
                    src={originalPostDetails.author.avatarUrl}
                    alt={
                      originalPostDetails.author.fullName ||
                      'Original post author'
                    }
                    size="sm"
                    className="border-2 border-pink-200 transition-transform duration-200 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 rounded-full bg-pink-400 opacity-0 transition-opacity duration-200 group-hover:opacity-10"></span>
                </Link>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
                  <i className="fas fa-retweet"></i>
                </div>
              )}

              <div className="flex flex-col">
                {isLoadingOriginalPost ? (
                  <div className="h-4 w-32 animate-pulse rounded bg-pink-200 dark:bg-pink-900/50"></div>
                ) : originalPostDetails?.author ? (
                  <Link
                    to={`/profile/${originalPostDetails.author.id}`}
                    className="inline-block transition-colors duration-200 hover:text-pink-600 dark:hover:text-pink-300"
                  >
                    <p className="text-sm font-semibold text-pink-800 dark:text-pink-200">
                      {originalPostDetails.author.fullName || 'Anonymous'}
                    </p>
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-pink-800 dark:text-pink-200">
                    Bài viết đã chia sẻ
                  </p>
                )}
                <span className="text-xs text-pink-600 dark:text-pink-400">
                  {formatTime(originalPost.createdAt)}
                </span>
              </div>
            </div>

            {originalPostDetails ? (
              <>
                {originalPostDetails.content && (
                  <p className="mb-2 text-sm text-pink-900 dark:text-pink-100">
                    {originalPostDetails.content}
                  </p>
                )}
              </>
            ) : isLoadingOriginalPost ? (
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-pink-100 dark:bg-pink-900/30"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-pink-100 dark:bg-pink-900/30"></div>
              </div>
            ) : null}
          </div>
        )}

        {/* Enhanced Image Display */}
        {mediaUrls && mediaUrls.length > 0 && (
          <div className="relative overflow-hidden mx-4 mb-2 rounded-xl shadow-inner">
            <motion.div 
              className={`w-full ${hasMultipleImages ? 'aspect-[4/3]' : 'max-h-[500px]'} bg-gradient-to-b from-pink-100/40 to-pink-100/20 dark:from-pink-900/20 dark:to-pink-900/10 relative overflow-hidden`}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={toggleLightbox}
            >
              {/* Main image with smooth transition */}
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={mediaUrls[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-pointer"
              />
              
              {/* Image count badge with glass effect */}
              {hasMultipleImages && (
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white px-2.5 py-1.5 rounded-full text-xs font-medium flex items-center shadow-md">
                  <ImageIcon size={14} className="mr-1.5" />
                  {currentImageIndex + 1}/{mediaUrls.length}
                </div>
              )}
              
              {/* Lightbox button with improved styling */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/60 transition-colors shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLightbox();
                }}
              >
                <Maximize size={16} />
              </motion.button>
              
              {/* Navigation buttons with improved styling */}
              {hasMultipleImages && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full p-2 transition-colors shadow-md"
                    onClick={showPrevImage}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full p-2 transition-colors shadow-md"
                    onClick={showNextImage}
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </>
              )}
            </motion.div>
            
            {/* Image thumbnails with improved styling */}
            {mediaUrls.length > 2 && (
              <div className="flex mt-2 px-1 space-x-1.5 overflow-x-auto pb-1 hide-scrollbar">
                {mediaUrls.map((url, index) => (
                  <motion.div
                    key={index}
                    className={`h-16 w-16 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden ${
                      index === currentImageIndex 
                        ? 'ring-2 ring-pink-500 shadow-md' 
                        : 'ring-1 ring-pink-200/50 dark:ring-pink-900/50 opacity-70'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex w-full flex-col space-y-2 p-3 px-4">
          <div className="flex items-center justify-between border-b border-pink-200/70 pb-2 text-sm dark:border-pink-900/50">
            <div className="flex items-center">
              <div className="flex items-center">
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-sm focus:outline-none"
                >
                  <Heart size={14} fill="white" />
                </motion.span>
                <div className="ml-1.5">
                  <p className="font-medium text-pink-600 dark:text-pink-300">
                    {likesCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-5">
              <button
                className="text-pink-600 transition-colors duration-200 hover:text-pink-800 dark:text-pink-300 dark:hover:text-pink-200 flex items-center"
                onClick={toggleCommentPopup}
              >
                <MessageCircle size={14} className="mr-1 opacity-70" />
                {commentsCount} Bình luận
              </button>
              <button
                className="text-pink-600 transition-colors duration-200 hover:text-pink-800 dark:text-pink-300 dark:hover:text-pink-200 flex items-center"
                onClick={toggleShareModal}
              >
                <Share2 size={14} className="mr-1 opacity-70" />
                {sharesCount} Chia sẻ
              </button>
            </div>
          </div>
          {!isCommenting && (
            <div className="flex space-x-3 text-sm font-medium pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex h-10 flex-1 items-center justify-center space-x-2 rounded-lg ${
                  isLiked 
                    ? 'bg-gradient-to-r from-pink-200 to-pink-100 dark:from-pink-800/70 dark:to-pink-900/70' 
                    : 'bg-pink-100/80 dark:bg-pink-900/30'
                } transition-all duration-200 hover:bg-pink-200 hover:shadow-md focus:outline-none dark:hover:bg-pink-900/70 ${
                  isLikeLoading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                onClick={handleLike}
                disabled={isLikeLoading}
              >
                <div>
                  <Heart 
                    size={16} 
                    className={`${isLiked ? 'text-pink-500 fill-pink-500' : 'text-pink-400'}`} 
                  />
                </div>
                <div>
                  <p className={`${isLiked ? 'font-semibold text-pink-600' : 'text-pink-500'} dark:${isLiked ? 'font-semibold text-pink-200' : 'text-pink-400'}`}>
                    Thích
                  </p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleCommentPopup}
                className="flex h-10 flex-1 items-center justify-center space-x-2 rounded-lg bg-pink-100/80 hover:bg-pink-200 hover:shadow-md transition-all duration-200 focus:outline-none dark:bg-pink-900/30 dark:hover:bg-pink-900/70"
              >
                <div>
                  <MessageCircle size={16} className="text-pink-500" />
                </div>
                <div>
                  <p className="text-pink-600 dark:text-pink-200">Bình luận</p>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-10 flex-1 items-center justify-center space-x-2 rounded-lg bg-pink-100/80 hover:bg-pink-200 hover:shadow-md transition-all duration-200 focus:outline-none dark:bg-pink-900/30 dark:hover:bg-pink-900/70"
                onClick={toggleShareModal}
              >
                <div>
                  <Share2 size={16} className="text-pink-500" />
                </div>
                <div>
                  <p className="text-pink-600 dark:text-pink-200">Chia sẻ</p>
                </div>
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Render popups using React Portal */}
      {renderPopups()}
    </>
  );
};

export default Post;

// Add this to your global CSS
const styleEl = document.createElement('style');
styleEl.textContent = `
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}

.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Add smooth transitions for dark mode */
.dark *, .dark *::before, .dark *::after {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
`;
document.head.appendChild(styleEl);