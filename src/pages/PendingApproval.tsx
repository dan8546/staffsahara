import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const PendingApproval = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-brand-blue" />
          </div>
          <CardTitle className="text-2xl text-ink-900">
            Inscription en attente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-ink-700 leading-relaxed">
            Votre inscription a été reçue avec succès. Notre équipe examine votre demande 
            et vous contactera sous 24-48h pour finaliser l'activation de votre compte.
          </p>
          
          <div className="bg-paper-0 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-ink-900">Besoin d'aide ?</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-ink-600">
                <Mail className="h-4 w-4" />
                <span>contact@staff-sahara.com</span>
              </div>
              <div className="flex items-center gap-2 text-ink-600">
                <Phone className="h-4 w-4" />
                <span>+213 (0) 29 XX XX XX</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full rounded-2xl">
              <Link to="/">
                Retour à l'accueil
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-2xl">
              <Link to="/login">
                Se reconnecter
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;