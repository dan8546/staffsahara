import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, DollarSign, Search } from "lucide-react";

const mockJobs = [
  {
    id: "1",
    title: "Ingénieur HSE Senior",
    company: "RedMed Energy",
    location: "Hassi Messaoud",
    type: "CDI",
    salary: "Compétitif",
    posted: "2024-01-15",
    urgency: "high"
  },
  {
    id: "2",
    title: "Superviseur Forage",
    company: "Staff Sahara",
    location: "Adrar",
    type: "Mission",
    salary: "À négocier",
    posted: "2024-01-10",
    urgency: "medium"
  },
  {
    id: "3",
    title: "Technicien Maintenance",
    company: "Energy Solutions",
    location: "In Salah",
    type: "CDD",
    salary: "150k-200k DA",
    posted: "2024-01-08",
    urgency: "low"
  }
];

const Jobs = () => {
  const { t } = useTranslation();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CDI": return "bg-blue-100 text-blue-800";
      case "CDD": return "bg-purple-100 text-purple-800";
      case "Mission": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-ink-900 mb-2">
          {t('nav.jobs')}
        </h1>
        <p className="text-xl text-ink-700">
          Découvrez les opportunités dans le Grand Sud
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
            <Input 
              placeholder="Rechercher un poste, entreprise..."
              className="pl-10 rounded-2xl"
            />
          </div>
          <Button variant="outline" className="rounded-2xl">
            Filtres
          </Button>
          <Button className="rounded-2xl shadow-soft">
            {t('cta.createPassport')}
          </Button>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {mockJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-brand-blue mb-2">{job.title}</CardTitle>
                  <CardDescription className="text-base font-medium text-ink-700">
                    {job.company}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(job.type)}>
                    {job.type}
                  </Badge>
                  <Badge className={getUrgencyColor(job.urgency)}>
                    {job.urgency === 'high' ? 'Urgent' : job.urgency === 'medium' ? 'Priorité' : 'Standard'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-ink-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">{job.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Publié le {new Date(job.posted).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 rounded-2xl">
                  <Link to={`/jobs/${job.id}`}>
                    Voir l'offre
                  </Link>
                </Button>
                <Button variant="secondary" className="flex-1 rounded-2xl">
                  Postuler maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline" className="rounded-2xl">
          Charger plus d'offres
        </Button>
      </div>
    </div>
  );
};

export default Jobs;