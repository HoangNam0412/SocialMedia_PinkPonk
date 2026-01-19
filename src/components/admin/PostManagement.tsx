import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import postService, { PostResponse } from '../../services/post';
import Avatar from '../atoms/Avatar';
import EditPostPopup from '../atoms/post/component/EditPostPopup';

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<'ALL' | 'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('ALL');
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await postService.getPosts();
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchPosts();
    } else {
      setError('You do not have permission to view this page.');
      setLoading(false);
    }
  }, [user]);

  // Format date to relative time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Filter posts based on search term and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrivacy = privacyFilter === 'ALL' || post.privacy === privacyFilter;
    
    return matchesSearch && matchesPrivacy;
  });

  // Handle post deletion
  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('Failed to delete post. Please try again.');
      }
    }
  };

  // Handle viewing post details
  const handleViewPost = (postId: number) => {
    window.open(`/post/${postId}`, '_blank');
  };

  // Handle editing post
  const handleEditPost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsEditPostOpen(true);
    }
  };

  const handlePostUpdated = async () => {
    // Refresh posts after an update
    try {
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error refreshing posts:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Post Management</h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <select
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            value={privacyFilter}
            onChange={(e) => setPrivacyFilter(e.target.value as 'ALL' | 'PUBLIC' | 'FRIENDS' | 'PRIVATE')}
          >
            <option value="ALL">All Privacy</option>
            <option value="PUBLIC">Public</option>
            <option value="FRIENDS">Friends</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Author
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Content
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Privacy
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Posted
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-700 dark:bg-neutral-800">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <Avatar
                          src={post.author.avatarUrl}
                          alt={post.author.fullName}
                          size="sm"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">{post.author.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs overflow-hidden text-ellipsis">
                      <p className="text-sm text-gray-900 dark:text-white">{post.content}</p>
                      {post.mediaUrls.length > 0 && (
                        <div className="mt-1 flex space-x-1">
                          {post.mediaUrls.slice(0, 2).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ))}
                          {post.mediaUrls.length > 2 && (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-xs font-medium text-gray-500 dark:bg-neutral-700 dark:text-gray-400">
                              +{post.mediaUrls.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        post.privacy === 'PUBLIC'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : post.privacy === 'FRIENDS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}
                    >
                      {post.privacy}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(post.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      className="mr-2 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      onClick={() => handleEditPost(post.id)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No posts found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      </div>
      
      {selectedPost && (
        <EditPostPopup
          isOpen={isEditPostOpen}
          onClose={() => setIsEditPostOpen(false)}
          post={selectedPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default PostManagement; 