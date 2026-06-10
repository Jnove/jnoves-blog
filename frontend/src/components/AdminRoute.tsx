import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return <p style={{ padding: '24px' }}>加载中…</p>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
