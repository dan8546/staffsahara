import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Clock, MapPin, Users, Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";

interface TrainingCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  duration_hours: number;
  reqs: any; // Using any for JSON field compatibility
}

interface TrainingSession {
  id: string;
  course_id: string;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  status: string;
  enrollments_count?: number;
}

const TrainingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<TrainingCourse | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  const loadCourseAndSessions = async () => {
    if (!id) return;
    
    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("training_courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData as TrainingCourse);

      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("training_sessions")
        .select(`
          *,
          enrollments(count)
        `)
        .eq("course_id", id)
        .eq("status", "scheduled")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });

      if (sessionsError) throw sessionsError;
      
      // Process sessions with enrollment count
      const processedSessions = (sessionsData || []).map(session => ({
        ...session,
        enrollments_count: session.enrollments?.[0]?.count || 0
      }));
      
      setSessions(processedSessions);

    } catch (error) {
      console.error("Error loading course:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du cours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedSessionId) return;
    
    setEnrolling(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour vous inscrire",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from("enrollments")
        .insert({
          session_id: selectedSessionId,
          talent_id: user.user.id,
          source: "self",
          status: "pending"
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Déjà inscrit",
            description: "Vous êtes déjà inscrit à cette session",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Inscription réussie",
          description: "Votre inscription a été enregistrée"
        });
        setIsEnrollDialogOpen(false);
        setSelectedSessionId("");
        await loadCourseAndSessions();
      }

    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de s'inscrire à cette session",
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    loadCourseAndSessions();
  }, [id]);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Formation non trouvée</h1>
          <Button onClick={() => navigate("/training")}>
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title={`${course.title} — Formations RMTC`}
        description={course.description || `Formation ${course.title} dispensée par le RedMed Training Center`}
      />
      
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/training")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2">
                {course.code}
              </Badge>
              <h1 className="text-4xl font-bold text-ink-900 mb-2">
                {course.title}
              </h1>
              <div className="flex items-center gap-2 text-ink-600">
                <Clock className="h-4 w-4" />
                {course.duration_hours}h de formation
              </div>
            </div>
            
            {sessions.length > 0 && (
              <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-2xl shadow-soft">
                    {t("training.enroll")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inscription à {course.title}</DialogTitle>
                    <DialogDescription>
                      Sélectionnez une session pour vous inscrire
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("training.selectSession")} />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {new Date(session.starts_at).toLocaleDateString("fr-FR")} - {session.location}
                            {session.capacity && (
                              <span className="text-muted-foreground ml-2">
                                ({session.enrollments_count || 0}/{session.capacity})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleEnroll} 
                      disabled={!selectedSessionId || enrolling}
                    >
                      {enrolling ? "Inscription..." : "Confirmer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-blue">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-700 leading-relaxed">
                  {course.description}
                </p>
              </CardContent>
            </Card>

            {course.reqs && course.reqs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-brand-blue">{t("training.prereqs")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.reqs.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-ink-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-blue">{t("training.sessions")}</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {t("training.noSessions")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-ink-500" />
                          <span className="font-medium">
                            {new Date(session.starts_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-ink-600">
                          <MapPin className="h-4 w-4" />
                          {session.location}
                        </div>
                        {session.capacity && (
                          <div className="flex items-center gap-2 text-sm text-ink-600">
                            <Users className="h-4 w-4" />
                            {session.enrollments_count || 0}/{session.capacity} places
                          </div>
                        )}
                        <Badge variant={session.status === "scheduled" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrainingDetail;