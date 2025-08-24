import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/stores/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Target, CheckCircle, Star, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { computeCoverage, updateApplicationScore } from "@/utils/compliance";

interface Application {
  id: string;
  applicant_id: string;
  opening_id: string;
  status: string;
  score: number;
  applied_at: string;
  openings: {
    title: string;
    location: string;
  };
}

const Recruiting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role } = useSession();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`*, openings(title, location)`)
        .order("score", { ascending: false })
        .limit(10);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationWithScore = async (applicationId: string, talentId: string) => {
    try {
      const { data: certificates, error: certError } = await supabase
        .from("certificates")
        .select("course_code, issued_at, expires_at, issuer")
        .eq("talent_id", talentId);

      if (certError) throw certError;

      const coverage = computeCoverage(certificates || [], ["H2S", "BOSIET", "FIRST_AID"]);
      const newScore = updateApplicationScore(50, coverage);

      const { error: updateError } = await supabase
        .from("applications")
        .update({ score: newScore })
        .eq("id", applicationId);

      if (updateError) throw updateError;

      toast({
        title: "Score mis à jour",
        description: `Score: ${newScore}/100 (Couverture: ${coverage.coverage.toFixed(0)}%)`
      });

      await loadApplications();
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const goToQuote = () => {
    if (user && role && ['client_admin','approver','ops','recruiter','finance'].includes(role)) {
      navigate('/rfq');
    } else {
      navigate('/get-quote');
    }
  };

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
    }
  ];

  const stats = [
    { number: "500+", label: "Recrutements réussis" },
    { number: "50+", label: "Clients actifs" },
    { number: "95%", label: "Taux de satisfaction" },
    { number: "30j", label: "Délai moyen" }
  ];

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-ink-900 mb-4">
          Recrutement & Talents
        </h1>
        <p className="text-xl text-ink-600 max-w-3xl mx-auto">
          Solutions de recrutement avec scoring automatique basé sur la conformité RMTC
        </p>
      </div>

      {/* Applications Scoring Section */}
      {role && ['ops', 'recruiter', 'finance'].includes(role) && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Candidatures (Scoring RMTC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune candidature trouvée</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Poste</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.openings.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={application.score >= 80 ? "default" : "secondary"}>
                            {application.score}/100
                          </Badge>
                          {application.score >= 80 && <Award className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{application.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateApplicationWithScore(application.id, application.applicant_id)}
                        >
                          Recalculer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats & Services */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-brand-blue mb-2">
                {stat.number}
              </div>
              <p className="text-sm text-ink-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-16">
        <Button 
          size="lg" 
          className="rounded-2xl shadow-soft"
          onClick={goToQuote}
        >
          Demander un devis
        </Button>
      </div>
    </div>
  );
};

export default Recruiting;