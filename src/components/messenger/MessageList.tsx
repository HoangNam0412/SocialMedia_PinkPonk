import { AnimatePresence, motion } from "framer-motion";
import { Search, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Avatar from "../../components/atoms/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import conversationService, { ConversationResponse } from "../../services/conversation";
import MessageEditor from "./MessageEditor";

// Thêm kiểu thanh cuộn tùy chỉnh
const scrollbarStyles = `
/* Custom scrollbar styles */
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(236, 72, 153, 0.3);
    border-radius: 10px;
    transition: all 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(236, 72, 153, 0.5);
}

/* For Firefox */
.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(236, 72, 153, 0.3) transparent;
}

/* Hide scrollbar option */
.scrollbar-hidden::-webkit-scrollbar {
    display: none;
}
.scrollbar-hidden {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;

interface MessageListProps {
    isVisible: boolean;
    onClose: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ isVisible, onClose }) => {
    const { user } = useAuth();
    const { subscribe, unsubscribe } = useWebSocket();
    const { setMessageEditorOpen, resetUnreadMessages } = useNotification();
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null);
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

   // Kết nối với WebSocket để cập nhật cuộc trò chuyện theo thời gian thực
    useEffect(() => {
        if (!user?.id) return;
        
        // Đăng ký cập nhật cuộc trò chuyện của người dùng
        const topic = `/topic/conversations/${user.id}`;
        subscribe(topic, () => {
            // Làm mới cuộc trò chuyện khi nhận được bản cập nhật
            fetchConversations();
        });
        
        return () => {
            // Dọn dẹp đăng ký khi unmount
            unsubscribe(topic);
        };
    }, [user, subscribe, unsubscribe]);

    // Lấy các cuộc hội thoại từ API
    const fetchConversations = async () => {
        if (!user?.id || !isVisible) return;
        
        setLoading(true);
        try {
            const data = await conversationService.getConversations(Number(user.id));
            setConversations(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setError("Không thể tải tin nhắn. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Lấy các cuộc hội thoại khi thành phần được gắn kết hoặc hiển thị
    useEffect(() => {
        fetchConversations();
    }, [user, isVisible]);

    // Đặt trạng thái xem tin nhắn khi khả năng hiển thị của thành phần thay đổi
    useEffect(() => {
        if (isVisible) {
            // Nếu danh sách tin nhắn hiển thị, hãy coi nó như một trình xem tin nhắn đang hoạt động
            // và đặt lại thông báo
            setMessageEditorOpen(true);
            resetUnreadMessages();
        } else {
            // Khi đóng, chỉ đặt trình soạn thảo đóng nếu chúng ta không mở cuộc trò chuyện
            if (!selectedChat) {
                setMessageEditorOpen(false);
            }
        }
    }, [isVisible, selectedChat, setMessageEditorOpen, resetUnreadMessages]);

    // Xử lý mục trò chuyện nhấp chuột: mở trình soạn thảo tin nhắn
    const handleChatClick = (convo: ConversationResponse) => {
        setSelectedChat(convo.receiverName);
        setSelectedConversation(convo);
        onClose(); // Đóng danh sách trò chuyện
    };

    // Xử lý xóa cuộc trò chuyện
    const handleDeleteConversation = async (e: React.MouseEvent, conversationId: number) => {
        e.stopPropagation(); // Ngăn chặn việc mở cuộc trò chuyện
        
        if (window.confirm("Bạn có chắc chắn muốn xóa đoạn chat này không?")) {
            try {
                await conversationService.deleteConversation(conversationId);
                // Xóa khỏi trạng thái cục bộ
                setConversations(conversations.filter(c => c.id !== conversationId));
            } catch (err) {
                console.error("Error deleting conversation:", err);
                alert("Không thể xóa đoạn chat. Vui lòng thử lại sau.");
            }
        }
    };

    // Format time from timestamp
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 1) return "Vừa xong";
        if (diffMinutes < 60) return `${diffMinutes} phút`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} giờ`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} ngày`;
        
        return date.toLocaleDateString('vi-VN');
    };

    // Lọc các cuộc hội thoại dựa trên thuật ngữ tìm kiếm
    const filteredConversations = conversations.filter(convo => {
        return convo.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               (convo.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    });

    return (
        <>
            {/* Thêm kiểu thanh cuộn vào tài liệu */}
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
            
            <AnimatePresence>
                {isVisible && !selectedChat && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="fixed bottom-4 right-4 w-[25rem] bg-gradient-to-br from-pink-50 to-pink-100 text-pink-800 shadow-xl rounded-xl border border-pink-200/70 z-50 top-[4rem] flex flex-col max-h-[90vh] dark:from-pink-100/90 dark:to-pink-200/90 dark:text-pink-900 backdrop-blur-sm"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-300/80 to-pink-400/80 rounded-t-xl dark:from-pink-300 dark:to-pink-400 backdrop-blur-md">
                            <span className="font-semibold text-lg text-pink-800 dark:text-pink-900 pl-1">Đoạn chat</span>
                            <button 
                                onClick={onClose} 
                                className="text-pink-700 hover:text-pink-900 transition-colors p-1.5 hover:bg-pink-200/50 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-3 border-b border-pink-200 flex items-center bg-pink-100/80 dark:bg-pink-200/80">
                            <div className="flex items-center space-x-2 w-full py-1 px-3 bg-white/70 rounded-full border border-pink-200/50 shadow-sm">
                                <Search size={18} className="text-pink-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm trên Messenger"
                                    className="bg-transparent text-pink-700 placeholder-pink-400 w-full py-1.5 focus:outline-none dark:text-pink-800 dark:placeholder-pink-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Danh sách tin nhắn với thanh cuộn nâng cao */}
                        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar
                            scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent 
                            hover:scrollbar-thumb-pink-400 
                            dark:scrollbar-thumb-pink-400 dark:hover:scrollbar-thumb-pink-500 
                            scrollbar-thumb-rounded-full scrollbar-track-rounded-full 
                            transition-all duration-300">
                            {loading && (
                                <div className="flex justify-center items-center h-40">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-pink-500"></div>
                                        <p className="text-pink-500 mt-3 text-sm">Đang tải đoạn chat...</p>
                                    </div>
                                </div>
                            )}
                            
                            {error && (
                                <div className="text-pink-500 text-center p-5 mt-4 bg-pink-50/80 backdrop-blur-sm rounded-lg shadow-sm border border-pink-200">
                                    <div className="mb-2 text-2xl">😕</div>
                                    {error}
                                    <button 
                                        onClick={fetchConversations}
                                        className="mt-3 text-white bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg text-sm transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            )}

                            {!loading && filteredConversations.length === 0 && (
                                <div className="text-pink-600 text-center p-8 mt-4 bg-pink-50/60 backdrop-blur-sm rounded-xl border border-pink-100">
                                    <div className="text-4xl mb-3">💬</div>
                                    <p className="font-medium">
                                        {searchTerm ? "Không tìm thấy kết quả" : "Không có đoạn chat nào"}
                                    </p>
                                    <p className="text-pink-500 text-sm mt-2">
                                        {searchTerm ? "Thử từ khoá khác" : "Bắt đầu trò chuyện với ai đó"}
                                    </p>
                                </div>
                            )}

                            <ul className="space-y-3 mt-1">
                                {filteredConversations.map((convo) => (
                                    <motion.li
                                        key={convo.id}
                                        whileHover={{ scale: 1.03, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        onClick={() => handleChatClick(convo)}
                                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-200/80 hover:to-pink-100/80 cursor-pointer border border-transparent hover:border-pink-300/40 transition-all duration-200 dark:hover:bg-pink-300/60 shadow-sm hover:shadow-md"
                                    >
                                        <div className="relative">
                                            <Avatar 
                                                src={convo.receiverAvatar}
                                                alt={convo.receiverName}
                                                size="md"
                                                className="border-2 border-pink-300/80 shadow-sm"
                                            />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-pink-800 dark:text-pink-900">
                                                {convo.receiverName}
                                            </p>
                                            <p className="text-xs text-pink-600 truncate dark:text-pink-700 mt-0.5">
                                                {convo.lastMessage ? (
                                                    convo.lastMessage.length > 25 
                                                        ? convo.lastMessage.substring(0, 25) + "..." 
                                                        : convo.lastMessage
                                                ) : (
                                                    <span className="italic">Chưa có tin nhắn</span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <div className="text-xs text-pink-500 dark:text-pink-600 font-medium">
                                                {formatTime(convo.updatedAt)}
                                            </div>
                                            <button 
                                                onClick={(e) => handleDeleteConversation(e, convo.id)}
                                                className="text-pink-400 hover:text-pink-600 p-1.5 rounded-full hover:bg-pink-100 transition-colors opacity-60 hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Editor Popup */}
            {selectedChat && selectedConversation && (
                <MessageEditor 
                    chatName={selectedChat} 
                    onClose={() => {
                        setSelectedChat(null);
                        setSelectedConversation(null);
                    }}
                    conversationId={selectedConversation.id}
                    receiverId={selectedConversation.receiverId} 
                />
            )}
        </>
    );
};

export default MessageList;
