import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RFQ = () => {
  const { t } = useTranslation();

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-ink-900 mb-4">
          {t('nav.rfq')}
        </h1>
        <p className="text-xl text-ink-700 max-w-3xl mx-auto">
          Décrivez vos besoins en personnel et recevez un devis détaillé sous 48h
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-soft transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-brand-blue">{t('rfq.step1')}</CardTitle>
            <CardDescription>
              Définissez les profils recherchés et les volumes nécessaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-2xl">
              Commencer
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-soft transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-brand-blue">{t('rfq.step2')}</CardTitle>
            <CardDescription>
              Spécifiez vos sites d'intervention et exigences SLA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-2xl">
              Configurer
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-soft transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-brand-blue">{t('rfq.step3')}</CardTitle>
            <CardDescription>
              Sélectionnez les services additionnels souhaités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-2xl">
              Personnaliser
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button size="lg" className="rounded-2xl shadow-soft focus:ring-4 ring-brand-gold/40">
          {t('cta.getQuote')}
        </Button>
      </div>
    </div>
  );
};

export default RFQ;