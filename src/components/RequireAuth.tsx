import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "@/stores/useSession";
import { Loader2 } from "lucide-react";

type RequireAuthProps = {
  children?: React.ReactNode;
  /** kept for compat but ignored */
  roles?: string[];
  fallbackPath?: string;
};

export const RequireAuth = ({
  children,
  fallbackPath = "/login",
}: RequireAuthProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;

    // seul contrôle : être connecté
    if (!user) {
      const nextParam = encodeURIComponent(
        location.pathname + location.search
      );
      const target =
        fallbackPath === "/login" ? `/login?next=${nextParam}` : fallbackPath;

      navigate(target, { replace: true });
    }
  }, [user, isLoading, navigate, location, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement…</p>
        </div>
      </div>
    );
  }

  // si non connecté, on a déjà redirigé
  if (!user) return null;

  // pas de check rôle/statut
  return children ? <>{children}</> : <Outlet />;
};

export default RequireAuth;
