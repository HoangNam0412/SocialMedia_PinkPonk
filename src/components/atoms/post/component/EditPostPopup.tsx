import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import mediaService from '../../../../services/media';
import postService, { PostResponse } from '../../../../services/post';

interface IEditPostPopupProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostResponse;
  onPostUpdated?: () => void;
}

const EditPostPopup: React.FC<IEditPostPopupProps> = ({
  isOpen,
  onClose,
  post,
  onPostUpdated,
}) => {
  const [content, setContent] = useState(post.content || '');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>(post.mediaUrls || []);
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>(post.privacy as 'PUBLIC' | 'FRIENDS' | 'PRIVATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [charCount, setCharCount] = useState(content.length);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Animation effect when popup opens
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrivacy(e.target.value as 'PUBLIC' | 'FRIENDS' | 'PRIVATE');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert FileList to Array
    const newFiles = Array.from(files);
    
    // Check file types and sizes
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        setError('Only image and video files are allowed');
      }
      
      if (!isValidSize) {
        setError('File size should not exceed 10MB');
      }
      
      return isValidType && isValidSize;
    });
    
    setMediaFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeMedia = (index: number) => {
    if (index < mediaUrls.length) {
      // Remove from existing mediaUrls
      setMediaUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from newly added mediaFiles
      const adjustedIndex = index - mediaUrls.length;
      setMediaFiles(prev => prev.filter((_, i) => i !== adjustedIndex));
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    try {
      const responseUrl = await mediaService.uploadMedia(file);
      return responseUrl as string;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && mediaFiles.length === 0 && mediaUrls.length === 0) {
      setError('Please add some content or media to your post');
      return;
    }
    
    if (!user || !('id' in user)) {
      setError('You must be logged in to edit a post');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload new media files if any
      const uploadedUrls: string[] = [];
      for (const file of mediaFiles) {
        const url = await uploadMedia(file);
        // Ensure we're getting a string, not an array
        const mediaUrl = Array.isArray(url) ? url[0] : url;
        uploadedUrls.push(mediaUrl);
      }
      
      // Combine existing mediaUrls with newly uploaded ones
      const allMediaUrls = [...mediaUrls, ...uploadedUrls];
      
      // Update the post
      const postData = {
        content,
        mediaUrls: allMediaUrls,
        privacy
      };
      
      await postService.updatePost(post.id, postData);
      
      // Notify parent component
      if (onPostUpdated) {
        onPostUpdated();
      }
      
      // Close the popup
      onClose();
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className={`w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-800 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Chỉnh sửa bài viết
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="mb-4 flex items-start space-x-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-700">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.fullName || 'User'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {user?.fullName || 'User'}
            </p>
            <div className="relative mt-1">
              <select
                className="appearance-none rounded-md border border-gray-300 bg-white px-3 py-1.5 pr-8 text-sm focus:border-primary focus:outline-none hover:bg-pink-600 dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
                value={privacy}
                onChange={handlePrivacyChange}
              >
                <option value="PUBLIC">
                  <i className="fas fa-globe mr-2"></i> Công khai
                </option>
                <option value="FRIENDS">
                  <i className="fas fa-user-friends mr-2"></i> Bạn bè
                </option>
                <option value="PRIVATE">
                  <i className="fas fa-lock mr-2"></i> Chỉ mình tôi
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Bạn đang nghĩ gì?"
              className="w-full rounded-xl border border-gray-300 p-4 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200 transition-colors resize-none"
              rows={4}
              maxLength={5000}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
              {charCount}/5000
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          {/* Display existing media */}
          {mediaUrls.length > 0 && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaUrls.map((url, index) => (
                <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Media ${index}`}
                    className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-all transform scale-90 group-hover:scale-100"
                      onClick={() => removeMedia(index)}
                      aria-label="Remove media"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Display new media files */}
          {mediaFiles.length > 0 && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaFiles.map((file, index) => (
                <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-gray-200 dark:bg-neutral-700">
                      <i className="fas fa-video text-3xl text-gray-500 dark:text-gray-400"></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-all transform scale-90 group-hover:scale-100"
                      onClick={() => removeMedia(index + mediaUrls.length)}
                      aria-label="Remove media"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 pt-3 border-t border-gray-200 dark:border-neutral-700">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="rounded-full bg-gray-100 p-3 text-gray-500 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-600 transition-colors"
                onClick={triggerFileInput}
                aria-label="Add media"
                title="Thêm ảnh hoặc video"
              >
                <i className="fas fa-image text-lg"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
              
              <button
                type="button"
                className="rounded-full bg-gray-100 p-3 text-gray-500 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-600 transition-colors"
                aria-label="Add emoji"
                title="Thêm emoji"
              >
                <i className="fas fa-smile text-lg"></i>
              </button>
            </div>
            
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
              disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0 && mediaUrls.length === 0)}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></svg>
                  Đang cập nhật...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="fas fa-save mr-2"></i>
                  Cập nhật
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPopup; 