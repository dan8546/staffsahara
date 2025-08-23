import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-ink-900">
            Accès non autorisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-ink-700 leading-relaxed">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page. 
            Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline" 
              className="w-full rounded-2xl gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button asChild className="w-full rounded-2xl gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;