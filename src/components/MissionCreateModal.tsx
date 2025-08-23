import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Building, Plane } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface RFQ {
  id: string;
  title: string;
  description: string;
  created_at: string;
  addons_json?: Json;
}

interface MissionCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MissionCreateModal = ({ open, onOpenChange }: MissionCreateModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load RFQs when modal opens
  useEffect(() => {
    if (open) {
      loadSubmittedRfqs();
    }
  }, [open]);

  const loadSubmittedRfqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .select('id, title, description, created_at, addons_json')
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRfqs(data || []);
    } catch (error) {
      console.error('Error loading RFQs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les RFQ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMissionFromRfq = async () => {
    if (!selectedRfq) return;

    setCreating(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data: mission, error } = await supabase
        .from('missions')
        .insert({
          tenant_id: profile.tenant_id,
          rfq_id: selectedRfq.id,
          title: selectedRfq.title,
          site: extractSiteFromDescription(selectedRfq.description),
          sla_json: { created_from_rfq: true },
          status: 'draft',
          created_by: (await supabase.auth.getUser()).data.user?.id,
          description: selectedRfq.description
        })
        .select()
        .single();

      if (error) throw error;

      // Track mission creation
      console.log('MISSION_CREATED', { mission_id: mission.id });

      toast({
        title: "Mission créée",
        description: "La mission a été créée avec succès depuis le RFQ"
      });

      onOpenChange(false);
      navigate(`/missions/${mission.id}`);
    } catch (error) {
      console.error('Error creating mission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la mission",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const extractSiteFromDescription = (description: string): string => {
    // Simple extraction logic - can be enhanced
    const siteMatch = description.match(/site?\s*:?\s*([^,\n]+)/i);
    return siteMatch ? siteMatch[1].trim() : '';
  };

  const hasAviation = (rfq: RFQ) => {
    const addons = rfq.addons_json as { star_aviation?: any } | null;
    return addons?.star_aviation && 
           typeof addons.star_aviation === 'object' &&
           Object.keys(addons.star_aviation).length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('missions.createModal.title')}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RFQ Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('missions.createModal.selectRfq')}</h3>
            
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : rfqs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Aucun RFQ soumis disponible
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rfqs.map((rfq) => (
                  <Card 
                    key={rfq.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedRfq?.id === rfq.id 
                        ? 'ring-2 ring-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedRfq(rfq)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm">{rfq.title}</CardTitle>
                        {hasAviation(rfq) && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Plane className="h-3 w-3" />
                            {t('missions.createModal.aviation')}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {rfq.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(rfq.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="font-medium">{t('missions.createModal.preview')}</h3>
            
            {selectedRfq ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {selectedRfq.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {extractSiteFromDescription(selectedRfq.description) || 'Site à définir'}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRfq.description}
                    </p>
                  </div>

                  {hasAviation(selectedRfq) && (
                    <div className="pt-2 border-t">
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Plane className="h-3 w-3" />
                        Services aériens inclus
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
                Sélectionnez un RFQ pour voir l'aperçu
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('missions.createModal.cancel')}
          </Button>
          <Button 
            onClick={createMissionFromRfq}
            disabled={!selectedRfq || creating}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Création...
              </>
            ) : (
              t('missions.createModal.create')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};