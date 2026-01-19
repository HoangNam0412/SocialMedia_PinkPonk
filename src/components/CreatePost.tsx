import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import mediaService from '../services/media';
import postService from '../services/post';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
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
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
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
    
    if (!content.trim() && mediaFiles.length === 0) {
      setError('Please add some content or media to your post');
      return;
    }
    
    if (!user || !('id' in user)) {
      setError('You must be logged in to create a post');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload media files if any
      const uploadedUrls: string[] = [];
      for (const file of mediaFiles) {
        const url = await uploadMedia(file);
        uploadedUrls.push(url);
      }
      
      // Create the post
      const postData = {
        userId: user.id,
        content,
        mediaUrls: uploadedUrls,
        privacy
      };
      
      await postService.createPost(postData);
      
      // Reset form
      setContent('');
      setMediaFiles([]);
      setMediaUrls([]);
      setPrivacy('PUBLIC');
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow dark:bg-neutral-800">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-neutral-700 dark:text-gray-200"
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChange}
            rows={3}
          />
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
        
        {mediaFiles.length > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="h-24 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-md bg-gray-200 dark:bg-neutral-700">
                    <i className="fas fa-video text-2xl text-gray-500 dark:text-gray-400"></i>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  onClick={() => removeMedia(index)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-400 dark:hover:bg-neutral-600"
              onClick={triggerFileInput}
            >
              <i className="fas fa-image"></i>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
            />
            
            <select
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-neutral-700 dark:text-gray-200"
              value={privacy}
              onChange={handlePrivacyChange}
            >
              <option value="PUBLIC">Public</option>
              <option value="FRIENDS">Friends</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 font-medium text-white hover:bg-primary-dark disabled:bg-gray-400"
            disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></svg>
                Posting...
              </span>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 