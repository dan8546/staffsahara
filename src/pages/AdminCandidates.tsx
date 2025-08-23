import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Download, Eye, MessageSquare } from "lucide-react";

const mockCandidates = [
  {
    id: "1",
    name: "Ahmed Benali",
    position: "Ingénieur HSE",
    experience: "8 ans",
    location: "Hassi Messaoud",
    status: "active",
    lastContact: "2024-01-20",
    skills: ["NEBOSH", "IOSH", "Pétrole & Gaz"]
  },
  {
    id: "2",
    name: "Sarah Mansouri",
    position: "Superviseur Forage",
    experience: "12 ans",
    location: "Adrar",
    status: "available",
    lastContact: "2024-01-18",
    skills: ["Forage", "Supervision", "Formation"]
  },
  {
    id: "3",
    name: "Mohamed Kaci",
    position: "Technicien Maintenance",
    experience: "5 ans",
    location: "In Salah",
    status: "on_mission",
    lastContact: "2024-01-15",
    skills: ["Maintenance", "Mécanique", "Électricité"]
  }
];

const AdminCandidates = () => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "available": return "bg-blue-100 text-blue-800";
      case "on_mission": return "bg-orange-100 text-orange-800";
      case "unavailable": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Actif";
      case "available": return "Disponible";
      case "on_mission": return "En mission";
      case "unavailable": return "Indisponible";
      default: return status;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-ink-900 mb-2">
            Gestion des Candidats
          </h1>
          <p className="text-xl text-ink-700">
            Base de données centralisée des talents
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button className="rounded-2xl">
            Ajouter un candidat
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-ink-500" />
              <Input 
                placeholder="Rechercher par nom, compétence, localisation..."
                className="pl-10 rounded-2xl"
              />
            </div>
            <Button variant="outline" className="rounded-2xl gap-2">
              <Filter className="h-4 w-4" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous (156)</TabsTrigger>
          <TabsTrigger value="available">Disponibles (42)</TabsTrigger>
          <TabsTrigger value="on_mission">En mission (89)</TabsTrigger>
          <TabsTrigger value="active">Actifs (25)</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {mockCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-soft transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-ink-900">
                        {candidate.name}
                      </h3>
                      <Badge className={getStatusColor(candidate.status)}>
                        {getStatusLabel(candidate.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-ink-600">Poste</p>
                        <p className="font-medium">{candidate.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-ink-600">Expérience</p>
                        <p className="font-medium">{candidate.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm text-ink-600">Localisation</p>
                        <p className="font-medium">{candidate.location}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-ink-600 mb-2">Compétences</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-ink-600">
                      Dernier contact: {new Date(candidate.lastContact).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <Button variant="outline" size="sm" className="rounded-2xl gap-2">
                      <Eye className="h-4 w-4" />
                      Voir profil
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-2xl gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Contacter
                    </Button>
                    <Button size="sm" className="rounded-2xl">
                      Assigner mission
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Candidats disponibles</CardTitle>
              <CardDescription>
                42 candidats prêts pour de nouvelles missions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-ink-700">Liste des candidats disponibles...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="on_mission">
          <Card>
            <CardHeader>
              <CardTitle>Candidats en mission</CardTitle>
              <CardDescription>
                89 candidats actuellement en poste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-ink-700">Liste des candidats en mission...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Candidats actifs</CardTitle>
              <CardDescription>
                25 candidats en recherche active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-ink-700">Liste des candidats actifs...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-2xl">
            Précédent
          </Button>
          <Button size="sm" className="rounded-2xl">1</Button>
          <Button variant="outline" size="sm" className="rounded-2xl">2</Button>
          <Button variant="outline" size="sm" className="rounded-2xl">3</Button>
          <Button variant="outline" size="sm" className="rounded-2xl">
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCandidates;