import React, { ChangeEvent, useRef, useState } from 'react';
import mediaService from '../../../../services/media';
import { UserRequest, UserResponse } from '../../../../services/user';

interface EditAvatarModalProps {
  user: UserResponse;
  setShowAvatarModal: (show: boolean) => void;
  onSaveAvatar: (userData: UserRequest) => Promise<string | void>;
}

const EditAvatarModal: React.FC<EditAvatarModalProps> = ({
  user,
  setShowAvatarModal,
  onSaveAvatar,
}) => {
  const [avatar, setAvatar] = useState<string>(user.avatarUrl || '');
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.avatarUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      setError('Vui lòng chọn tệp hình ảnh (JPEG, PNG, v.v.)');
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước tệp không được vượt quá 2MB');
      return;
    }

    setError(null);
    setFileUploading(true);

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // In a real app, you would upload the file to a server here
    // For now, we'll simulate by setting the URL directly
    try {
      const responseUrl = await mediaService.uploadMedia(file);
      setAvatar(responseUrl as string);
    } catch (err) {
      setError('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    } finally {
      setFileUploading(false);
    }
  };

  const handleSave = async () => {
    if (!avatar) {
      setError('Vui lòng chọn ảnh đại diện');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const userData: UserRequest = {
        ...user,
        avatarUrl: avatar[0],
      };

      await onSaveAvatar(userData);
      setShowAvatarModal(false);
    } catch (err: any) {
      console.error('Error saving avatar:', err);
      setError(err.message || 'Lỗi cập nhật ảnh đại diện. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
      <div className="w-[500px] rounded-xl bg-white p-6 shadow-xl transition-all duration-300 dark:bg-[#2A1C22]/90 dark:shadow-pink-900/10 modal-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-pink-700 dark:text-pink-300">
            Chỉnh sửa ảnh đại diện
          </h3>
          <button 
            onClick={() => setShowAvatarModal(false)}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-pink-50 hover:text-pink-500 dark:text-gray-300 dark:hover:bg-pink-900/20 dark:hover:text-pink-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600 shadow-sm dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-center">
              <svg className="mr-2 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col items-center">
          <div 
            className="group relative h-40 w-40 cursor-pointer overflow-hidden rounded-full border-3 border-dashed border-pink-200 bg-pink-50/50 transition-all hover:border-pink-300 dark:border-pink-800 dark:bg-pink-900/10 dark:hover:border-pink-700"
            onClick={triggerFileInput}
          >
            {fileUploading ? (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <svg className="h-10 w-10 animate-spin text-pink-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-sm text-pink-500/70 dark:text-pink-400/70">Đang tải lên...</p>
              </div>
            ) : previewImage ? (
              <>
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <svg
                  className="mb-2 h-12 w-12 text-pink-300 dark:text-pink-500/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <p className="text-center text-sm text-pink-500/70 dark:text-pink-400/70">
                  Nhấp để tải lên ảnh đại diện
                </p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <p className="mt-4 text-center text-xs text-pink-500/70 dark:text-pink-400/70">
            Khuyến nghị: Hình ảnh vuông. Kích thước tối đa: 2MB
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-medium text-pink-700 transition-all duration-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
            onClick={() => setShowAvatarModal(false)}
            disabled={uploading || fileUploading}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="flex items-center rounded-full bg-pink-500 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-pink-600 hover:shadow-lg disabled:bg-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 disabled:dark:bg-pink-800/50"
            onClick={handleSave}
            disabled={uploading || fileUploading || !previewImage}
          >
            {uploading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes modalPop {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .modal-pop {
            animation: modalPop 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default EditAvatarModal; 