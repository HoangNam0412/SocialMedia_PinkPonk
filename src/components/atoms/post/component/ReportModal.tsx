import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import reportService from '../../../../services/report';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  authorId: number;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  postId,
  authorId,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for your report');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to report a post');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const reportData = {
        userId: Number(user.id),
        reportedPostId: postId,
        reportedUserId: authorId,
        reason: reason.trim()
      };
      
      await reportService.createReport(reportData);
      setSuccess(true);
      
      // Reset the form
      setReason('');
      
      // Close the modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error reporting post:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Báo cáo bài viết</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {success ? (
          <div className="rounded-md bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Báo cáo của bạn đã được gửi. Cảm ơn bạn vì đã giữ cho cộng đồng an toàn.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="reason" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lý do báo cáo bài viết?
              </label>
              <textarea
                id="reason"
                rows={4}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
                placeholder="Hãy giải thích tại sao bạn báo cáo bài viết..."
                value={reason}
                onChange={handleReasonChange}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-pink-500 px-4 py-2 font-medium text-white hover:bg-pink-600 disabled:bg-pink-300"
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal; 