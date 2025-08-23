import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Target, CheckCircle } from "lucide-react";

const Recruiting = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Search,
      title: "Head-hunting",
      description: "Recherche ciblée de profils experts pour vos postes stratégiques",
      features: ["Sourcing international", "Évaluation technique", "Présélection rigoureuse"]
    },
    {
      icon: Users,
      title: "Recrutement en volume",
      description: "Solutions de recrutement massif pour vos projets d'envergure",
      features: ["Processus optimisé", "Gestion des candidatures", "Onboarding structuré"]
    },
    {
      icon: Target,
      title: "Recrutement spécialisé",
      description: "Expertise sectorielle pour les métiers techniques du pétrole et gaz",
      features: ["Connaissance métier", "Réseau spécialisé", "Évaluation technique"]
    },
    {
      icon: CheckCircle,
      title: "Due diligence",
      description: "Vérification complète des références et qualifications",
      features: ["Background check", "Vérification diplômes", "Références employeurs"]
    }
  ];

  const stats = [
    { number: "500+", label: "Recrutements réussis" },
    { number: "50+", label: "Clients actifs" },
    { number: "72h", label: "Délai moyen de sourcing" },
    { number: "95%", label: "Taux de satisfaction" }
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-ink-900 mb-4">
          Services de Recrutement
        </h1>
        <p className="text-xl text-ink-700 max-w-3xl mx-auto">
          Expertise RH dédiée aux métiers techniques du Grand Sud algérien
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-blue mb-2">
              {stat.number}
            </div>
            <div className="text-sm text-ink-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-4">
                <service.icon className="h-6 w-6 text-brand-blue" />
              </div>
              <CardTitle className="text-brand-blue">{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-2xl">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Process */}
      <Card className="mb-16">
        <CardHeader className="text-center">
          <CardTitle className="text-brand-blue text-2xl">Notre Processus</CardTitle>
          <CardDescription>Une approche structurée pour un recrutement réussi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Analyse du besoin", desc: "Définition précise du profil et des compétences requises" },
              { step: "2", title: "Sourcing", desc: "Recherche active dans nos bases et réseaux spécialisés" },
              { step: "3", title: "Évaluation", desc: "Tests techniques et entretiens comportementaux" },
              { step: "4", title: "Présentation", desc: "Dossiers qualifiés avec recommandations détaillées" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-brand-gold text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-ink-900 mb-2">{item.title}</h3>
                <p className="text-sm text-ink-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-brand-blue/10 to-brand-gold/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-ink-900 mb-4">
          Besoin de recruter ?
        </h2>
        <p className="text-ink-700 mb-6 max-w-2xl mx-auto">
          Confiez-nous vos besoins en recrutement. Notre équipe d'experts vous accompagne 
          de la définition du poste à l'intégration du candidat.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="rounded-2xl shadow-soft focus:ring-4 ring-brand-gold/40">
            {t('cta.getQuote')}
          </Button>
          <Button variant="secondary" size="lg" className="rounded-2xl">
            Télécharger notre brochure
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Recruiting;