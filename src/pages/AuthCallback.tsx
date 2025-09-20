import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";

const AuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth callback error:', authError);
          if (authError.message.includes('expired') || authError.message.includes('invalid')) {
            setError('link_expired');
          } else {
            setError(authError.message);
          }
          return;
        }

        if (data.user) {
          // Auto-provision profile as active
          await supabase.rpc('ensure_profile_auto', {
            p_full_name: data.user.email,
            p_default_role: 'talent',
            p_account_type: 'talent'
          });

          // Get redirect URL and navigate
          const next = searchParams.get('next') || '/';
          toast({
            title: t("auth.login_success"),
            description: t("auth.welcome_back"),
          });
          navigate(next, { replace: true });
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        setError('Une erreur inattendue s\'est produite');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, t]);

  const handleResendLink = async () => {
    const email = searchParams.get('email');
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("auth.check_mail"),
        description: "Un nouveau lien de connexion a été envoyé.",
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <Seo 
          title="Connexion en cours..."
          description="Finalisation de votre connexion"
        />
        <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
              </div>
              <CardTitle className="text-2xl text-ink-900">
                Connexion en cours...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Seo 
          title="Erreur de connexion"
          description="Une erreur s'est produite lors de la connexion"
        />
        <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {error === 'link_expired' ? (
                  <Mail className="h-10 w-10 text-red-600" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <CardTitle className="text-2xl text-ink-900">
                {error === 'link_expired' ? t("auth.link_expired") : 'Erreur de connexion'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-ink-700 leading-relaxed">
                {error === 'link_expired' 
                  ? "Le lien de connexion a expiré ou n'est plus valide."
                  : typeof error === 'string' ? error : 'Une erreur inattendue s\'est produite.'
                }
              </p>

              <div className="space-y-3">
                {error === 'link_expired' && (
                  <Button 
                    onClick={handleResendLink}
                    disabled={loading}
                    className="w-full rounded-2xl gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {t("auth.resend")}
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full rounded-2xl"
                >
                  Retour à la connexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return null;
};

export default AuthCallback;