import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import FriendsLayout from '../components/layouts/FriendsLayout';
import NewsFeedLayout from '../components/layouts/NewsFeedLayout';
import ProfilePageLayout from '../components/layouts/ProfilePageLayout';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import ForgotPasswordPage from '../pages/global/forgot-password';
import LoginPage from '../pages/global/login';
import ResetPasswordPage from '../pages/global/reset-password';
import RegisterPage from '../pages/global/signup';
import NewsFeedPage from '../pages/user/newsfeed';
import ProfilePage from '../pages/user/profile';
import UserSearch from '../pages/UserSearch';
import { ADMIN_DASHBOARD, FORGOT, HOME, LOGIN, PROFILE, PROFILE_BY_ID, REGISTER, RESET_PASSWORD, USER_SEARCH } from './routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  layout?: React.ComponentType<{ children: React.ReactNode }>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  layout: Layout,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={LOGIN} replace />;
  }

  if (Layout) {
    return <Layout>{children}</Layout>;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user || user.role != 'ADMIN') {
    return <Navigate to={HOME} />;
  }

  return <>{children}</>;
};

const Routers: React.FC = () => {

  return (
    <Routes>
      {/* Public routes */}
      <Route path={LOGIN} element={<LoginPage />} />
      <Route path={REGISTER} element={<RegisterPage />} />
      <Route path={FORGOT} element={<ForgotPasswordPage />} />
      <Route path={RESET_PASSWORD} element={<ResetPasswordPage />} />
      {/* Protected routes */}
      <Route
        path={HOME}
        element={
          <div className="bg-[#ffe8fe] dark:bg-[#18191a]">
            <ProtectedRoute layout={NewsFeedLayout}>
              <NewsFeedPage />
            </ProtectedRoute>
          </div>
        }
      />

      <Route
        path={PROFILE}
        element={
          <ProtectedRoute layout={ProfilePageLayout}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={PROFILE_BY_ID}
        element={
          <ProtectedRoute layout={ProfilePageLayout}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={USER_SEARCH}
        element={
          <ProtectedRoute layout={FriendsLayout}>
            <UserSearch />
          </ProtectedRoute>
        }
      />
      {/* Admin routes */}
      <Route
        path={ADMIN_DASHBOARD}
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to={HOME} replace />} />
    </Routes>
  );
};

export default Routers;
