import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const hash = window.location.hash ?? "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const error = params.get("error");
    const errorDescription = params.get("error_description") ?? "";
    const next = searchParams.get("next") || "/";

    if (error) {
      toast({
        title: t("auth.link_expired"),
        description: errorDescription || undefined,
        variant: "destructive",
      });

      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }

    const run = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError || !data?.user) {
          if (authError) {
            console.error("Auth callback error:", authError);
          }
          navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
          return;
        }

        const { error: rpcError } = await supabase.rpc("ensure_profile_auto", {
          p_full_name: data.user.email,
          p_default_role: "talent",
          p_account_type: "talent",
        });

        if (rpcError) {
          console.error("ensure_profile_auto error:", rpcError);
        }

        toast({ title: t("auth.login_success") });
        navigate(next, { replace: true });
      } catch (err) {
        console.error("Auth callback unexpected error:", err);
        navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      }
    };

    run();
  }, [navigate, searchParams, t, toast]);

  return null;
};

export default AuthCallback;
