import React, { useRef, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmModal from '../ConfirmModal';

interface DropdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    postAuthorId: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onReport?: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
    isOpen, 
    className = '',
    postAuthorId,
    onEdit,
    onDelete,
    onReport
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Check if current user is admin or post author
    const isAdmin = user?.role == 'ADMIN';
    const isPostAuthor = user?.id == postAuthorId;
    const canEditOrDelete = isAdmin || isPostAuthor;


    if (!isOpen) return null;

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        }
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <div 
                ref={dropdownRef}
                className={`absolute right-0 top-full mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-neutral-800 z-50 ${className}`}
            >
                <div className="py-1" role="menu" aria-orientation="vertical">
                    {canEditOrDelete && (
                        <button
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700"
                            role="menuitem"
                            onClick={onEdit}
                        >
                            <i className="fas fa-edit mr-3"></i>
                            Chỉnh sửa
                        </button>
                    )}
                    {canEditOrDelete && (
                        <button
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700"
                            role="menuitem"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <i className="fas fa-trash-alt mr-3"></i>
                            Xóa
                        </button>
                    )}
                    <button
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-700"
                        role="menuitem"
                        onClick={onReport}
                    >
                        <i className="fas fa-flag mr-3"></i>
                        Báo cáo
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa bài viết này không?"
            />
        </>
    );
};

export default DropdownMenu; 