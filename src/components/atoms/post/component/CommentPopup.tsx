import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useEffect, useRef, useState } from 'react';
import Post from '..';
import { useAuth } from '../../../../contexts/AuthContext';
import commentService, {
    CommentRequest,
    CommentResponse,
} from '../../../../services/comment';
import { PostResponse } from '../../../../services/post';
import Avatar from '../../Avatar';

interface ICommentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostResponse;
  onFinishAddComment: () => void;
  onEditPost?: (postId: number) => void;
  onDeletePost?: (postId: number) => void;
  onReportPost?: (postId: number) => void;
}

const CommentPopup: React.FC<ICommentPopupProps> = ({
  isOpen,
  onClose,
  post,
  onFinishAddComment,
  onEditPost,
  onDeletePost,
  onReportPost
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentResponse[]>(
    post.commentResponses.map((comment) => ({
      ...comment,
      replies: [],
      parentCommentId: null,
    })),
  );
  const [newComment, setNewComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  
  // State for comment editing
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>('');
  
  // State for tracking active dropdown menu
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  
  // Tạo một bản sao của post với số lượng bình luận cập nhật
  const [updatedPost, setUpdatedPost] = useState<PostResponse>({
    ...post,
    commentCount: comments.length
  });
  
  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null && !(event.target as Element).closest('.comment-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);
  
  // Cập nhật lại updatedPost khi comments thay đổi
  useEffect(() => {
    setUpdatedPost(prev => ({
      ...prev,
      commentCount: comments.length
    }));
  }, [comments]);
  
  // Focus input on modal open
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Scroll to bottom of comments when new comment is added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleAddComment = async () => {
    if (!user || newComment.trim() === '' || isLoading) return;
  
    setIsLoading(true);
    setError(null);
  
    try {
      const newCommentData: CommentRequest = {
        postId: Number(post.id),
        userId: Number(user.id),
        content: newComment.trim(),
        parentCommentId: null,    
      };
      console.log(newCommentData)
      const createdComment = await commentService.createComment(newCommentData);
  
      // Add the new comment to the state
      setComments((prevComments) => [createdComment, ...prevComments]);
      setNewComment(''); // Clear input
      
      // Gọi onFinishAddComment sau khi thêm bình luận thành công
      onFinishAddComment();
    } catch (err) {
      setError('Không thể thêm bình luận. Vui lòng thử lại sau.');
      console.error('Error adding comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!user || editCommentContent.trim() === '' || isLoading) return;
  
    setIsLoading(true);
    setError(null);
  
    try {
      // Call API to update comment
      const updatedComment = await commentService.updateComment(commentId,editCommentContent.trim());
  
      // Update the comment in state
      setComments((prevComments) => 
        prevComments.map((comment) => 
          comment.id === commentId ? { ...comment, content: updatedComment.content } : comment
        )
      );
      
      // Clear editing state
      setEditingCommentId(null);
      setEditCommentContent('');
      setActiveDropdown(null);
    } catch (err) {
      setError('Không thể cập nhật bình luận. Vui lòng thử lại sau.');
      console.error('Error updating comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user || isLoading) return;
  
    setIsLoading(true);
    setError(null);
  
    try {
      // Call API to delete comment
      await commentService.deleteComment(commentId);
  
      // Remove comment from state
      setComments((prevComments) => 
        prevComments.filter((comment) => comment.id !== commentId)
      );
      
      setActiveDropdown(null);
    } catch (err) {
      setError('Không thể xóa bình luận. Vui lòng thử lại sau.');
      console.error('Error deleting comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditComment = (comment: CommentResponse) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
    setActiveDropdown(null);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  // Check if user can edit/delete comment
  const canManageComment = (comment: CommentResponse) => {
    if (!user) return false;
    // Check if user is the author or has admin role
    return comment.author?.id === user.id || user.role === 'ADMIN';
  };

  const toggleDropdown = (commentId: number) => {
    setActiveDropdown(activeDropdown === commentId ? null : commentId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const onEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, commentId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditComment(commentId);
    } else if (e.key === 'Escape') {
      cancelEditComment();
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return 'Vừa xong';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="flex h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white dark:bg-[#1e1e24] shadow-2xl dark:shadow-pink-950/20 overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-pink-400 to-pink-500 dark:from-pink-700 dark:to-pink-600 p-4">
          <div className="flex items-center space-x-2">
            <Avatar
              src={post.author?.avatarUrl}
              alt={post.author?.fullName || 'User avatar'}
              size="sm"
              className="border-2 border-white/70 dark:border-pink-900/70"
            />
            <h2 className="text-xl font-semibold text-white">
              Bài viết của {post.author?.fullName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30 dark:bg-pink-900/30 dark:hover:bg-pink-900/50"
            aria-label="Đóng"
          >
            <i className="fas fa-times text-lg transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>

        {/* Post content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-pink-50 to-white dark:from-[#2D1A24] dark:to-[#1e1e24]">
          <div className="p-4">
            <Post 
              post={updatedPost} 
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
              onReportPost={onReportPost}
              className="shadow-md"
              isCommenting={true}
            />
          </div>
          
          {/* Comments section */}
          <div className="mx-4 mb-3 mt-2 rounded-xl bg-white dark:bg-[#2A1C22] p-4 shadow-sm dark:shadow-pink-950/10">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-pink-700 dark:text-pink-300">
              <i className="fas fa-comments mr-2 text-pink-500 dark:text-pink-400"></i>
              Bình luận ({comments.length})
            </h3>
            
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center text-sm text-red-500 dark:text-red-300">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {error}
              </div>
            )}
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar p-2 pb-3">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <i className="fas fa-comment-slash mb-2 text-3xl text-pink-200 dark:text-pink-800"></i>
                  <p className="text-gray-500 dark:text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="group flex items-start space-x-3 transition-all duration-200 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 rounded-xl p-2">
                    <Avatar
                      src={comment.author?.avatarUrl}
                      alt={comment.author?.fullName || 'User avatar'}
                      size="sm"
                      className="mt-1 border border-pink-200 dark:border-pink-800"
                    />
                    <div className="flex-1">
                      {editingCommentId === comment.id ? (
                        <div className="inline-block w-full rounded-2xl bg-pink-100 dark:bg-pink-900/30 px-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-pink-800 dark:text-pink-200">
                              {comment.author?.fullName}
                            </p>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditComment(comment.id)}
                                className="text-xs px-2 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-md transition-colors dark:bg-pink-700 dark:hover:bg-pink-600"
                                disabled={isLoading}
                              >
                                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : "Lưu"}
                              </button>
                              <button 
                                onClick={cancelEditComment}
                                className="text-xs px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                                disabled={isLoading}
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            onKeyDown={(e) => onEditKeyDown(e, comment.id)}
                            className="w-full bg-white dark:bg-gray-800 rounded-lg p-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-700"
                            autoFocus
                            disabled={isLoading}
                          />
                        </div>
                      ) : (
                        <div className="inline-block rounded-2xl bg-pink-100 dark:bg-pink-900/30 px-4 py-2">
                          <p className="text-sm font-semibold text-pink-800 dark:text-pink-200">
                            {comment.author?.fullName}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{comment.content}</p>
                        </div>
                      )}
                      <div className="mt-1 flex items-center justify-between px-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(comment.createdAt)}
                        </span>
                        
                        {/* Action menu for comment */}
                        {canManageComment(comment) && editingCommentId !== comment.id && (
                          <div className="comment-dropdown relative bottom-8">
                            <button
                              onClick={() => toggleDropdown(comment.id)}
                              className={`text-gray-500 hover:text-pink-500 dark:text-gray-400 dark:hover:text-pink-400 ${activeDropdown === comment.id ? 'text-pink-500 dark:text-pink-400' : ''}`}
                              aria-label="Tùy chọn bình luận"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            
                            {/* Dropdown menu - Fixed position */}
                            {activeDropdown === comment.id && (
                              <div className="absolute right-0 mt-1 w-28 rounded-lg bg-white dark:bg-gray-800 shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
                                <button
                                  onClick={() => startEditComment(comment)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 flex items-center"
                                >
                                  <i className="fas fa-pencil-alt w-5 text-pink-500 dark:text-pink-400"></i>
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-pink-900/30 flex items-center"
                                >
                                  <i className="fas fa-trash-alt w-5 text-pink-500 dark:text-pink-400"></i>
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
          </div>
        </div>

        {/* Footer Section (Comment Input) */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2A1C22] p-4">
          <div className="flex items-center space-x-3 rounded-full bg-pink-50 dark:bg-pink-900/20 p-1 pl-3 shadow-sm">
            <Avatar
              src={user?.avatarUrl}
              alt={user?.fullName || 'User avatar'}
              size="sm"
              className="border border-pink-200 dark:border-pink-800"
            />
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Bình luận với tư cách ${user?.fullName || "Người dùng"}...`}
              className="flex-1 bg-transparent py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-gray-800 dark:text-gray-200"
              disabled={isLoading}
            />
            <button
              onClick={handleAddComment}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                newComment.trim() ? 'bg-pink-500 text-white hover:bg-pink-600 dark:bg-pink-700 dark:hover:bg-pink-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              } transition-colors duration-200 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={isLoading || !newComment.trim()}
              aria-label="Gửi bình luận"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin text-lg"></i>
              ) : (
                <i className="fas fa-paper-plane text-lg"></i>
              )}
            </button>
          </div>
          <div className="mt-2 flex justify-between px-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Nhấn Enter để gửi</span>
            <span>{newComment.length}/1000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPopup;