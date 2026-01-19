import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userService, { UserRequest, UserResponse } from '../../services/user';
import Avatar from '../atoms/Avatar';
import EditUserModal from './EditUserModal';
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE' | 'BANNED' | 'DELETED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const { refreshUser } = useAuth();
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Format date to relative time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Handle user status change
  

  // Handle user role change
  const handleRoleChange = async (userId: number, newRole: 'USER' | 'ADMIN') => {
    try {
      // Get the current user data
      const currentUser = users.find(user => user.id === userId);
      if (!currentUser) return;

      // Create complete user data with updated role
      const completeUserData: UserRequest = {
        ...currentUser,
        role: newRole
      };
      
      // Update user role in the backend with complete data
      await userService.updateUserProfile(userId, completeUserData);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...completeUserData } : user
      ));
      refreshUser();
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role. Please try again.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete user from the backend
        await userService.deleteUser(userId);
        
        // Update local state
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  // Handle user view
  const handleViewUser = (userId: number) => {
    // Navigate to user profile
    window.location.href = `/profile/${userId}`;
  };

  // Handle user edit
  const handleEditUser = (user: UserResponse) => {
    setEditingUser(user);
  };

  // Handle save user
  const handleSaveUser = async (userData: UserRequest) => {
    if (!userData.id) return;
    
    try {
      // Get the current user data
      const currentUser = users.find(user => user.id === userData.id);
      if (!currentUser) return;

      // Merge the current user data with the updated fields
      const completeUserData: UserRequest = {
        ...currentUser,
        ...userData
      };
      
      // Send the complete user data to the backend
      await userService.updateUserProfile(userData.id, completeUserData);
      
      // Update local state with the complete user data
      setUsers(users.map(user => 
        user.id === userData.id ? { ...user, ...completeUserData } : user
      ));
      refreshUser();
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      throw new Error('Failed to update user. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Management</h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <select
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ONLINE' | 'OFFLINE' | 'BANNED' | 'DELETED')}
          >
            <option value="ALL">All Statuses</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="BANNED">Banned</option>
            <option value="DELETED">Deleted</option>
          </select>
          <select
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-neutral-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-700 dark:bg-neutral-800">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <Avatar
                        src={user.avatarUrl}
                        alt={user.fullName}
                        size='sm'
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      className={`rounded-md border px-2 py-1 text-sm focus:outline-none ${
                        user.role === 'ADMIN'
                          ? 'border-purple-500 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-sm font-medium ${
                        user.status === 'ONLINE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : user.status === 'OFFLINE'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          : user.status === 'BANNED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(user.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      className="mr-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => handleViewUser(user.id)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="mr-2 text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      onClick={() => handleEditUser(user)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
        <div className="flex space-x-2">
          <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600">
            Previous
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
            Next
          </button>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UserManagement; 