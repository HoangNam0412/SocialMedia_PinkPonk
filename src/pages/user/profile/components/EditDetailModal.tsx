import React, { useState } from 'react';
import { UserRequest, UserResponse } from '../../../../services/user';

interface EditDetailModalProps {
  user: UserResponse;
  setShowDetailModal: (show: boolean) => void;
  onSaveDetails: (userData: UserRequest) => Promise<string | void>;
}

const EditDetailModal: React.FC<EditDetailModalProps> = ({
  user,
  setShowDetailModal,
  onSaveDetails,
}) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    location: user.location || '',
    age: user.age || '',
    phoneNumber: user.phoneNumber || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value) : '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const userData: UserRequest = {
        ...user,
        fullName: formData.fullName,
        location: formData.location,
        age: formData.age ? Number(formData.age) : undefined,
        phoneNumber: formData.phoneNumber,
      };

      await onSaveDetails(userData);
      setShowDetailModal(false);
    } catch (err: any) {
      console.error('Error saving profile details:', err);
      setError(err.message || 'Lỗi cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
      <div className="w-[450px] rounded-xl bg-white p-6 shadow-xl transition-all duration-300 dark:bg-[#2A1C22]/90 dark:shadow-pink-900/10 modal-pop">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-pink-700 dark:text-pink-300">
            Chỉnh sửa hồ sơ
          </h3>
          <button 
            onClick={() => setShowDetailModal(false)}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-medium text-pink-700 dark:text-pink-300"
            >
              <div className="flex items-center">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Họ và tên
              </div>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-pink-100 bg-pink-50/50 p-2.5 text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:border-pink-900/20 dark:bg-pink-900/10 dark:text-gray-200 dark:placeholder-pink-400/30 dark:focus:border-pink-700 dark:focus:ring-pink-700/30"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1.5 block text-sm font-medium text-pink-700 dark:text-pink-300"
            >
              <div className="flex items-center">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Địa chỉ
              </div>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-xl border border-pink-100 bg-pink-50/50 p-2.5 text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:border-pink-900/20 dark:bg-pink-900/10 dark:text-gray-200 dark:placeholder-pink-400/30 dark:focus:border-pink-700 dark:focus:ring-pink-700/30"
              placeholder="Thành phố, Quốc gia"
            />
          </div>

          <div>
            <label
              htmlFor="age"
              className="mb-1.5 block text-sm font-medium text-pink-700 dark:text-pink-300"
            >
              <div className="flex items-center">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                Tuổi
              </div>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              className="w-full rounded-xl border border-pink-100 bg-pink-50/50 p-2.5 text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:border-pink-900/20 dark:bg-pink-900/10 dark:text-gray-200 dark:placeholder-pink-400/30 dark:focus:border-pink-700 dark:focus:ring-pink-700/30"
              placeholder="25"
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-1.5 block text-sm font-medium text-pink-700 dark:text-pink-300"
            >
              <div className="flex items-center">
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Số điện thoại
              </div>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full rounded-xl border border-pink-100 bg-pink-50/50 p-2.5 text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:border-pink-900/20 dark:bg-pink-900/10 dark:text-gray-200 dark:placeholder-pink-400/30 dark:focus:border-pink-700 dark:focus:ring-pink-700/30"
              placeholder="+84 123 456 789"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-medium text-pink-700 transition-all duration-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
              onClick={() => setShowDetailModal(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center rounded-full bg-pink-500 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-pink-600 hover:shadow-lg disabled:bg-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 disabled:dark:bg-pink-800/50"
              disabled={saving}
            >
              {saving ? (
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
        </form>
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

export default EditDetailModal;
  