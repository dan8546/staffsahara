import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plane, Plus, Send, CheckCircle, XCircle, FileText, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface AirRequest {
  id: string;
  kind: string;
  pax_count?: number;
  route?: any; // Using any for JSON field compatibility
  site?: string;
  extra?: any; // Using any for JSON field compatibility
  status: string;
  created_at: string;
  request_type: string;
  tenant_id: string;
  created_by: string;
  updated_at: string;
  details?: any;
}

interface Leg {
  from: string;
  to: string;
  date: string;
  time_window: string;
}

interface MissionAviationProps {
  missionId: string;
}

const MissionAviation = ({ missionId }: MissionAviationProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<AirRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Form state
  const [kind, setKind] = useState("air_personnel");
  const [paxCount, setPaxCount] = useState<number>(1);
  const [site, setSite] = useState("");
  const [legs, setLegs] = useState<Leg[]>([
    { from: "", to: "", date: "", time_window: "" }
  ]);
  const [dangerousGoods, setDangerousGoods] = useState(false);
  const [medevacLevel, setMedevacLevel] = useState("");
  const [groundServices, setGroundServices] = useState("");

  const kindOptions = [
    { value: "air_personnel", label: t("missions.aviation.kinds.air_personnel") },
    { value: "air_charter", label: t("missions.aviation.kinds.air_charter") },
    { value: "air_ondemand", label: t("missions.aviation.kinds.air_ondemand") },
    { value: "air_medevac", label: t("missions.aviation.kinds.air_medevac") },
    { value: "air_ground", label: t("missions.aviation.kinds.air_ground") },
    { value: "air_mro", label: t("missions.aviation.kinds.air_mro") }
  ];

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("air_requests")
        .select("*")
        .eq("details->>mission_id", missionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data || []) as AirRequest[]);
    } catch (error) {
      console.error("Error loading air requests:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes aériennes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addLeg = () => {
    setLegs([...legs, { from: "", to: "", date: "", time_window: "" }]);
  };

  const updateLeg = (index: number, field: keyof Leg, value: string) => {
    const updatedLegs = [...legs];
    updatedLegs[index] = { ...updatedLegs[index], [field]: value };
    setLegs(updatedLegs);
  };

  const removeLeg = (index: number) => {
    if (legs.length > 1) {
      setLegs(legs.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setKind("air_personnel");
    setPaxCount(1);
    setSite("");
    setLegs([{ from: "", to: "", date: "", time_window: "" }]);
    setDangerousGoods(false);
    setMedevacLevel("");
    setGroundServices("");
  };

  const handleCreate = async () => {
    try {
      // Get current user info
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", user.user?.id!)
        .single();

      const { error } = await supabase
        .from("air_requests")
        .insert({
          request_type: "star_aviation",
          tenant_id: profile?.tenant_id!,
          created_by: user.user?.id!,
          kind,
          pax_count: paxCount,
          route: { legs } as any,
          site,
          extra: {
            dangerous_goods: dangerousGoods,
            medevac_level: medevacLevel,
            ground_services: groundServices
          } as any,
          status: "draft",
          details: { mission_id: missionId } as any
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Demande aérienne créée"
      });

      resetForm();
      setIsCreateOpen(false);
      await loadRequests();

    } catch (error) {
      console.error("Create error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande",
        variant: "destructive"
      });
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("air_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Statut mis à jour: ${newStatus}`
      });

      await loadRequests();

    } catch (error) {
      console.error("Status update error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = (request: AirRequest) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set colors
    const blueColor = [70, 130, 180]; // Blue header
    const goldColor = [255, 215, 0];  // Gold titles
    
    // Header with blue background
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    
    // White logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('STAFF SAHARA', 15, 20);
    
    // Gold subtitle
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.setFontSize(12);
    doc.text('Star Aviation - Demande de Transport Aérien', 15, 25);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Content starting position
    let yPos = 50;
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text('DEMANDE DE TRANSPORT AÉRIEN', 15, yPos);
    yPos += 15;
    
    // Request details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    const details = [
      ['Type:', kindOptions.find(k => k.value === request.kind)?.label || request.kind],
      ['Passagers:', request.pax_count?.toString() || '-'],
      ['Site:', request.site || '-'],
      ['Statut:', request.status],
      ['Date création:', new Date(request.created_at).toLocaleDateString('fr-FR')]
    ];
    
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, yPos);
      yPos += 8;
    });
    
    yPos += 10;
    
    // Route table if legs exist
    if (request.route?.legs && request.route.legs.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text('ITINÉRAIRE', 15, yPos);
      yPos += 10;
      
      // Create table data
      const tableData = request.route.legs.map((leg, index) => [
        `Étape ${index + 1}`,
        leg.from,
        leg.to,
        leg.date,
        leg.time_window || '-'
      ]);
      
    // Add table
    (doc as any).autoTable({
      startY: yPos,
      head: [['Étape', 'Départ', 'Arrivée', 'Date', 'Créneau']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { 
        fillColor: [blueColor[0], blueColor[1], blueColor[2]],
        textColor: [255, 255, 255]
      }
    });
      
      yPos = (doc as any).lastAutoTable.finalY + 20;
    }
    
    // Options
    if (request.extra) {
      doc.setFontSize(14);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text('OPTIONS SPÉCIALES', 15, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      if (request.extra.dangerous_goods) {
        doc.text('✓ Marchandises dangereuses', 15, yPos);
        yPos += 8;
      }
      
      if (request.extra.medevac_level) {
        doc.text(`Niveau medevac: ${request.extra.medevac_level}`, 15, yPos);
        yPos += 8;
      }
      
      if (request.extra.ground_services) {
        doc.text(`Services sol: ${request.extra.ground_services}`, 15, yPos);
        yPos += 8;
      }
    }
    
    // Footer
    yPos = 270;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Document généré le ' + new Date().toLocaleDateString('fr-FR'), 15, yPos);
    doc.text('Staff Sahara - Star Aviation', 15, yPos + 10);
    
    // Save PDF
    doc.save(`demande-aviation-${request.id.slice(0, 8)}.pdf`);
  };

  useEffect(() => {
    loadRequests();
  }, [missionId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          {t("missions.aviation.tab")}
        </CardTitle>
        <div className="flex justify-end">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("missions.aviation.create")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("missions.aviation.create")}</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle demande de transport aérien pour cette mission
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="kind">{t("missions.aviation.kind")}</Label>
                    <Select value={kind} onValueChange={setKind}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kindOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pax">{t("missions.aviation.pax")}</Label>
                    <Input
                      id="pax"
                      type="number"
                      min="1"
                      value={paxCount}
                      onChange={(e) => setPaxCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="site">{t("missions.aviation.site")}</Label>
                    <Input
                      id="site"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                      placeholder="ex: Hassi Messaoud"
                    />
                  </div>
                </div>

                {/* Route */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>{t("missions.aviation.legs")}</Label>
                    <Button variant="outline" size="sm" onClick={addLeg}>
                      {t("missions.aviation.addLeg")}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {legs.map((leg, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>{t("missions.aviation.from")}</Label>
                          <Input
                            value={leg.from}
                            onChange={(e) => updateLeg(index, "from", e.target.value)}
                            placeholder="ALGIERS"
                          />
                        </div>
                        <div>
                          <Label>{t("missions.aviation.to")}</Label>
                          <Input
                            value={leg.to}
                            onChange={(e) => updateLeg(index, "to", e.target.value)}
                            placeholder="HASSI MESSAOUD"
                          />
                        </div>
                        <div>
                          <Label>{t("missions.aviation.date")}</Label>
                          <Input
                            type="date"
                            value={leg.date}
                            onChange={(e) => updateLeg(index, "date", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>{t("missions.aviation.timeWindow")}</Label>
                          <Input
                            value={leg.time_window}
                            onChange={(e) => updateLeg(index, "time_window", e.target.value)}
                            placeholder="08:00-10:00"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLeg(index)}
                            disabled={legs.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Options */}
                <div className="space-y-4">
                  <h4 className="font-medium">Options spéciales</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="dangerous"
                        checked={dangerousGoods}
                        onCheckedChange={setDangerousGoods}
                      />
                      <Label htmlFor="dangerous">{t("missions.aviation.dangerous")}</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="medevac">{t("missions.aviation.medevac")}</Label>
                      <Input
                        id="medevac"
                        value={medevacLevel}
                        onChange={(e) => setMedevacLevel(e.target.value)}
                        placeholder="Level 1, 2, 3..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="ground">{t("missions.aviation.ground")}</Label>
                      <Textarea
                        id="ground"
                        value={groundServices}
                        onChange={(e) => setGroundServices(e.target.value)}
                        placeholder="Services d'assistance requis..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t("missions.aviation.cancel")}
                </Button>
                <Button onClick={handleCreate}>
                  {t("missions.aviation.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("missions.aviation.empty")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("missions.aviation.kind")}</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>{t("missions.aviation.pax")}</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {kindOptions.find(k => k.value === request.kind)?.label || request.kind}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.route?.legs ? (
                      <div className="text-sm">
                        {request.route.legs.map((leg, i) => (
                          <div key={i}>{leg.from} → {leg.to}</div>
                        ))}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{request.pax_count || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status as keyof typeof statusColors] || statusColors.draft}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {request.status === "draft" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(request.id, "sent")}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === "sent" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(request.id, "confirmed")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportToPDF(request)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {request.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(request.id, "cancelled")}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionAviation;