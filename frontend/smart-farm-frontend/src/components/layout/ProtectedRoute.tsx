import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Himoyalangan route wrapper.
 *
 * - Login qilinmagan bo'lsa → /login ga yo'naltiradi
 * - requireAdmin=true va role ADMIN bo'lmasa → /dashboard ga yo'naltiradi
 *   (backend dagi AdminGuard bilan bir xil mantiq)
 */
export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.memberRole !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
