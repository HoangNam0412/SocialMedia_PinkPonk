import React, { useState } from 'react';
import { UserRequest, UserResponse } from '../../services/user';

interface EditUserModalProps {
  user: UserResponse;
  onClose: () => void;
  onSave: (userData: UserRequest) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserRequest>({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    coverPhoto: user.coverPhoto,
    age: user.age,
    location: user.location,
    role: user.role,
    status: user.status
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] overflow-y-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-neutral-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Edit User
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-gray-200"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></svg>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal; 