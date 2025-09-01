import { AdminAuthProvider, useAdminAuth } from '../contexts/AdminAuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminProfileCompletion from './AdminProfileCompletion';

function AdminAppContent() {
  const { isAuthenticated, isLoading, isProfileComplete } = useAdminAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onSuccess={() => {}} 
      />
    );
  }

  // Show profile completion if profile is incomplete
  if (!isProfileComplete) {
    return <AdminProfileCompletion />;
  }

  // Show dashboard if authenticated and profile is complete
  return <AdminDashboard />;
}

const AdminApp = () => {
  return (
    <AdminAuthProvider>
      <AdminAppContent />
    </AdminAuthProvider>
  );
};

export default AdminApp;
