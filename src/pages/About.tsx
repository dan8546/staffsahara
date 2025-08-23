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
      <div className="container max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-ink-900 mb-4">
          {t('about.mission_title')}
        </h1>
        <p className="text-xl text-ink-700 max-w-4xl mx-auto leading-relaxed">
          {t('about.mission_body')}
        </p>
      </div>

      {/* Services */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-ink-900 mb-8 text-center">
          {t('about.services_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["Head-hunting & recrutement", "RH & paie", "Formation (RRTC)", "Travel & visas"].map((service: string, index: number) => (
            <Card key={index} className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-brand-blue" />
                </div>
                <h3 className="font-semibold text-ink-900">{service}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Zones d'opération */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-ink-900 mb-8 text-center">
          {t('about.zones_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zones.map((zone, index) => (
            <Card key={index} className="hover:shadow-soft transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand-blue" />
                    <h3 className="text-lg font-semibold text-ink-900">{zone.name}</h3>
                  </div>
                  <Badge 
                    className={zone.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {zone.status === 'active' ? 'Opérationnel' : 'En développement'}
                  </Badge>
                </div>
                <p className="text-ink-600">{zone.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-ink-900 mb-8 text-center">
          {t('about.team_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-soft transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-brand-blue" />
                </div>
                <h3 className="text-lg font-semibold text-ink-900 mb-1">{member.name}</h3>
                <p className="text-brand-blue font-medium mb-2">{member.role}</p>
                <p className="text-sm text-ink-600 mb-2">{member.experience}</p>
                <p className="text-sm text-ink-500">{member.speciality}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-brand-blue/10 to-brand-gold/10 rounded-2xl p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { number: "500+", label: "Missions réalisées" },
            { number: "100+", label: "Clients satisfaits" },
            { number: "15", label: "Années d'expérience" },
            { number: "4", label: "Bases opérationnelles" }
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-bold text-brand-blue mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-ink-600">
                {stat.label}
              </div>
            </div>
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