import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/stores/useSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Trash2, Plus } from "lucide-react";

// Schemas de validation
const profileSchema = z.object({
  profile: z.string().min(2, "Le profil doit contenir au moins 2 caractères"),
  seniority: z.enum(["Junior", "Mid", "Senior"]),
  qty: z.number().min(1, "La quantité doit être d'au moins 1")
});

const step1Schema = z.object({
  profiles: z.array(profileSchema).min(1, "Au moins un profil est requis")
});

const step2Schema = z.object({
  sites: z.array(z.string()).min(1, "Au moins un site est requis"),
  start_date: z.string().refine((date) => new Date(date) >= new Date(), {
    message: "La date de démarrage doit être aujourd'hui ou dans le futur"
  }),
  rotation: z.object({
    on: z.number().min(7).max(42),
    off: z.number().min(7).max(42)
  }),
  languages: z.array(z.string()),
  hse_reqs: z.array(z.string())
});

const step3Schema = z.object({
  star_aviation: z.object({
    enabled: z.boolean(),
    services: z.array(z.string()),
    details: z.object({
      pax_count: z.number().optional(),
      legs: z.array(z.object({
        from: z.string(),
        to: z.string(),
        date: z.string(),
        time_window: z.string()
      })).optional(),
      site: z.string().optional(),
      dangerous_goods: z.boolean().optional(),
      medevac_level: z.string().optional(),
      ground_services: z.array(z.string()).optional()
    }).optional()
  }),
  ticketing: z.boolean()
});

interface Profile {
  profile: string;
  seniority: "Junior" | "Mid" | "Senior";
  qty: number;
}

interface Step2Data {
  sites: string[];
  start_date: string;
  rotation: { on: number; off: number };
  languages: string[];
  hse_reqs: string[];
}

interface Step3Data {
  star_aviation: {
    enabled: boolean;
    services: string[];
    details?: {
      pax_count?: number;
      legs?: Array<{ from: string; to: string; date: string; time_window: string }>;
      site?: string;
      dangerous_goods?: boolean;
      medevac_level?: string;
      ground_services?: string[];
    };
  };
  ticketing: boolean;
}

const RFQ = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>([
    { profile: "", seniority: "Junior", qty: 1 }
  ]);
  const [step2Data, setStep2Data] = useState<Step2Data>({
    sites: [""],
    start_date: "",
    rotation: { on: 14, off: 14 },
    languages: [""],
    hse_reqs: [""]
  });
  const [step3Data, setStep3Data] = useState<Step3Data>({
    star_aviation: {
      enabled: false,
      services: [],
      details: {}
    },
    ticketing: false
  });

  const addProfile = () => {
    setProfiles([...profiles, { profile: "", seniority: "Junior", qty: 1 }]);
  };

  const removeProfile = (index: number) => {
    if (profiles.length > 1) {
      setProfiles(profiles.filter((_, i) => i !== index));
    }
  };

  const updateProfile = (index: number, field: keyof Profile, value: any) => {
    const updated = [...profiles];
    updated[index] = { ...updated[index], [field]: value };
    setProfiles(updated);
  };

  const validateStep1 = () => {
    try {
      step1Schema.parse({ profiles });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: error.issues[0]?.message || "Données invalides"
        });
      }
      return false;
    }
  };

  const validateStep2 = () => {
    try {
      step2Schema.parse(step2Data);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive", 
          title: "Erreur de validation",
          description: error.issues[0]?.message || "Données invalides"
        });
      }
      return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      step3Schema.parse(step3Data);

      const rfqData = {
        tenant_id: profile?.tenant_id,
        title: `RFQ - ${new Date().toLocaleDateString()}`,
        profiles_json: profiles,
        sites_json: step2Data.sites.filter(s => s.trim()),
        sla_json: {
          start_date: step2Data.start_date,
          rotation: step2Data.rotation,
          languages: step2Data.languages.filter(l => l.trim()),
          hse_reqs: step2Data.hse_reqs.filter(h => h.trim())
        },
        addons_json: step3Data,
        status: 'submitted',
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('rfqs')
        .insert([rfqData])
        .select()
        .single();

      if (error) throw error;

      // Track event (placeholder for analytics)
      console.log('RFQ_SUBMIT', { rfq_id: data.id });

      toast({
        title: "Succès",
        description: t('rfq.saved')
      });

      navigate('/missions');
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de soumettre le RFQ"
      });
    }
  };

  const addArrayItem = (field: keyof Step2Data, setValue: (value: any) => void) => {
    const currentArray = step2Data[field] as string[];
    setValue([...currentArray, ""]);
  };

  const removeArrayItem = (field: keyof Step2Data, index: number, setValue: (value: any) => void) => {
    const currentArray = step2Data[field] as string[];
    if (currentArray.length > 1) {
      setValue(currentArray.filter((_, i) => i !== index));
    }
  };

  const updateArrayItem = (field: keyof Step2Data, index: number, value: string, setValue: (value: any) => void) => {
    const currentArray = step2Data[field] as string[];
    const updated = [...currentArray];
    updated[index] = value;
    setValue(updated);
  };

  const starAviationServices = [
    { key: "air_personnel", label: "Personnel aérien" },
    { key: "air_charter", label: "Affrètement" },
    { key: "air_ondemand", label: "Vols à la demande" },
    { key: "air_medevac", label: "Évacuation médicale" },
    { key: "air_ground", label: "Services au sol" },
    { key: "air_mro", label: "Maintenance" }
  ];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-ink-900 mb-4">
          {t('nav.rfq')}
        </h1>
        <p className="text-xl text-ink-700 max-w-3xl mx-auto">
          Décrivez vos besoins en personnel et recevez un devis détaillé sous 48h
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
          ))}
        </div>
      </div>

      <Card className="rounded-2xl shadow-soft p-4 md:p-6">
        {currentStep === 1 && (
          <div>
            <CardHeader>
              <CardTitle className="text-brand-blue">{t('rfq_form.step1')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profiles.map((profile, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`profile-${index}`}>{t('rfq_form.profile')}</Label>
                    <Input
                      id={`profile-${index}`}
                      placeholder={t('rfq_form.placeholders.profile')}
                      value={profile.profile}
                      onChange={(e) => updateProfile(index, 'profile', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`seniority-${index}`}>{t('rfq_form.seniority')}</Label>
                    <Select
                      value={profile.seniority}
                      onValueChange={(value) => updateProfile(index, 'seniority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid">Mid</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`qty-${index}`}>{t('rfq_form.qty')}</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      min="1"
                      placeholder={t('rfq_form.placeholders.qty')}
                      value={profile.qty}
                      onChange={(e) => updateProfile(index, 'qty', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex items-end">
                    {profiles.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeProfile(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addProfile} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t('rfq_form.addProfile')}
              </Button>
              <div className="flex justify-end">
                <Button onClick={handleNext}>{t('rfq_form.next')}</Button>
              </div>
            </CardContent>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <CardHeader>
              <CardTitle className="text-brand-blue">{t('rfq_form.step2')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('rfq_form.sites')}</Label>
                  {step2Data.sites.map((site, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={site}
                        onChange={(e) => updateArrayItem('sites', index, e.target.value, (sites) => setStep2Data({...step2Data, sites}))}
                        placeholder="Nom du site"
                      />
                      {step2Data.sites.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('sites', index, (sites) => setStep2Data({...step2Data, sites}))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('sites', (sites) => setStep2Data({...step2Data, sites}))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un site
                  </Button>
                </div>

                <div>
                  <Label htmlFor="startDate">{t('rfq_form.startDate')}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={step2Data.start_date}
                    onChange={(e) => setStep2Data({...step2Data, start_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label>{t('rfq_form.rotationOn')}</Label>
                  <Input
                    type="number"
                    min="7"
                    max="42"
                    value={step2Data.rotation.on}
                    onChange={(e) => setStep2Data({...step2Data, rotation: {...step2Data.rotation, on: parseInt(e.target.value) || 14}})}
                  />
                  <p className="text-sm text-muted-foreground">{t('rfq_form.helpers.rotation')}</p>
                </div>

                <div>
                  <Label>{t('rfq_form.rotationOff')}</Label>
                  <Input
                    type="number"
                    min="7"
                    max="42"
                    value={step2Data.rotation.off}
                    onChange={(e) => setStep2Data({...step2Data, rotation: {...step2Data.rotation, off: parseInt(e.target.value) || 14}})}
                  />
                </div>

                <div>
                  <Label>{t('rfq_form.languages')}</Label>
                  {step2Data.languages.map((lang, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={lang}
                        onChange={(e) => updateArrayItem('languages', index, e.target.value, (languages) => setStep2Data({...step2Data, languages}))}
                        placeholder="Français, Anglais..."
                      />
                      {step2Data.languages.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('languages', index, (languages) => setStep2Data({...step2Data, languages}))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('languages', (languages) => setStep2Data({...step2Data, languages}))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une langue
                  </Button>
                </div>

                <div>
                  <Label>{t('rfq_form.hse')}</Label>
                  {step2Data.hse_reqs.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={req}
                        onChange={(e) => updateArrayItem('hse_reqs', index, e.target.value, (hse_reqs) => setStep2Data({...step2Data, hse_reqs}))}
                        placeholder="Formation HSE, EPI..."
                      />
                      {step2Data.hse_reqs.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeArrayItem('hse_reqs', index, (hse_reqs) => setStep2Data({...step2Data, hse_reqs}))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('hse_reqs', (hse_reqs) => setStep2Data({...step2Data, hse_reqs}))}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une exigence
                  </Button>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Précédent
                </Button>
                <Button onClick={handleNext}>{t('rfq_form.next')}</Button>
              </div>
            </CardContent>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <CardHeader>
              <CardTitle className="text-brand-blue">{t('rfq_form.step3')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star Aviation */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="star-aviation"
                    checked={step3Data.star_aviation.enabled}
                    onCheckedChange={(checked) => 
                      setStep3Data({
                        ...step3Data,
                        star_aviation: { ...step3Data.star_aviation, enabled: !!checked }
                      })
                    }
                  />
                  <Label htmlFor="star-aviation" className="font-medium">
                    {t('rfq.airlift')}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('rfq.airlift_note')}
                </p>

                {step3Data.star_aviation.enabled && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Services demandés</Label>
                      {starAviationServices.map((service) => (
                        <div key={service.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.key}
                            checked={step3Data.star_aviation.services.includes(service.key)}
                            onCheckedChange={(checked) => {
                              const services = checked
                                ? [...step3Data.star_aviation.services, service.key]
                                : step3Data.star_aviation.services.filter(s => s !== service.key);
                              setStep3Data({
                                ...step3Data,
                                star_aviation: { ...step3Data.star_aviation, services }
                              });
                            }}
                          />
                          <Label htmlFor={service.key}>{service.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ticketing */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ticketing"
                  checked={step3Data.ticketing}
                  onCheckedChange={(checked) => setStep3Data({...step3Data, ticketing: !!checked})}
                />
                <Label htmlFor="ticketing" className="font-medium">
                  {t('rfq.ticketing')}
                </Label>
              </div>

              {/* Summary */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Résumé de votre demande</h3>
                <div>
                  <strong>Profils :</strong> {profiles.length} profil(s)
                  <ul className="ml-4 list-disc">
                    {profiles.map((p, i) => (
                      <li key={i}>{p.qty}x {p.profile} ({p.seniority})</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Sites :</strong> {step2Data.sites.filter(s => s.trim()).join(', ')}
                </div>
                <div>
                  <strong>Rotation :</strong> {step2Data.rotation.on}/{step2Data.rotation.off}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Précédent
                </Button>
                <Button onClick={handleSubmit} className="bg-brand-blue">
                  {t('rfq.submit')}
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RFQ;