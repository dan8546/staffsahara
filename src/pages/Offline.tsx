import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Offline = () => {
  const { t } = useTranslation();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="h-10 w-10 text-brand-blue" />
          </div>
          <CardTitle className="text-2xl text-ink-900">
            {t('offline.title', 'Connexion indisponible')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-ink-700 leading-relaxed">
            {t('offline.description', 'Vous êtes actuellement hors ligne. Veuillez vérifier votre connexion internet et réessayer.')}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full rounded-2xl gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('offline.retry', 'Réessayer')}
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              className="w-full rounded-2xl gap-2"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                {t('offline.home', 'Retour à l\'accueil')}
              </Link>
            </Button>
          </div>

          {/* Offline Features */}
          <div className="border-t border-ink-200 pt-6 mt-6">
            <h3 className="font-semibold text-ink-900 mb-3">
              {t('offline.features_title', 'Fonctionnalités hors ligne')}
            </h3>
            <ul className="text-sm text-ink-600 space-y-2 text-left">
              <li>• {t('offline.feature1', 'Consultation des pages visitées récemment')}</li>
              <li>• {t('offline.feature2', 'Accès aux informations de contact')}</li>
              <li>• {t('offline.feature3', 'Navigation entre les sections principales')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Offline;