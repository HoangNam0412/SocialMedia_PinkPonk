import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PostManagement from '../components/admin/PostManagement';
import ReportManagement from '../components/admin/ReportManagement';
import UserManagement from '../components/admin/UserManagement';
import { useAuth } from '../contexts/AuthContext';
import postService from '../services/post';
import reportService from '../services/report';
import userService from '../services/user';

interface DashboardStats {
  userCount: number;
  postCount: number;
  reportCount: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'reports'>('users');
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    postCount: 0,
    reportCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Get all users to count them
        const users = await userService.getAllUsers();
        const posts = await postService.getPosts();
        const allReports = await reportService.getReports();
        
        // Filter reports to only count those with PENDING status
        const pendingReports = allReports.filter(report => report.status === 'PENDING');
        
        setStats({
          userCount: users.length,
          postCount: posts.length || 0,
          reportCount: pendingReports.length || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // Tab animation variants
  const tabVariants = {
    inactive: { opacity: 0.7, y: 5 },
    active: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    hover: { 
      scale: 1.05, 
      opacity: 0.9,
      transition: { duration: 0.2 }
    }
  };

  // Content animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: 0.2 
      }
    }
  };

  // Stats card variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1 * custom
      }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/70 to-white dark:from-[#2D1A24]/90 dark:to-[#1F1720]">
      {/* Dashboard header */}
      <div className="bg-white dark:bg-[#2A1C22] shadow-md dark:shadow-pink-950/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/50 dark:text-pink-300">
                <i className="fas fa-crown text-xl"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-pink-500 dark:from-pink-300 dark:to-pink-400">
                Admin Dashboard
              </h1>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-3">
              <span className="text-pink-600/70 dark:text-pink-400/70 text-sm">Đang đăng nhập với tư cách</span>
              <div className="flex items-center space-x-2 bg-pink-50 dark:bg-pink-900/30 px-3 py-1.5 rounded-full">
                <div className="h-6 w-6 rounded-full bg-pink-200 dark:bg-pink-700 flex items-center justify-center">
                  <i className="fas fa-user-shield text-xs text-pink-700 dark:text-pink-200"></i>
                </div>
                <span className="font-medium text-pink-700 dark:text-pink-300">{user.fullName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="flex items-center bg-white dark:bg-[#2A1C22]/70 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-pink-100/50 dark:border-pink-900/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-300">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng người dùng</h2>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {isLoading ? (
                  <span className="inline-block w-12 h-8 bg-blue-100 dark:bg-blue-900/30 rounded animate-pulse"></span>
                ) : (
                  stats.userCount
                )}
              </p>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="flex items-center bg-white dark:bg-[#2A1C22]/70 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-pink-100/50 dark:border-pink-900/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300">
              <i className="fas fa-newspaper text-xl"></i>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng bài viết</h2>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-300">
                {isLoading ? (
                  <span className="inline-block w-12 h-8 bg-pink-100 dark:bg-pink-900/30 rounded animate-pulse"></span>
                ) : (
                  stats.postCount
                )}
              </p>
            </div>
          </motion.div>

          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="flex items-center bg-white dark:bg-[#2A1C22]/70 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-pink-100/50 dark:border-pink-900/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-300">
              <i className="fas fa-flag text-xl"></i>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Báo cáo chưa xử lý</h2>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                {isLoading ? (
                  <span className="inline-block w-12 h-8 bg-orange-100 dark:bg-orange-900/30 rounded animate-pulse"></span>
                ) : (
                  stats.reportCount
                )}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tabs navigation */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-md dark:bg-[#2A1C22] dark:shadow-pink-950/10 border border-pink-100/20 dark:border-pink-900/20">
          <div className="flex flex-wrap space-x-1 sm:space-x-4 border-b border-pink-100 dark:border-pink-900/50 pb-1">
            <motion.button
              initial={activeTab === 'users' ? 'active' : 'inactive'}
              animate={activeTab === 'users' ? 'active' : 'inactive'}
              whileHover="hover"
              variants={tabVariants}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-pink-500 text-white shadow-md dark:bg-pink-600 dark:shadow-pink-950/20'
                  : 'text-gray-600 hover:bg-pink-50 dark:text-gray-300 dark:hover:bg-pink-900/30'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users mr-2"></i>
              User Management
            </motion.button>
            <motion.button
              initial={activeTab === 'posts' ? 'active' : 'inactive'}
              animate={activeTab === 'posts' ? 'active' : 'inactive'}
              whileHover="hover"
              variants={tabVariants}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'posts'
                  ? 'bg-pink-500 text-white shadow-md dark:bg-pink-600 dark:shadow-pink-950/20'
                  : 'text-gray-600 hover:bg-pink-50 dark:text-gray-300 dark:hover:bg-pink-900/30'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              <i className="fas fa-newspaper mr-2"></i>
              Post Management
            </motion.button>
            <motion.button
              initial={activeTab === 'reports' ? 'active' : 'inactive'}
              animate={activeTab === 'reports' ? 'active' : 'inactive'}
              whileHover="hover"
              variants={tabVariants}
              className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'reports'
                  ? 'bg-pink-500 text-white shadow-md dark:bg-pink-600 dark:shadow-pink-950/20'
                  : 'text-gray-600 hover:bg-pink-50 dark:text-gray-300 dark:hover:bg-pink-900/30'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <i className="fas fa-flag mr-2"></i>
              Report Management
            </motion.button>
          </div>
        </div>

        {/* Content area */}
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          variants={contentVariants}
          className="rounded-xl bg-white p-6 shadow-md dark:bg-[#2A1C22] dark:shadow-pink-950/10 border border-pink-100/20 dark:border-pink-900/20"
        >
          {activeTab === 'users' ? (
            <UserManagement />
          ) : activeTab === 'posts' ? (
            <PostManagement />
          ) : (
            <ReportManagement />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 