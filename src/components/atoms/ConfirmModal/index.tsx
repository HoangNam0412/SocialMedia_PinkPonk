import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xóa',
    cancelText = 'Hủy'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-800">
                <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
                    {title}
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    {message}
                </p>
                <div className="flex justify-end space-x-2">
                    <button
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        onClick={() => {
                            onConfirm();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal; 