import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/stores/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Award, Target } from "lucide-react";
import { Seo } from "@/components/Seo";

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role } = useSession();
  
  const goToQuote = () => {
    if (user && role && ['client_admin','approver','ops','recruiter','finance'].includes(role)) {
      navigate('/rfq');
    } else {
      navigate('/get-quote');
    }
  };

  const zones = [
    { name: "Hassi Messaoud", type: "Base principale", status: "active" },
    { name: "Adrar", type: "Hub régional", status: "active" },
    { name: "In Salah", type: "Site opérationnel", status: "active" },
    { name: "Reggane", type: "En développement", status: "development" }
  ];

  const team = [
    {
      name: "Karim Hadji",
      role: "Directeur Général",
      experience: "15+ ans Oil & Gas",
      speciality: "Management, Stratégie"
    },
    {
      name: "Amina Bessaih",
      role: "Directrice RH",
      experience: "12+ ans Recrutement",
      speciality: "Head-hunting, Formation"
    },
    {
      name: "Omar Cherif",
      role: "Directeur Opérations",
      experience: "18+ ans Terrain",
      speciality: "Logistique, HSE"
    }
  ];

  return (
    <>
      <Seo 
        title={t('about.title')}
        description={t('about.description')}
      />
      <div className="container max-w-6xl mx-auto px-6 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-ink-900 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* RMTC Block */}
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-6 md:p-8 shadow-sm mb-16">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-4">
              {t('about.rmtc_block_title')}
            </h2>
            <p className="text-lg text-ink-700 max-w-3xl mx-auto mb-8">
              {t('about.rmtc_block_text')}
            </p>
            <Button 
              size="lg" 
              className="rounded-2xl shadow-soft focus:ring-4 ring-brand-gold/40"
              onClick={() => navigate('/training')}
              aria-label={t('about.cta_training')}
            >
              {t('about.cta_training')}
            </Button>
          </div>
        </div>

        {/* Values Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-ink-900 mb-8 text-center">
            {t('about.values_title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {(t('about.values', { returnObjects: true }) as string[]).map((value: string, index: number) => (
              <Card 
                key={index} 
                className="rounded-2xl shadow-sm hover:shadow transition-transform hover:-translate-y-0.5 text-center"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold text-ink-900">{value}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink-900 mb-4">
            {t('about.cta')}
          </h2>
          <p className="text-ink-700 mb-8 max-w-2xl mx-auto">
            Notre équipe d'experts est à votre écoute pour analyser vos besoins 
            et vous proposer des solutions sur mesure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-2xl shadow-soft focus:ring-4 ring-brand-gold/40" onClick={goToQuote}>
              {t('cta.getQuote')}
            </Button>
            <Button variant="secondary" size="lg" className="rounded-2xl">
              {t('contact.title')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;