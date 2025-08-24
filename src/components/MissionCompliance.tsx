import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Plus, Users, Calendar, MapPin, UserCheck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MissionComplianceProps {
  missionId: string;
}

interface TrainingSession {
  id: string;
  starts_at: string;
  ends_at: string;
  location: string;
  capacity: number;
  training_courses: {
    code: string;
    title: string;
  };
  enrollments_count?: number;
}

const MissionCompliance = ({ missionId }: MissionComplianceProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [requiredCerts, setRequiredCerts] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<TrainingSession[]>([]);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [newCert, setNewCert] = useState("");
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const commonCertifications = [
    "H2S", "BOSIET", "FIRST_AID", "HELICOPTER", "FIRE_SAFETY",
    "CONFINED_SPACE", "WORKING_AT_HEIGHT", "RIGGING", "CRANE_OPERATOR",
    "ELECTRICAL_SAFETY", "WELDING", "SCAFFOLDING"
  ];

  const loadAvailableSessions = async () => {
    if (requiredCerts.length === 0) return;
    
    try {
      const { data, error } = await supabase
        .from("training_sessions")
        .select(`
          *,
          training_courses(code, title),
          enrollments(count)
        `)
        .eq("status", "scheduled")
        .gte("starts_at", new Date().toISOString())
        .in("training_courses.code", requiredCerts)
        .order("starts_at", { ascending: true });

      if (error) throw error;
      
      // Process sessions with enrollment count
      const processedSessions = (data || []).map(session => ({
        ...session,
        enrollments_count: session.enrollments?.[0]?.count || 0
      }));
      
      setAvailableSessions(processedSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const handleAddCertification = () => {
    if (newCert && !requiredCerts.includes(newCert)) {
      setRequiredCerts([...requiredCerts, newCert]);
      setNewCert("");
      setIsAddCertOpen(false);
    }
  };

  const removeCertification = (cert: string) => {
    setRequiredCerts(requiredCerts.filter(c => c !== cert));
  };

  const handleProposeSessions = async () => {
    if (selectedSessions.length === 0) return;
    
    setLoading(true);
    try {
      // For each selected session, get mission team members
      // This is a simplified version - in real implementation, 
      // you'd need to get actual mission team members
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Create enrollments for the current user as example
      const enrollments = selectedSessions.map(sessionId => ({
        session_id: sessionId,
        talent_id: user.user.id,
        source: "mission",
        status: "pending"
      }));

      const { error } = await supabase
        .from("enrollments")
        .insert(enrollments);

      if (error) throw error;

      toast({
        title: "Sessions proposées",
        description: `${selectedSessions.length} session(s) RMTC proposée(s) avec succès`
      });

      setSelectedSessions([]);
      setIsProposalOpen(false);
      
    } catch (error) {
      console.error("Error proposing sessions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de proposer les sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableSessions();
  }, [requiredCerts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("missions.compliance.tab")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Certifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-medium">
              {t("missions.compliance.required")}
            </Label>
            <Dialog open={isAddCertOpen} onOpenChange={setIsAddCertOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("missions.compliance.addCert")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("missions.compliance.selectCerts")}</DialogTitle>
                  <DialogDescription>
                    Sélectionnez une certification requise pour cette mission
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Select value={newCert} onValueChange={setNewCert}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une certification" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonCertifications
                        .filter(cert => !requiredCerts.includes(cert))
                        .map((cert) => (
                          <SelectItem key={cert} value={cert}>
                            {cert}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  
                  <div>
                    <Label htmlFor="custom">Certification personnalisée</Label>
                    <Input
                      id="custom"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value.toUpperCase())}
                      placeholder="ex: SPECIFIC_CERT"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCertOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddCertification} disabled={!newCert}>
                    Ajouter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {requiredCerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucune certification requise définie
              </p>
            ) : (
              requiredCerts.map((cert) => (
                <Badge key={cert} variant="outline" className="gap-2">
                  {cert}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeCertification(cert)}
                  />
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* RMTC Sessions Proposal */}
        {requiredCerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">
                {t("missions.compliance.proposeSessions")}
              </Label>
              <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    {t("missions.compliance.propose")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Sessions RMTC disponibles</DialogTitle>
                    <DialogDescription>
                      Sélectionnez les sessions à proposer à l'équipe mission
                    </DialogDescription>
                  </DialogHeader>
                  
                  {availableSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {t("missions.compliance.noSessions")}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Formation</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Lieu</TableHead>
                          <TableHead>Capacité</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedSessions.includes(session.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSessions([...selectedSessions, session.id]);
                                  } else {
                                    setSelectedSessions(selectedSessions.filter(id => id !== session.id));
                                  }
                                }}
                                className="rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {session.training_courses.code}
                                </Badge>
                                <div className="font-medium">
                                  {session.training_courses.title}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-ink-500" />
                                {new Date(session.starts_at).toLocaleDateString("fr-FR")}
                              </div>
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsProposalOpen(false)}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleProposeSessions} 
                      disabled={selectedSessions.length === 0 || loading}
                    >
                      {loading ? "Proposition..." : `Proposer ${selectedSessions.length} session(s)`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionCompliance;