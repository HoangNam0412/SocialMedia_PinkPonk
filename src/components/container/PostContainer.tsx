import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import postService, { PostResponse } from '../../services/post';
import { TPostView } from '../../types/post';
import { cn } from '../../utils';
import Post from '../atoms/post';
import CreatePostBox from '../atoms/post/component/CreatePostBox';
import EditPostPopup from '../atoms/post/component/EditPostPopup';

interface IProps {
  postsView?: TPostView;
  userId?: number;
}

const PostContainer: React.FC<IProps> = (props) => {
  const { postsView, userId } = props;
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [editingPost, setEditingPost] = useState<PostResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger a refresh

  // Animation variants for posts
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const postVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let fetchedPosts: PostResponse[];

      if (userId) {
        // Fetch user's posts
        fetchedPosts = await postService.getUserPosts(userId);
      } else {
        // Fetch all posts
        fetchedPosts = await postService.getPosts();
      }

      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId, refreshKey]);

  // Handle post edit
  const handleEditPost = (postId: number) => {
    const postToEdit = posts.find((post) => post.id === postId);
    if (postToEdit) {
      setEditingPost(postToEdit);
    }
  };

  // Handle post update
  const handlePostUpdated = () => {
    // Refresh posts after update
    setRefreshKey(prev => prev + 1); // Trigger a refresh
  };

  // Handle post delete
  const handleDeletePost = async (postId: number) => {
    try {
      // Call API to delete the post
      await postService.deletePost(postId);

      // Remove the post from the state with animation
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Không thể xóa bài viết. Vui lòng thử lại sau.');
    }
  };

  // Handle post report
  const handleReportPost = (postId: number) => {
    // Implement report post functionality
    console.log('Report post:', postId);
    // This would typically open a report modal or navigate to a report page
  };

  // Reset error state
  const handleRetry = () => {
    setError(null);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto w-full relative">
        {/* Add decorative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50/30 to-white dark:from-[#2A1C22]/30 dark:to-[#1F1720] -z-10 overflow-hidden">
          <div className="absolute inset-0 opacity-20 dark:opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGridLoading" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-pink-300 dark:text-pink-700" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGridLoading)" />
            </svg>
          </div>
        </div>
        
        {/* Show the create post box at the top even during loading */}
        {!userId && user && (
          <div className="mx-auto flex justify-center w-full">
            <CreatePostBox className="w-full max-w-3xl mb-5" />
          </div>
        )}
        
        <div className="mt-4 flex flex-col items-center justify-center py-8 px-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-300 border-t-pink-500 shadow-lg"></div>
            <p className="text-pink-600 animate-pulse dark:text-pink-400 font-medium">Đang tải bài viết...</p>
          </div>
          
          {/* Loading skeleton for posts */}
          <div className="w-full max-w-3xl mt-8 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#2A1C22]/90 rounded-xl shadow-md p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-pink-200 dark:bg-pink-800/50"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-pink-200 dark:bg-pink-800/50 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-pink-100 dark:bg-pink-800/30 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-pink-100 dark:bg-pink-800/30 rounded w-full"></div>
                  <div className="h-4 bg-pink-100 dark:bg-pink-800/30 rounded w-5/6"></div>
                </div>
                <div className="mt-4 h-48 bg-pink-50 dark:bg-pink-900/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto w-full relative">
        {/* Add decorative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50/30 to-white dark:from-[#2A1C22]/30 dark:to-[#1F1720] -z-10 overflow-hidden">
          <div className="absolute inset-0 opacity-20 dark:opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="smallGridError" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-pink-300 dark:text-pink-700" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#smallGridError)" />
            </svg>
          </div>
        </div>
        
        {/* Show the create post box at the top even during error */}
        {!userId && user && (
          <div className="mx-auto flex justify-center w-full">
            <CreatePostBox className="w-full max-w-3xl mb-5" />
          </div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl bg-pink-50/80 p-6 text-center shadow-sm transition-all dark:bg-pink-900/20 dark:text-pink-100 border border-pink-200/50 dark:border-pink-800/30"
        >
          <div className="flex flex-col items-center">
            <div className="mb-4 text-4xl">😢</div>
            <p className="font-medium text-pink-700 dark:text-pink-300 mb-2">{error}</p>
            <p className="text-pink-600/70 dark:text-pink-400/70 mb-4 text-sm">
              Có vẻ như đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-pink-600 transition-colors shadow-sm hover:shadow"
            >
              <RefreshCw size={16} className="animate-spin-slow" />
              Thử lại
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-2 sm:px-4 relative">
      {/* Add a decorative background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50/30 to-white dark:from-[#2A1C22]/30 dark:to-[#1F1720] -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-pink-300 dark:text-pink-700" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
          </svg>
        </div>
      </div>
      
      {/* Add CreatePostBox at the top if viewing all posts (not user profile) */}
      {!userId && user && (
        <div className="mx-auto flex justify-center w-full">
          <CreatePostBox className="w-full max-w-3xl mb-5" />
        </div>
      )}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={cn(
          'grid gap-5 transition-all sm:gap-6 md:gap-8',
          postsView === 'gridView'
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'mx-auto max-w-3xl grid-cols-1',
        )}
      >
        {posts.length > 0 ? (
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                variants={postVariants}
                layout
                exit={{ opacity: 0, y: -20 }}
                className="transform will-change-transform"
              >
                <Post
                  post={post}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  onReportPost={handleReportPost}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-full py-10 text-center"
          >
            <div className="bg-gradient-to-br from-pink-50/90 to-white dark:from-[#2A1C22]/90 dark:to-[#231A20]/95 rounded-xl p-8 border border-pink-100/70 dark:border-pink-800/40 shadow-[0_10px_30px_-5px_rgba(224,178,203,0.25)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.4)] backdrop-blur-sm">
              <div className="text-6xl mb-6">📭</div>
              <p className="text-pink-700 dark:text-pink-300 font-medium text-xl mb-3">
                {userId ? 'Người dùng chưa có bài viết nào' : 'Chưa có bài viết nào'}
              </p>
              <p className="text-pink-600/80 dark:text-pink-400/70 text-base">
                {userId ? 'Hãy quay lại sau' : 'Hãy tạo bài viết đầu tiên của bạn'}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Edit Post Popup */}
      <AnimatePresence>
        {editingPost && (
          <EditPostPopup
            isOpen={!!editingPost}
            onClose={() => setEditingPost(null)}
            post={editingPost}
            onPostUpdated={handlePostUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostContainer;
