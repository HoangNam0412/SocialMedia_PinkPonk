import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import mediaService from '../../../../services/media';
import postService from '../../../../services/post';

interface ICreatePostPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const CreatePostPopup: React.FC<ICreatePostPopupProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>(
    'PUBLIC',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Animation effect when popup opens
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Close emoji picker when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    const validFiles = newFiles.filter((file) => {
      const isValidType =
        file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        setError('Only image and video files are allowed');
      }

      if (!isValidSize) {
        setError('File size should not exceed 10MB');
      }

      return isValidType && isValidSize;
    });

    setMediaFiles((prev) => [...prev, ...validFiles]);
    setError(null);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
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

  // Function to handle emoji click
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    // Get current cursor position
    const cursorPosition = textAreaRef.current?.selectionStart || 0;

    // Insert emoji at cursor position
    const newContent =
      content.slice(0, cursorPosition) +
      emojiData.emoji +
      content.slice(cursorPosition);

    setContent(newContent);
    setCharCount(newContent.length);

    // Set focus back to textarea after small delay to allow state update
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        // Place cursor after inserted emoji
        const newPosition = cursorPosition + emojiData.emoji.length;
        textAreaRef.current.selectionStart = newPosition;
        textAreaRef.current.selectionEnd = newPosition;
      }
    }, 10);
  };

  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
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
        // Ensure we're getting a string, not an array
        const mediaUrl = Array.isArray(url) ? url[0] : url;
        uploadedUrls.push(mediaUrl);
      }

      // Create the post
      const postData = {
        userId: String(user.id), // Convert to string to fix type error
        content,
        mediaUrls: uploadedUrls,
        privacy,
      };

      await postService.createPost(postData);

      // Reset form
      setContent('');
      setMediaFiles([]);
      setMediaUrls([]);
      setPrivacy('PUBLIC');
      setCharCount(0);

      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }

      // Close the popup
      onClose();
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

  if (!isOpen) return null;

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
            className="w-full max-w-2xl transform overflow-hidden rounded-2xl border border-pink-100/30 bg-gradient-to-br from-white to-pink-50/90 p-5 shadow-[0_15px_40px_-15px_rgba(236,72,153,0.3)] transition-all duration-300 sm:p-6 dark:border-pink-950/30 dark:from-neutral-800 dark:to-neutral-900/90 dark:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.7)]"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="mb-5 flex items-center justify-between border-b border-pink-100/60 pb-4 dark:border-pink-950/40">
              <h2 className="flex items-center text-xl font-bold text-pink-900 dark:text-pink-100">
                <span className="mr-2 text-2xl">✨</span>
                Tạo bài viết
              </h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-full p-2 text-pink-500 transition-colors hover:bg-pink-100/70 dark:text-pink-400 dark:hover:bg-pink-950/50"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>

            <div className="mb-5 flex items-start gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-pink-100 to-pink-200 shadow-lg ring-2 ring-pink-300/70 dark:from-pink-900/30 dark:to-pink-800/20 dark:ring-pink-800/50"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-pink-500 dark:text-pink-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-pink-900 dark:text-pink-100">
                  {user?.fullName || 'User'}
                </p>
                <div className="relative mt-1">
                  <select
                    className="appearance-none rounded-full border border-pink-200 bg-white/80 px-3 py-1.5 pr-8 text-sm shadow-sm transition-all hover:border-pink-300 focus:border-pink-400 focus:outline-none focus:ring focus:ring-pink-200 focus:ring-opacity-50 dark:border-pink-800/50 dark:bg-neutral-800/80 dark:text-pink-200 dark:hover:border-pink-700 dark:focus:border-pink-600 dark:focus:ring-pink-900/30"
                    value={privacy}
                    onChange={handlePrivacyChange}
                  >
                    <option value="PUBLIC">Công khai</option>
                    <option value="FRIENDS">Bạn bè</option>
                    <option value="PRIVATE">Chỉ mình tôi</option>
                  </select>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <textarea
                  ref={textAreaRef}
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Bạn đang nghĩ gì?"
                  className="min-h-[130px] w-full resize-none rounded-xl border border-pink-200/70 bg-white/80 p-4 shadow-inner backdrop-blur-sm transition-colors focus:border-pink-300 focus:outline-none focus:ring focus:ring-pink-200 focus:ring-opacity-30 dark:border-pink-900/30 dark:bg-neutral-800/50 dark:text-pink-100 dark:placeholder-pink-300/50 dark:focus:border-pink-700 dark:focus:ring-pink-800/20"
                  rows={4}
                  maxLength={5000}
                />
                <div className="absolute bottom-3 right-3 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-pink-400/80 backdrop-blur-sm dark:bg-neutral-800/70 dark:text-pink-500/60">
                  {charCount}/5000
                </div>
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

              {mediaFiles.length > 0 && (
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {mediaFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative h-40 overflow-hidden rounded-xl border border-pink-100/50 bg-gradient-to-br from-pink-50 to-white shadow-md dark:border-pink-900/30 dark:from-neutral-800 dark:to-neutral-900"
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-pink-50 dark:bg-neutral-800">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-pink-400 dark:text-pink-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="scale-90 transform rounded-full bg-red-500 p-2.5 text-white opacity-0 shadow-lg transition-all hover:bg-red-600 group-hover:scale-100 group-hover:opacity-100"
                          onClick={() => removeMedia(index)}
                          aria-label="Remove media"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex flex-col justify-between gap-3 border-t border-pink-100/70 pt-4 sm:flex-row sm:items-center sm:gap-4 dark:border-pink-900/30">
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full bg-gradient-to-r from-pink-100 to-pink-200 p-3 text-pink-600 shadow-sm transition-all hover:from-pink-200 hover:to-pink-300 hover:shadow-md dark:from-pink-900/30 dark:to-pink-800/20 dark:text-pink-400 dark:hover:from-pink-800/30 dark:hover:to-pink-700/20"
                    onClick={triggerFileInput}
                    aria-label="Add media"
                    title="Thêm ảnh hoặc video"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                  />

                  <div className="relative">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`rounded-full p-3 text-pink-600 shadow-sm transition-all ${
                        showEmojiPicker
                          ? 'bg-gradient-to-r from-pink-200 to-pink-300 dark:from-pink-800/30 dark:to-pink-700/20'
                          : 'bg-gradient-to-r from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300 hover:shadow-md dark:from-pink-900/30 dark:to-pink-800/20 dark:text-pink-400 dark:hover:from-pink-800/30 dark:hover:to-pink-700/20'
                      }`}
                      aria-label="Add emoji"
                      title="Thêm emoji"
                      onClick={toggleEmojiPicker}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.button>

                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute bottom-16 left-0 z-10 overflow-hidden rounded-lg shadow-[0_10px_40px_-5px_rgba(236,72,153,0.3)]"
                          ref={emojiPickerRef}
                        >
                          <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            searchDisabled={false}
                            skinTonesDisabled
                            width={300}
                            height={400}
                            theme={
                              document.documentElement.classList.contains(
                                'dark',
                              )
                                ? Theme.DARK
                                : Theme.LIGHT
                            }
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:from-pink-600 hover:to-pink-700 hover:shadow-lg disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-500 disabled:shadow-none"
                  disabled={
                    isSubmitting || (!content.trim() && mediaFiles.length === 0)
                  }
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                        viewBox="0 0 24 24"
                      ></svg>
                      Đang đăng...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Đăng
                    </span>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostPopup;
