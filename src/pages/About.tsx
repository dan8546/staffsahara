import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Building2, Shield, Zap } from "lucide-react";
import { Seo } from "@/components/Seo";
import { track } from "@/lib/analytics";

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const goToQuote = () => {
    track('nav_click', { to: '/get-quote' });
    navigate('/get-quote');
  };

  const goToRMTCHub = () => {
    track('nav_click', { to: 'rmtc-hub', external: true });
    window.open('https://redmed-learn-hub.vercel.app/', '_blank', 'noopener');
  };

  const valueIcons = [Shield, Zap, Building2];

  return (
    <>
      <Seo 
        title={t('about.title')}
        description={t('about.subtitle')}
        alternateHreflangs={[
          { hrefLang: 'fr', href: 'https://staff-sahara.com/about' },
          { hrefLang: 'en', href: 'https://staff-sahara.com/about' },
          { hrefLang: 'ar', href: 'https://staff-sahara.com/about' }
        ]}
      />
      <div className="container max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-ink-900 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            {t('about.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="rounded-2xl shadow-soft focus:ring-4 ring-brand-gold/40"
              onClick={goToQuote}
              aria-label={t('about.cta_quote')}
            >
              {t('about.cta_quote')}
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="rounded-2xl"
              onClick={goToRMTCHub}
              aria-label={t('about.cta_training')}
            >
              {t('about.cta_training')}
            </Button>
          </div>
        </div>

        {/* Values Grid */}
        <div>
          <h2 className="text-3xl font-bold text-ink-900 mb-8 text-center">
            {t('about.values_title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {(t('about.values', { returnObjects: true }) as any[]).map((value: any, index: number) => {
              const Icon = valueIcons[index] || Award;
              return (
                <Card 
                  key={index} 
                  className="rounded-2xl border bg-white/60 backdrop-blur p-6 md:p-8 shadow-sm hover:shadow transition-transform hover:-translate-y-0.5 text-center"
                >
                  <CardContent className="pt-0">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-brand-blue" />
                    </div>
                    <h3 className="font-semibold text-ink-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-ink-700">{value.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sectors & Services */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-ink-900 mb-4">{t('about.sectors_title')}</h3>
            <ul className="space-y-2">
              {(t('about.sectors', { returnObjects: true }) as string[]).map((sector, index) => (
                <li key={index} className="text-ink-700">{sector}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-ink-900 mb-4">{t('about.services_title')}</h3>
            <ul className="space-y-2">
              {(t('about.services', { returnObjects: true }) as string[]).map((service, index) => (
                <li key={index} className="text-ink-700">{service}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* RMTC Block */}
        <Card className="rounded-2xl border bg-white/60 backdrop-blur p-6 md:p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-4">
              {t('about.rmtc_title')}
            </h2>
            <p className="text-lg text-ink-700 max-w-3xl mx-auto mb-8">
              {t('about.rmtc_text')}
            </p>
            <Button 
              size="lg" 
              className="rounded-2xl shadow-soft focus:ring-4 ring-brand-gold/40"
              onClick={goToRMTCHub}
              aria-label={t('about.cta_training')}
            >
              {t('about.cta_training')}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default About;