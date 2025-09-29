import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession, type UserRole } from "@/stores/useSession";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children?: React.ReactNode;
  roles?: UserRole[];
  fallbackPath?: string;
}

export const RequireAuth = ({
  children,
  roles = [],
  fallbackPath = "/login",
}: RequireAuthProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      const nextParam = encodeURIComponent(location.pathname + location.search);
      const target =
        fallbackPath === "/login" ? `/login?next=${nextParam}` : fallbackPath;

      navigate(target, { replace: true });
    }
  }, [user, isLoading, navigate, location, fallbackPath]);

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

  if (!user) {
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};
