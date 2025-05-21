
import React from 'react';
import NavBar from './NavBar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
