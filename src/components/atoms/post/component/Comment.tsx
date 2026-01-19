import React from "react";

interface CommentProps {
  avatar: string;
  username: string;
  text: string;
  time: string;
}

const Comment: React.FC<CommentProps> = ({ avatar, username, text, time }) => {
  return (
    <div className="flex space-x-3 p-2 items-start text-white bg-[#1a1a1a] rounded-lg w-fit">
      {/* Avatar */}
      <img
        src={avatar}
        alt="avatar"
        className="h-8 w-8 rounded-full object-cover"
      />

      {/* Comment Content */}
      <div className="flex flex-col">
        <div className="bg-[#2a2a2a] p-2 rounded-lg max-w-xs">
          <p className="font-semibold text-sm">{username}</p>
          <p className="text-sm text-gray-300">{text}</p>
        </div>
        
        {/* Interaction Row */}
        <div className="flex space-x-3 text-xs text-gray-400 mt-1">
          <span>{time}</span>
          <span className="cursor-pointer hover:text-gray-200">Thích</span>
          <span className="cursor-pointer hover:text-gray-200">Phản hồi</span>
        </div>
      </div>
    </div>
  );
};

export default Comment;
