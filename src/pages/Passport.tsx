import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, Shield, Calendar } from "lucide-react";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/stores/useSession";
import { toast } from "sonner";

type Certificate = { name: string; expiry: string; status?: "valid"|"expires_soon"|"expired" };

const Passport = () => {
  const { t } = useTranslation();
  const { user } = useSession();

  const [profile, setProfile] = useState<{
    languages: string[];
    location: string;
    availability: "available" | "unavailable";
    skills: string[];
    experience_years: number;
    completeness?: number;
    title?: string;
    status?: "verified" | "pending";
  }>({
    languages: [],
    location: "",
    availability: "available",
    skills: [],
    experience_years: 0,
    completeness: 0,
    title: "",
    status: "pending",
  });

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      await Promise.all([loadProfile(), loadCertificates()]);
      setLoading(false);
    })();
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("loadProfile:", error);
        return;
      }
      if (data) {
        setProfile({
          languages: data.languages ?? [],
          location: data.location ?? "",
          availability: data.availability ?? "available",
          skills: data.skills ?? [],
          experience_years: data.experience_years ?? 0,
          completeness: data.completeness ?? 0,
          title: data.title ?? "",
          status: (data.status as any) ?? "pending",
        });
      }
    } catch (e) {
      console.error("loadProfile exception:", e);
    }
  };

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("talent_id", user?.id);

      if (error) { console.warn("loadCertificates:", error); return; }
      setCertificates(
        (data ?? []).map((c: any) => ({
          name: c.name,
          expiry: c.expiry,
          status: c.status ?? "valid",
        }))
      );
    } catch (e) {
      console.error("loadCertificates exception:", e);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    console.log("save passport");
    try {
      const { error } = await supabase.from("talent_profiles").upsert({
        user_id: user.id,
        location: profile.location ?? "",
        availability: profile.availability ?? "available",
        skills: profile.skills ?? [],
        experience_years: profile.experience_years ?? 0,
        completeness: profile.completeness ?? 0,
        title: profile.title ?? "",
        status: profile.status ?? "pending",
      });
      if (error) throw error;
      toast.success("Passeport créé/mis à jour");
      await loadProfile();
    } catch (e) {
      console.error("handleSave error:", e);
      toast.error("Erreur lors de l’enregistrement");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "valid":
      case "verified":
        return "bg-green-100 text-green-800";
      case "expires_soon":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-muted rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.first_name && user?.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : undefined) ||
    (user?.user_metadata?.name as string) ||
    (user?.email as string) ||
    "Mon profil";

  const completeness = profile.completeness ?? 0;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <Seo
        title={`${t("passport.title")} - Staff Sahara`}
        description={t("passport.description")}
      />

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-ink-900 mb-2">
          {t("passport.title")}
        </h1>
        <p className="text-xl text-ink-700">{t("passport.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-brand-blue" />
              </div>
              <CardTitle>{displayName}</CardTitle>
              <CardDescription>{profile.title || "Profil talent"}</CardDescription>
              <Badge className={getStatusColor(profile.status)}>
                {profile.status === "verified" ? "Profil vérifié" : "À compléter"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Complétude du profil</span>
                    <span>{completeness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brand-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
                <Button className="w-full rounded-2xl" onClick={handleSave}>
                  {t("cta.createPassport")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <p className="text-ink-600">Aucune certification pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-ink-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expire le {new Date(cert.expiry).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge className={getStatusColor(cert.status)}>
                        {cert.status === "valid"
                          ? "Valide"
                          : cert.status === "expires_soon"
                          ? "Expire bientôt"
                          : "Expiré"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full mt-4 rounded-2xl">
                Ajouter une certification
              </Button>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-600">Gestion des documents à implémenter.</p>
              <Button variant="outline" className="w-full mt-4 rounded-2xl">
                Télécharger un document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Passport;
