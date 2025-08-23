import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession, UserRole } from "@/stores/useSession";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallbackPath?: string;
}

export const RequireAuth = ({ 
  children, 
  roles = [], 
  fallbackPath = "/login" 
}: RequireAuthProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading, checkRole } = useSession();

  useEffect(() => {
    // Still loading, wait
    if (isLoading) return;

    // Not authenticated, redirect to login
    if (!user) {
      navigate(fallbackPath, { 
        state: { from: location },
        replace: true 
      });
      return;
    }

    // User authenticated but no profile yet (invitation-only system)
    if (user && !profile) {
      navigate("/pending-approval", { replace: true });
      return;
    }

    // Check role-based access
    if (roles.length > 0 && !checkRole(roles)) {
      navigate("/unauthorized", { replace: true });
      return;
    }
  }, [user, profile, isLoading, roles, navigate, location, fallbackPath, checkRole]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-ink-700">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Authenticated but no profile (will redirect)
  if (!profile) {
    return null;
  }

  // Role check failed (will redirect)
  if (roles.length > 0 && !checkRole(roles)) {
    return null;
  }

  // All checks passed
  return <>{children}</>;
};