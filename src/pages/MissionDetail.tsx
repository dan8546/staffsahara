import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MissionDocuments from "@/components/MissionDocuments";
import MissionAviation from "@/components/MissionAviation";
import MissionCompliance from "@/components/MissionCompliance";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  // 👇 nouveaux champs client
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
};

const MissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // État du dialog et champs du formulaire
  const [editOpen, setEditOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSite, setFormSite] = useState("");
  const [formStart, setFormStart] = useState<string | "">("");
  const [formEnd, setFormEnd] = useState<string | "">("");

  // 👇 champs client
  const [formClientName, setFormClientName] = useState("");
  const [formClientEmail, setFormClientEmail] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");

  // Charger la mission
  useEffect(() => {
    const fetchMission = async () => {
      if (!id) return;
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("id", id)
        .single();

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

  // Pré-remplir le formulaire quand la mission est chargée
  useEffect(() => {
    if (!mission) return;
    setFormTitle(mission.title ?? "");
    setFormDescription(mission.description ?? "");
    setFormLocation(mission.location ?? "");
    setFormSite(mission.site ?? "");
    setFormStart(mission.start_date ? mission.start_date.slice(0, 10) : "");
    setFormEnd(mission.end_date ? mission.end_date.slice(0, 10) : "");

    // 👇 champs client
    setFormClientName(mission.client_name ?? "");
    setFormClientEmail(mission.client_email ?? "");
    setFormClientPhone(mission.client_phone ?? "");
  }, [mission]);

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

                {/* 👇 Client */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{t("missions.overview.client") || "Client"}</div>
                    <div>{mission.client_name || "—"}</div>
                    <div className="text-muted-foreground text-sm">
                      {mission.client_email || "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <div>{mission.client_phone || "—"}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" asChild>
              <Link to="/missions">{t("common.cancel") || "Retour"}</Link>
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              {t("missions.edit") || "Modifier Mission"}
            </Button>
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

      {/* Dialog d’édition */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("missions.edit") || "Modifier la mission"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t("missions.overview.description") || "Description"}</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Localisation</Label>
                <Input id="location" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="site">Site</Label>
                <Input id="site" value={formSite} onChange={(e) => setFormSite(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">{t("rfq_form.startDate") || "Date de démarrage"}</Label>
                <Input id="start" type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">Date de fin</Label>
                <Input id="end" type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
              </div>
            </div>

            {/* 👇 Champs client */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client_name">Nom du client</Label>
                <Input
                  id="client_name"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder="Company A / Contact"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client_email">Email du client</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formClientEmail}
                  onChange={(e) => setFormClientEmail(e.target.value)}
                  placeholder="contact@company.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client_phone">Téléphone du client</Label>
                <Input
                  id="client_phone"
                  value={formClientPhone}
                  onChange={(e) => setFormClientPhone(e.target.value)}
                  placeholder="+213 ..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("common.cancel") || "Annuler"}
            </Button>
            <Button
              onClick={async () => {
                if (!mission) return;
                const { data, error } = await supabase
                  .from("missions")
                  .update({
                    title: formTitle || null,
                    description: formDescription || null,
                    location: formLocation || null,
                    site: formSite || null,
                    start_date: formStart || null,
                    end_date: formEnd || null,

                    // 👇 mise à jour des champs client
                    client_name: formClientName || null,
                    client_email: formClientEmail || null,
                    client_phone: formClientPhone || null,
                  })
                  .eq("id", mission.id)
                  .select("*")
                  .single();

                if (error) {
                  toast({
                    title: t("common.error") || "Erreur",
                    description: error.message,
                    variant: "destructive",
                  });
                  return;
                }

                setMission(data as Mission);
                setEditOpen(false);
                toast({
                  title: t("passport.save") || "Enregistré",
                  description: t("missions.edit") || "Mission mise à jour.",
                });
              }}
            >
              {t("passport.save") || "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MissionDetail;
