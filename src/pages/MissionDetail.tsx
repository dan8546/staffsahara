import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar, User, FileText, Phone } from "lucide-react";
import MissionDocuments from "@/components/MissionDocuments";
import MissionAviation from "@/components/MissionAviation";
import MissionCompliance from "@/components/MissionCompliance";

const MissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock data - in real app, fetch by ID
  const mission = {
    id,
    title: "Supervision HSE - Hassi Messaoud",
    location: "Hassi Messaoud, Algérie",
    startDate: "2024-09-01",
    endDate: "2025-03-01",
    duration: "6 mois",
    status: "active",
    client: "Company A",
    description: "Mission de supervision HSE pour projet d'exploration pétrolière. Responsabilités incluent la mise en place des procédures de sécurité, formation du personnel local, et reporting quotidien.",
    requirements: [
      "Certification HSE internationale",
      "Minimum 5 ans d'expérience",
      "Maîtrise anglais/français",
      "Disponibilité rotation 4x4"
    ],
    contact: {
      name: "Ahmed Benali",
      email: "a.benali@company-a.com",
      phone: "+213 XX XX XX XX"
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-ink-900 mb-2">
              {mission.title}
            </h1>
            <div className="flex items-center gap-4 text-ink-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {mission.location}
              </div>
              <Badge className={mission.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {mission.status}
              </Badge>
            </div>
          </div>
          <Button className="rounded-2xl shadow-soft">
            Modifier Mission
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="documents">{t("missions.docs.title")}</TabsTrigger>
          <TabsTrigger value="aviation">{t("missions.aviation.tab")}</TabsTrigger>
          <TabsTrigger value="compliance">{t("missions.compliance.tab")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-blue">Description de la mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ink-700 leading-relaxed">
                    {mission.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-blue">Exigences</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mission.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-gold rounded-full" />
                        <span className="text-ink-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-blue">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ink-500" />
                    <div>
                      <p className="text-sm text-ink-600">Période</p>
                      <p className="font-medium">
                        {new Date(mission.startDate).toLocaleDateString('fr-FR')} - 
                        {new Date(mission.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-ink-500" />
                    <div>
                      <p className="text-sm text-ink-600">Client</p>
                      <p className="font-medium">{mission.client}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-blue">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{mission.contact.name}</p>
                    <p className="text-sm text-ink-600">{mission.contact.email}</p>
                    <p className="text-sm text-ink-600">{mission.contact.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-2xl">
                      <Phone className="h-4 w-4 mr-1" />
                      Appeler
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-2xl">
                      <FileText className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <MissionDocuments missionId={id!} />
        </TabsContent>
        
        <TabsContent value="aviation">
          <MissionAviation missionId={id!} />
        </TabsContent>
        
        <TabsContent value="compliance">
          <MissionCompliance missionId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissionDetail;