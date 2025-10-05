import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar, User, FileText, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MissionDocuments from "@/components/MissionDocuments";
import MissionAviation from "@/components/MissionAviation";
import MissionCompliance from "@/components/MissionCompliance";

type Mission = {
  id: string;
  title: string | null;
  description: string | null;
  site: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "draft" | "in_review" | "signed" | "active" | "completed" | string;
  created_at: string;
};

const MissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fetchMission = async () => {
      if (!id) return;
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase.from("missions").select("*").eq("id", id).single();
      if (error) {
        setErr(error.message);
        setMission(null);
      } else {
        setMission(data as Mission);
      }
      setLoading(false);
    };
    fetchMission();
  }, [id]);

  const statusBadge = (s?: Mission["status"]) => {
    switch (s) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "signed":
        return "bg-amber-100 text-amber-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">{t("common.loading") || "Chargement..."}</p>
      </div>
    );
  }

  if (err || !mission) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-10 space-y-4">
        <Button variant="ghost" onClick={() => navigate("/missions")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("common.back") || "Retour"}
        </Button>
        <Card>
          <CardContent className="py-8">
            <p className="text-destructive">
              {t("common.error") || "Erreur"}: {err || "Mission introuvable"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/missions")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("common.back") || "Retour"}
      </Button>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">
          {mission.title || t("missions.untitled") || "Nouvelle mission"}
        </h1>
        <Badge className={statusBadge(mission.status)}>
          {t(`missions.status.${mission.status}`) || mission.status}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{mission.location || mission.site || "—"}</span>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">{t("missions.tabs.overview") || "Vue d'ensemble"}</TabsTrigger>
          <TabsTrigger value="documents">{t("missions.tabs.documents") || "Documents"}</TabsTrigger>
          <TabsTrigger value="aviation">{t("missions.tabs.aviation") || "Star Aviation"}</TabsTrigger>
          <TabsTrigger value="compliance">{t("missions.tabs.compliance") || "Conformité & RMTC"}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t("missions.overview.description") || "Description de la mission"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-700 whitespace-pre-line">
                  {mission.description || t("missions.overview.empty") || "Aucune description pour le moment."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("missions.overview.infos") || "Informations"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-ink-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{t("missions.overview.period") || "Période"}</div>
                    <div>
                      {mission.start_date ? new Date(mission.start_date).toLocaleDateString("fr-FR") : "—"}{" "}
                      - {mission.end_date ? new Date(mission.end_date).toLocaleDateString("fr-FR") : "—"}
                    </div>
                  </div>
                </div>
                {/* Contact/company: placeholders tant que non modélisé en base */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{t("missions.overview.client") || "Client"}</div>
                    <div>—</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <div>—</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" asChild>
              <Link to="/missions">{t("common.cancel") || "Retour"}</Link>
            </Button>
            <Button>{t("missions.edit") || "Modifier Mission"}</Button>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <MissionDocuments missionId={mission.id} />
        </TabsContent>

        <TabsContent value="aviation" className="mt-6">
          <MissionAviation missionId={mission.id} />
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <MissionCompliance missionId={mission.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissionDetail;
