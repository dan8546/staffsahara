import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the current user and session
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          if (userError.message?.includes('otp_expired')) {
            setError('otp_expired');
          } else {
            setError(userError.message);
          }
          setIsLoading(false);
          return;
        }

        if (user) {
          // Auto-provision the user profile
          await supabase.rpc('ensure_profile_auto', {
            p_full_name: user.email,
            p_default_role: 'talent',
            p_account_type: 'talent'
          });

          // Get redirect destination
          const next = searchParams.get('next') || '/';
          
          // Success message
          toast({
            title: t('auth.login_success'),
            description: t('auth.welcome_back', { fallback: 'Bienvenue !' }),
          });

          // Navigate to destination
          navigate(next, { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Une erreur inattendue s\'est produite');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [navigate, searchParams, toast, t]);

  const handleResendLink = async () => {
    const email = searchParams.get('email');
    if (!email) {
      toast({
        title: "Erreur",
        description: "Adresse email non trouvée",
        variant: "destructive",
      });
      return;
    }

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
        title: t('auth.check_mail'),
        description: "Un nouveau lien de connexion a été envoyé",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-ink-700">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (error === 'otp_expired') {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-ink-900">
              {t('auth.link_expired')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-ink-700">
              Le lien de connexion a expiré ou est invalide.
            </p>
            <Button onClick={handleResendLink} className="w-full">
              {t('auth.resend')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-ink-900">
              Erreur de connexion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-ink-700">{error}</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback;