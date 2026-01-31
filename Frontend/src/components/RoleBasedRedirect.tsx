import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const RoleBasedRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { isAuthenticated, getUserRole } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const role = getUserRole();
      
      // Redirect vendors and admins to their dashboards
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'VENDOR') {
        navigate('/vendor', { replace: true });
      }
      // Customers stay on the current page
    }
  }, [isAuthenticated, getUserRole, navigate]);

  return <>{children}</>;
};
