import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User } from "lucide-react";

const mockMissions = [
  {
    id: "1",
    title: "Supervision HSE - Hassi Messaoud",
    location: "Hassi Messaoud",
    startDate: "2024-09-01",
    duration: "6 mois",
    status: "active",
    client: "Company A"
  },
  {
    id: "2", 
    title: "Ingénieur Forage - Adrar",
    location: "Adrar",
    startDate: "2024-10-15",
    duration: "3 mois",
    status: "pending",
    client: "Company B"
  }
];

const Missions = () => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-ink-900 mb-2">
            Mes Missions
          </h1>
          <p className="text-xl text-ink-700">
            Gérez vos missions en cours et à venir
          </p>
        </div>
        <Button className="rounded-2xl shadow-soft">
          Nouvelle Mission
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockMissions.map((mission) => (
          <Card key={mission.id} className="hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-brand-blue">{mission.title}</CardTitle>
                <Badge className={getStatusColor(mission.status)}>
                  {mission.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {mission.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <Calendar className="h-4 w-4" />
                  Début: {new Date(mission.startDate).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-600">
                  <User className="h-4 w-4" />
                  Client: {mission.client}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1 rounded-2xl">
                  <Link to={`/missions/${mission.id}`}>
                    Voir détails
                  </Link>
                </Button>
                <Button variant="secondary" className="flex-1 rounded-2xl">
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Missions;