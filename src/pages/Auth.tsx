import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/stores/useSession";
import { Seo } from "@/components/Seo";

const Auth = () => {
  const { t } = useTranslation();
  const { cleanupAuthState } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.warn('Global signout failed:', err);
      }

      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      setMessage(
        "Inscription réussie ! Un email de confirmation a été envoyé. " +
        "Veuillez noter que l'accès est soumis à approbation par notre équipe."
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Email de réinitialisation envoyé !');
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo 
        title="Connexion" 
        description="Connectez-vous à votre espace Staff Sahara"
        noindex={true}
      />
      <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ink-900 mb-2">
              Staff Sahara
            </h1>
            <p className="text-ink-700">
              Accédez à votre espace professionnel
            </p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Connectez-vous avec votre compte professionnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email professionnel</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          required
                          placeholder="votre.email@entreprise.com"
                          className="pl-10 rounded-2xl"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          required
                          className="pl-10 rounded-2xl"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-2xl" 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Se connecter
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Inscription</CardTitle>
                  <CardDescription>
                    Créez votre compte professionnel (soumis à approbation)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          className="rounded-2xl"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          className="rounded-2xl"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email professionnel</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          required
                          placeholder="votre.email@entreprise.com"
                          className="pl-10 rounded-2xl"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          required
                          className="pl-10 rounded-2xl"
                          disabled={loading}
                          minLength={6}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full rounded-2xl" 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      S'inscrire
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Tabs defaultValue="forgot">
              <TabsList className="bg-transparent p-0">
                <TabsTrigger value="forgot" className="p-0 bg-transparent data-[state=active]:bg-transparent">
                  <Button variant="link" size="sm">
                    Mot de passe oublié ?
                  </Button>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="forgot" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Réinitialiser le mot de passe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input
                          id="forgot-email"
                          name="email"
                          type="email"
                          required
                          className="rounded-2xl"
                          disabled={loading}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full rounded-2xl" 
                        disabled={loading}
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Envoyer l'email
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;