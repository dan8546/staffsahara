import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GraduationCap, Plus, Edit2, Trash2, Users, FileText, Award, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface TrainingCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  duration_hours: number;
  reqs: any;
  created_at: string;
}

interface TrainingSession {
  id: string;
  course_id: string;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  status: string;
  created_at: string;
  training_courses: TrainingCourse;
  enrollments_count?: number;
}

interface Enrollment {
  id: string;
  talent_id: string;
  status: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

const AdminTraining = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  
  // Course form state
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    description: "",
    duration_hours: 8,
    reqs: []
  });
  
  // Session form state  
  const [sessionForm, setSessionForm] = useState({
    course_id: "",
    starts_at: "",
    ends_at: "",
    location: "",
    capacity: 20
  });

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("training_courses")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("training_sessions")
        .select(`
          *,
          training_courses(*),
          enrollments(count)
        `)
        .order("starts_at", { ascending: false });

      if (error) throw error;
      
      const processedSessions = (data || []).map(session => ({
        ...session,
        enrollments_count: session.enrollments?.[0]?.count || 0
      }));
      
      setSessions(processedSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const { error } = await supabase
        .from("training_courses")
        .insert({
          code: courseForm.code.toUpperCase(),
          title: courseForm.title,
          description: courseForm.description,
          duration_hours: courseForm.duration_hours,
          reqs: courseForm.reqs
        });

      if (error) throw error;

      toast({
        title: "Cours créé",
        description: "Le cours de formation a été créé avec succès"
      });

      setCourseForm({ code: "", title: "", description: "", duration_hours: 8, reqs: [] });
      setIsCreateCourseOpen(false);
      await loadCourses();

    } catch (error) {
      console.error("Create course error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le cours",
        variant: "destructive"
      });
    }
  };

  const handleCreateSession = async () => {
    try {
      const { error } = await supabase
        .from("training_sessions")
        .insert({
          course_id: sessionForm.course_id,
          starts_at: sessionForm.starts_at,
          ends_at: sessionForm.ends_at,
          location: sessionForm.location,
          capacity: sessionForm.capacity,
          status: "scheduled"
        });

      if (error) throw error;

      toast({
        title: "Session créée",
        description: "La session de formation a été créée avec succès"
      });

      setSessionForm({ course_id: "", starts_at: "", ends_at: "", location: "", capacity: 20 });
      setIsCreateSessionOpen(false);
      await loadSessions();

    } catch (error) {
      console.error("Create session error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session",
        variant: "destructive"
      });
    }
  };

  const markSessionCompleted = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("training_sessions")
        .update({ status: "completed" })
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session terminée",
        description: "La session a été marquée comme terminée"
      });

      await loadSessions();

    } catch (error) {
      console.error("Update session error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la session",
        variant: "destructive"
      });
    }
  };

  const generateCertificates = async (sessionId: string) => {
    try {
      // Get session details and attendees
      const { data: sessionData, error: sessionError } = await supabase
        .from("training_sessions")
        .select(`
          *,
          training_courses(*)
        `)
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Get attendees separately
      const { data: attendeesData, error: attendeesError } = await supabase
        .from("enrollments")
        .select(`
          id,
          talent_id,
          status,
          profiles!inner(first_name, last_name)
        `)
        .eq("session_id", sessionId)
        .eq("status", "attended");

      if (attendeesError) throw attendeesError;

      const session = sessionData;
      const attendees = (attendeesData || []) as unknown as Enrollment[];

      if (attendees.length === 0) {
        toast({
          title: "Aucun participant",
          description: "Aucun participant marqué comme présent",
          variant: "destructive"
        });
        return;
      }

      // Generate certificates for each attendee
      for (const attendee of attendees) {
        // Insert certificate record
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 3); // 3 years validity

        const { error: certError } = await supabase
          .from("certificates")
          .insert({
            talent_id: attendee.talent_id,
            course_code: session.training_courses.code,
            issued_at: new Date().toISOString().split('T')[0],
            expires_at: expirationDate.toISOString().split('T')[0],
            issuer: "RMTC"
          });

        if (certError) {
          console.error("Certificate insert error:", certError);
          continue;
        }

        // Generate PDF certificate
        const doc = new jsPDF();
        
        // Blue header
        const blueColor = [70, 130, 180];
        const goldColor = [255, 215, 0];
        
        doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Logo and title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('STAFF SAHARA', 15, 25);
        doc.setFontSize(14);
        doc.text('RedMed Training Center', 15, 35);
        
        // Certificate title
        doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.setFontSize(28);
        doc.text('CERTIFICAT DE FORMATION', 105, 70, { align: 'center' });
        
        // Content
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text('Certifie que', 105, 100, { align: 'center' });
        
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(`${attendee.profiles.first_name} ${attendee.profiles.last_name}`, 105, 120, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.text('a suivi avec succès la formation', 105, 140, { align: 'center' });
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
        doc.text(session.training_courses.title, 105, 160, { align: 'center' });
        
        // Details
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Code: ${session.training_courses.code}`, 15, 190);
        doc.text(`Durée: ${session.training_courses.duration_hours}h`, 15, 200);
        doc.text(`Date: ${new Date(session.starts_at).toLocaleDateString('fr-FR')}`, 15, 210);
        doc.text(`Lieu: ${session.location}`, 15, 220);
        doc.text(`Valide jusqu'au: ${expirationDate.toLocaleDateString('fr-FR')}`, 15, 230);
        
        // Signature
        doc.text('RMTC - RedMed Training Center', 150, 250);
        doc.text(new Date().toLocaleDateString('fr-FR'), 150, 260);
        
        // Save PDF
        doc.save(`certificat-${session.training_courses.code}-${attendee.profiles.first_name}-${attendee.profiles.last_name}.pdf`);

        // Track event (analytics placeholder)
        console.log('CERT_ISSUED', { talent_id: attendee.talent_id, course_code: session.training_courses.code });
      }

      toast({
        title: "Certificats générés",
        description: `${attendees.length} certificat(s) généré(s) avec succès`
      });

    } catch (error) {
      console.error("Generate certificates error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les certificats",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadCourses();
    loadSessions();
  }, []);

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
    <>
      <Seo 
        title="Administration RMTC — Staff Sahara"
        description="Gestion des formations et sessions RMTC"
      />
      
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ink-900 mb-4">
            Administration RMTC
          </h1>
          <p className="text-xl text-ink-600">
            Gestion des cours et sessions de formation
          </p>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Cours de formation
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Calendar className="h-4 w-4" />
              Sessions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Cours de formation
                  </div>
                  <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau cours
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un nouveau cours</DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="code">Code *</Label>
                          <Input
                            id="code"
                            value={courseForm.code}
                            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                            placeholder="ex: H2S"
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">Titre *</Label>
                          <Input
                            id="title"
                            value={courseForm.title}
                            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                            placeholder="ex: Formation H2S Safety"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={courseForm.description}
                            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                            placeholder="Description du cours..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Durée (heures)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={courseForm.duration_hours}
                            onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseInt(e.target.value) || 0 })}
                            min="1"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateCourseOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCreateCourse} disabled={!courseForm.code || !courseForm.title}>
                          Créer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Badge variant="outline">{course.code}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.duration_hours}h</TableCell>
                        <TableCell>
                          {new Date(course.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer le cours</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Sessions de formation
                  </div>
                  <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle session
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer une nouvelle session</DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="course">Cours *</Label>
                          <Select value={sessionForm.course_id} onValueChange={(value) => setSessionForm({ ...sessionForm, course_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un cours" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.code} - {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="starts_at">Date de début *</Label>
                            <Input
                              id="starts_at"
                              type="datetime-local"
                              value={sessionForm.starts_at}
                              onChange={(e) => setSessionForm({ ...sessionForm, starts_at: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ends_at">Date de fin *</Label>
                            <Input
                              id="ends_at"
                              type="datetime-local"
                              value={sessionForm.ends_at}
                              onChange={(e) => setSessionForm({ ...sessionForm, ends_at: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="location">Lieu *</Label>
                          <Input
                            id="location"
                            value={sessionForm.location}
                            onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                            placeholder="ex: Centre RMTC Adrar"
                          />
                        </div>
                        <div>
                          <Label htmlFor="capacity">Capacité</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={sessionForm.capacity}
                            onChange={(e) => setSessionForm({ ...sessionForm, capacity: parseInt(e.target.value) || 0 })}
                            min="1"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateSessionOpen(false)}>
                          Annuler
                        </Button>
                        <Button 
                          onClick={handleCreateSession} 
                          disabled={!sessionForm.course_id || !sessionForm.starts_at || !sessionForm.location}
                        >
                          Créer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Formation</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Inscrits/Capacité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {session.training_courses.code}
                            </Badge>
                            <div className="font-medium text-sm">
                              {session.training_courses.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(session.starts_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-ink-500" />
                            {session.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-ink-500" />
                            {session.enrollments_count || 0}/{session.capacity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            session.status === 'completed' ? 'default' :
                            session.status === 'scheduled' ? 'secondary' : 'outline'
                          }>
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {session.status === 'scheduled' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markSessionCompleted(session.id)}
                              >
                                Terminer
                              </Button>
                            )}
                            {session.status === 'completed' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => generateCertificates(session.id)}
                              >
                                <Award className="h-4 w-4 mr-1" />
                                Certificats
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminTraining;