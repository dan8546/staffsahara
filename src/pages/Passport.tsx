import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, FileText, Shield, Calendar } from "lucide-react";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/stores/useSession";
import { toast } from "sonner";

const Passport = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [profile, setProfile] = useState({
    languages: [] as string[],
    location: '',
    availability: 'available',
    skills: [] as string[],
    experience_years: 0
  });
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadCertificates();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setProfile({
          languages: data.skills || [],
          location: data.location || '',
          availability: data.availability || 'available',
          skills: data.skills || [],
          experience_years: data.experience_years || 0
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadCertificates = async () => {
    try {
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .eq('talent_id', user?.id);

      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('talent_profiles')
        .upsert({
          user_id: user.id,
          location: profile.location,
          availability: profile.availability,
          skills: profile.skills,
          experience_years: profile.experience_years
        });

      if (error) throw error;
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile');
    }
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      languages: checked 
        ? [...prev.languages, language]
        : prev.languages.filter(l => l !== language)
    }));
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

  const mockProfile = {
    name: "John Doe",
    title: "Ingénieur HSE Senior",
    status: "verified",
    completeness: 85,
    certificates: [
      { name: "NEBOSH IGC", expiry: "2025-06-15", status: "valid" },
      { name: "IOSH Managing Safely", expiry: "2024-12-01", status: "expires_soon" },
      { name: "First Aid", expiry: "2026-03-10", status: "valid" }
    ],
    documents: [
      { name: "CV", status: "verified" },
      { name: "Diplômes", status: "verified" },
      { name: "Références", status: "pending" }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": case "verified": return "bg-green-100 text-green-800";
      case "expires_soon": case "pending": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <Seo 
        title={`${t('passport.title')} - Staff Sahara`}
        description={t('passport.description')}
      />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-ink-900 mb-2">
          {t('passport.title')}
        </h1>
        <p className="text-xl text-ink-700">
          {t('passport.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-brand-blue" />
              </div>
              <CardTitle>{mockProfile.name}</CardTitle>
              <CardDescription>{mockProfile.title}</CardDescription>
              <Badge className={getStatusColor(mockProfile.status)}>
                Profil vérifié
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Complétude du profil</span>
                    <span>{mockProfile.completeness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${mockProfile.completeness}%` }}
                    />
                  </div>
                </div>
                <Button className="w-full rounded-2xl">
                  {t('cta.createPassport')}
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
              <div className="space-y-3">
                {mockProfile.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-ink-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expire le {new Date(cert.expiry).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(cert.status)}>
                      {cert.status === 'valid' ? 'Valide' : 'Expire bientôt'}
                    </Badge>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {mockProfile.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{doc.name}</p>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status === 'verified' ? 'Vérifié' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
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