import cn from 'classnames';
import { motion } from 'framer-motion';
import { Image, Smile } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import Avatar from '../../Avatar';
import CreatePostPopup from './CreatePostPopup';

const CreatePostBox: React.FC<{ className?: string }> = ({ className }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { user } = useAuth();

  const handlePostCreated = () => {
    // Close the popup
    setIsPopupOpen(false);

    // Force a page reload to refresh the posts list
    window.location.reload();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-xl border border-pink-100/40 bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-pink-900/20 dark:bg-[#2A1C22]/95 dark:shadow-pink-900/10',
          className,
        )}
      >
        <div className="mb-4 flex items-center gap-3 sm:gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Avatar
              src={user?.avatarUrl}
              alt={user?.fullName || 'User avatar'}
              size="md"
              className="h-11 w-11 shadow-md ring-2 ring-pink-300/70 sm:h-12 sm:w-12 dark:ring-pink-800/50"
            />
          </motion.div>

          <motion.div
            onClick={() => setIsPopupOpen(true)}
            whileHover={{
              scale: 1.01,
              backgroundColor: 'rgba(251, 207, 232, 0.4)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex-1 cursor-pointer rounded-full bg-pink-50/80 px-5 py-3 text-gray-600 shadow-sm transition-all duration-200 hover:shadow dark:bg-neutral-800/95 dark:text-gray-300 dark:hover:bg-neutral-800/90"
          >
            <p className="truncate text-sm font-medium sm:text-base">
              {user?.fullName
                ? `${user.fullName}, bạn đang nghĩ gì?`
                : 'Bạn đang nghĩ gì?'}
            </p>
          </motion.div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1 border-t border-pink-100/50 pt-3 dark:border-pink-900/30">

          <motion.button
            whileHover={{ y: -2, color: '#ec4899' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center rounded-lg py-2 transition-colors duration-200 hover:bg-pink-50/80 dark:hover:bg-pink-900/20"
            onClick={() => setIsPopupOpen(true)}
          >
            <Image size={20} className="mr-2 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Ảnh
            </span>
          </motion.button>

          <motion.button
            whileHover={{ y: -2, color: '#ec4899' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center rounded-lg py-2 transition-colors duration-200 hover:bg-pink-50/80 dark:hover:bg-pink-900/20"
            onClick={() => setIsPopupOpen(true)}
          >
            <Smile size={20} className="mr-2 text-amber-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Cảm xúc
            </span>
          </motion.button>
        </div>
      </motion.div>

      <CreatePostPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
};

export default CreatePostBox;
