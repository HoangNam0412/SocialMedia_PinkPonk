import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Globe, Lock, Share2, Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import postService, { SharePostRequest } from '../../../../services/post';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postContent: string;
  postImage?: string;
  mediaUrls?: string[];
  onShareSuccess?: () => void;
}

type PrivacyType = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  postId,
  postContent,
  postImage,
  mediaUrls,
  onShareSuccess
}) => {
  const [shareText, setShareText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyType>('PUBLIC');
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!user) {
      setError('Bạn cần đăng nhập để chia sẻ bài viết.');
      return;
    }

    setIsSharing(true);
    setError(null);
    
    try {
      const shareData: SharePostRequest = {
        originalPostId: postId,
        content: shareText,
        mediaUrls: mediaUrls || (postImage ? [postImage] : undefined),
        privacy: privacy
      };

      await postService.sharePost(Number(user.id), shareData);
      
      // Call the success callback if provided
      if (onShareSuccess) {
        onShareSuccess();
      }
      window.location.reload();

      // Close modal after successful share
      onClose();
    } catch (err: any) {
      console.error('Error sharing post:', err);
      setError(err.message || 'Không thể chia sẻ bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    // Create a shareable link for the post
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Error copying link:', err);
        setError('Không thể sao chép liên kết. Vui lòng thử lại.');
      });
  };

  const getPrivacyIcon = (type: PrivacyType) => {
    switch (type) {
      case 'PUBLIC':
        return <Globe size={18} />;
      case 'FRIENDS':
        return <Users size={18} />;
      case 'PRIVATE':
        return <Lock size={18} />;
      default:
        return <Globe size={18} />;
    }
  };

  const getPrivacyText = (type: PrivacyType) => {
    switch (type) {
      case 'PUBLIC':
        return 'Công khai';
      case 'FRIENDS':
        return 'Bạn bè';
      case 'PRIVATE':
        return 'Chỉ mình tôi';
      default:
        return 'Công khai';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md transform overflow-visible rounded-2xl border border-pink-100/30 bg-gradient-to-br from-white to-pink-50/90 p-5 shadow-[0_15px_40px_-15px_rgba(236,72,153,0.3)] transition-all duration-300 dark:border-pink-950/30 dark:from-neutral-800 dark:to-neutral-900/90 dark:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.7)]"
          >
            <div className="mb-5 flex items-center justify-between border-b border-pink-100/60 pb-4 dark:border-pink-950/40">
              <h3 className="flex items-center text-xl font-bold text-pink-900 dark:text-pink-100">
                <Share2 size={20} className="mr-2 text-pink-500 dark:text-pink-400" />
                Chia sẻ bài viết
              </h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="rounded-full p-2 text-pink-500 transition-colors hover:bg-pink-100/70 dark:text-pink-400 dark:hover:bg-pink-950/50"
              >
                <X size={20} />
              </motion.button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 shadow-sm dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </motion.div>
            )}

            <div className="mb-4">
              <textarea
                className="w-full resize-none rounded-xl border border-pink-200/70 bg-white/80 p-4 shadow-inner backdrop-blur-sm transition-colors focus:border-pink-300 focus:outline-none focus:ring focus:ring-pink-200 focus:ring-opacity-30 dark:border-pink-900/30 dark:bg-neutral-800/50 dark:text-pink-100 dark:placeholder-pink-300/50 dark:focus:border-pink-700 dark:focus:ring-pink-800/20"
                rows={4}
                placeholder="Thêm suy nghĩ của bạn..."
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
              ></textarea>
            </div>

            {/* Display all media images */}
            {mediaUrls && mediaUrls.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-5 overflow-hidden rounded-xl border border-pink-100/50 bg-gradient-to-br from-pink-50 to-white shadow-md dark:border-pink-900/30 dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className={`grid ${mediaUrls.length > 1 
                  ? mediaUrls.length === 2 
                    ? 'grid-cols-2' 
                    : mediaUrls.length === 3 
                      ? 'grid-cols-2' 
                      : 'grid-cols-2 md:grid-cols-3' 
                  : ''} gap-2 p-2`}>
                  {mediaUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Shared post image ${index + 1}`}
                      className={`${mediaUrls.length > 1 
                        ? `h-32 rounded-lg ${mediaUrls.length === 3 && index === 2 ? 'col-span-2 md:col-span-1' : ''}` 
                        : 'h-40'} w-full object-cover transition-transform duration-300 hover:scale-105`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : postImage ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-5 overflow-hidden rounded-xl border border-pink-100/50 bg-gradient-to-br from-pink-50 to-white shadow-md dark:border-pink-900/30 dark:from-neutral-800 dark:to-neutral-900"
              >
                <img
                  src={postImage}
                  alt="Shared post"
                  className="h-40 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </motion.div>
            ) : null}

            <div className="mb-5">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-between rounded-xl border border-pink-200/70 bg-white/80 p-3 text-left shadow-sm backdrop-blur-sm transition-all hover:border-pink-300 dark:border-pink-900/30 dark:bg-neutral-800/30 dark:text-pink-100"
                  onClick={() => setShowPrivacyOptions(!showPrivacyOptions)}
                >
                  <div className="flex items-center">
                    <span className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-100 to-pink-200 text-pink-600 dark:from-pink-900/30 dark:to-pink-800/20 dark:text-pink-400">
                      {getPrivacyIcon(privacy)}
                    </span>
                    <span className="font-medium">{getPrivacyText(privacy)}</span>
                  </div>
                  <span className="text-pink-500 dark:text-pink-400">
                    {showPrivacyOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </motion.button>
                
                <AnimatePresence>
                  {showPrivacyOptions && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-10 mt-2 w-full overflow-visible rounded-xl border border-pink-100/50 bg-white shadow-lg dark:border-pink-900/30 dark:bg-neutral-800"
                    >
                      {(['PUBLIC', 'FRIENDS', 'PRIVATE'] as PrivacyType[]).map((option) => (
                        <motion.button
                          key={option}
                          whileHover={{ 
                            backgroundColor: option === privacy ? 'rgba(244, 114, 182, 0.2)' : 'rgba(244, 114, 182, 0.1)' 
                          }}
                          className={`flex w-full items-center p-3 text-left transition-colors ${
                            privacy === option 
                              ? 'bg-pink-100/30 dark:bg-pink-900/20' 
                              : 'hover:bg-pink-50 dark:hover:bg-pink-900/10'
                          }`}
                          onClick={() => {
                            setPrivacy(option);
                            setShowPrivacyOptions(false);
                          }}
                        >
                          <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-100 to-pink-200 text-pink-600 dark:from-pink-900/30 dark:to-pink-800/20 dark:text-pink-400">
                            {getPrivacyIcon(option)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-medium text-pink-900 dark:text-pink-100">{getPrivacyText(option)}</span>
                            <span className="text-xs text-pink-500/70 dark:text-pink-400/70">
                              {option === 'PUBLIC' && 'Ai cũng có thể nhìn thấy bài đăng này'}
                              {option === 'FRIENDS' && 'Chỉ bạn bè mới nhìn thấy bài đăng này'}
                              {option === 'PRIVATE' && 'Chỉ bạn mới nhìn thấy bài đăng này'}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-pink-100 px-4 py-2.5 font-medium text-pink-700 shadow-sm transition-all hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/40"
                onClick={onClose}
                disabled={isSharing}
              >
                Hủy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-2.5 font-medium text-white shadow-md transition-all hover:from-pink-600 hover:to-pink-700 hover:shadow-lg disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-500 disabled:shadow-none"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang chia sẻ...
                  </>
                ) : (
                  <>
                    <Share2 size={18} className="mr-2" />
                    Chia sẻ
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal; 