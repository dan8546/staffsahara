import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, User, Building } from "lucide-react";

const Login = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">
            {t('nav.login')}
          </h1>
          <p className="text-ink-700">
            Accédez à votre espace Staff Sahara
          </p>
        </div>

        <Tabs defaultValue="candidate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidate">Candidat</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
          </TabsList>

          <TabsContent value="candidate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-blue" />
                  Espace Candidat
                </CardTitle>
                <CardDescription>
                  Accédez à votre passeport et vos missions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                    <Input
                      id="candidate-email"
                      type="email"
                      placeholder="votre.email@example.com"
                      className="pl-10 rounded-2xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                    <Input
                      id="candidate-password"
                      type="password"
                      className="pl-10 rounded-2xl"
                    />
                  </div>
                </div>
                <Button className="w-full rounded-2xl shadow-soft">
                  Se connecter
                </Button>
                <div className="text-center space-y-2">
                  <Button variant="link" size="sm">
                    Mot de passe oublié ?
                  </Button>
                  <div className="text-sm text-ink-600">
                    Pas encore de compte ?{" "}
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      {t('cta.createPassport')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-brand-blue" />
                  Espace Client
                </CardTitle>
                <CardDescription>
                  Accédez à vos RFQ et tableaux de bord
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="contact@entreprise.com"
                      className="pl-10 rounded-2xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
                    <Input
                      id="client-password"
                      type="password"
                      className="pl-10 rounded-2xl"
                    />
                  </div>
                </div>
                <Button className="w-full rounded-2xl shadow-soft">
                  Se connecter
                </Button>
                <div className="text-center space-y-2">
                  <Button variant="link" size="sm">
                    Mot de passe oublié ?
                  </Button>
                  <div className="text-sm text-ink-600">
                    Nouveau client ?{" "}
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Demander un accès
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SSO Options */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-ink-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-paper-0 px-2 text-ink-500">Ou connectez-vous avec</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" className="rounded-2xl">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button variant="outline" className="rounded-2xl">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;