import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Upload, Calendar, MapPin, Award, Plus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";

interface Enrollment {
  id: string;
  status: string;
  created_at: string;
  training_sessions: {
    id: string;
    starts_at: string;
    ends_at: string;
    location: string;
    training_courses: {
      code: string;
      title: string;
    };
  };
}

interface Certificate {
  id: string;
  course_code: string;
  issued_at: string;
  expires_at: string;
  file_url?: string;
  issuer: string;
  created_at: string;
}

const MyTraining = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Certificate upload form
  const [courseCode, setCourseCode] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [issuer, setIssuer] = useState("");

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    attended: "bg-green-100 text-green-800",
    no_show: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800"
  };

  const loadData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Load enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          *,
          training_sessions(
            id,
            starts_at,
            ends_at,
            location,
            training_courses(code, title)
          )
        `)
        .eq("talent_id", user.user.id)
        .order("created_at", { ascending: false });

      if (enrollmentsError) throw enrollmentsError;
      setEnrollments(enrollmentsData || []);

      // Load certificates
      const { data: certificatesData, error: certificatesError } = await supabase
        .from("certificates")
        .select("*")
        .eq("talent_id", user.user.id)
        .order("issued_at", { ascending: false });

      if (certificatesError) throw certificatesError;
      setCertificates(certificatesData || []);

      // Check for RMTC certificates and update badges
      await updateRMTCBadges(certificatesData || []);

    } catch (error) {
      console.error("Error loading training data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos formations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRMTCBadges = async (certs: Certificate[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Check for valid RMTC certificates
      const validRMTCCerts = certs.filter(cert => 
        cert.issuer === "RMTC" && 
        new Date(cert.expires_at) > new Date()
      );

      if (validRMTCCerts.length > 0) {
        // Check if badge already exists
        const { data: existingBadge } = await supabase
          .from("candidate_badges")
          .select("id")
          .eq("user_id", user.user.id)
          .eq("badge_type", "RMTC-OK")
          .single();

        if (!existingBadge) {
          // Create RMTC badge
          await supabase
            .from("candidate_badges")
            .insert({
              user_id: user.user.id,
              badge_type: "RMTC-OK",
              badge_data: {
                code: "RMTC-OK",
                issued_by: "RMTC",
                certificates_count: validRMTCCerts.length
              }
            });
        }
      }
    } catch (error) {
      console.error("Error updating RMTC badges:", error);
    }
  };

  const handleUploadCertificate = async () => {
    if (!courseCode || !issuedAt || !issuer) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from("certificates")
        .insert({
          talent_id: user.user.id,
          course_code: courseCode,
          issued_at: issuedAt,
          expires_at: expiresAt || null,
          file_url: fileUrl || null,
          issuer
        });

      if (error) throw error;

      toast({
        title: "Certificat ajouté",
        description: "Votre certificat a été enregistré avec succès"
      });

      setIsUploadDialogOpen(false);
      setCourseCode("");
      setIssuedAt("");
      setExpiresAt("");
      setFileUrl("");
      setIssuer("");
      
      await loadData();

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le certificat",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        title="Mes formations — RMTC"
        description="Consultez vos inscriptions et certificats RMTC"
      />
      
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ink-900 mb-4">
            {t("training.my")}
          </h1>
          <p className="text-xl text-ink-600">
            Consultez vos inscriptions et certificats
          </p>
        </div>

        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrollments" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {t("training.enrollments")}
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2">
              <Award className="h-4 w-4" />
              {t("training.certificates")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrollments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t("training.enrollments")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune inscription trouvée</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formation</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Lieu</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Inscription</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {enrollment.training_sessions.training_courses.code}
                              </Badge>
                              <div className="font-medium">
                                {enrollment.training_sessions.training_courses.title}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-ink-500" />
                              {new Date(enrollment.training_sessions.starts_at).toLocaleDateString("fr-FR")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-ink-500" />
                              {enrollment.training_sessions.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[enrollment.status as keyof typeof statusColors] || statusColors.pending}>
                              {t(`training.status.${enrollment.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(enrollment.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {t("training.certificates")}
                  </div>
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("training.upload")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un certificat externe</DialogTitle>
                        <DialogDescription>
                          Enregistrez un certificat obtenu auprès d'un organisme externe
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="courseCode">Code formation *</Label>
                          <Input
                            id="courseCode"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            placeholder="ex: H2S, BOSIET..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="issuer">Organisme émetteur *</Label>
                          <Input
                            id="issuer"
                            value={issuer}
                            onChange={(e) => setIssuer(e.target.value)}
                            placeholder="ex: OPITO, STCW..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="issuedAt">Date d'émission *</Label>
                            <Input
                              id="issuedAt"
                              type="date"
                              value={issuedAt}
                              onChange={(e) => setIssuedAt(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="expiresAt">Date d'expiration</Label>
                            <Input
                              id="expiresAt"
                              type="date"
                              value={expiresAt}
                              onChange={(e) => setExpiresAt(e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="fileUrl">URL du certificat (optionnel)</Label>
                          <Input
                            id="fileUrl"
                            type="url"
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleUploadCertificate} disabled={uploading}>
                          {uploading ? "Ajout..." : "Ajouter"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun certificat trouvé</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formation</TableHead>
                        <TableHead>Organisme</TableHead>
                        <TableHead>Émission</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificates.map((certificate) => (
                        <TableRow key={certificate.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {certificate.course_code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={certificate.issuer === "RMTC" ? "default" : "secondary"}>
                              {certificate.issuer}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(certificate.issued_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            {certificate.expires_at ? (
                              <span className={
                                new Date(certificate.expires_at) < new Date() 
                                  ? "text-red-600" 
                                  : new Date(certificate.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                    ? "text-orange-600"
                                    : "text-green-600"
                              }>
                                {new Date(certificate.expires_at).toLocaleDateString("fr-FR")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {certificate.file_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={certificate.file_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default MyTraining;