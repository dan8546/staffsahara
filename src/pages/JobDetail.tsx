import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, DollarSign, Building, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/stores/useSession";
import { computeCoverage } from "@/utils/compliance";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSession();

  // Mock data - in real app, fetch by ID
  const job = {
    id,
    title: "Ingénieur HSE Senior",
    company: "RedMed Energy",
    location: "Hassi Messaoud, Algérie",
    type: "CDI",
    salary: "250k - 350k DA/mois",
    posted: "2024-01-15",
    urgency: "high",
    description: `Nous recherchons un Ingénieur HSE Senior pour rejoindre notre équipe sur le site de Hassi Messaoud. 
    
Le candidat idéal supervisera la mise en œuvre des politiques de sécurité, santé et environnement, assurera la formation du personnel et maintiendra la conformité réglementaire.

Cette position offre une opportunité unique de travailler sur des projets d'envergure dans l'industrie pétrolière et gazière.`,
    requirements: [
      "Diplôme d'ingénieur en HSE ou équivalent",
      "Minimum 5 ans d'expérience en industrie pétrolière",
      "Certifications NEBOSH/IOSH requises",
      "Maîtrise de l'anglais et du français",
      "Capacité à travailler en rotation (4x4 ou 6x3)",
      "Permis de conduire algérien ou international"
    ],
    benefits: [
      "Salaire compétitif avec primes de performance",
      "Assurance santé complète",
      "Transport et hébergement fournis",
      "Formation continue prise en charge",
      "Possibilités d'évolution de carrière"
    ],
    contact: {
      name: "Service Recrutement",
      email: "recrutement@redmed-energy.com",
      phone: "+213 29 XX XX XX"
    },
    required_certs: ["HSE_BASIC", "NEBOSH_IGC", "FIRST_AID"]
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Insert application
      const { error } = await supabase
        .from('applications')
        .insert({
          opening_id: id,
          applicant_id: user.id,
          status: 'submitted',
          score: 0,
          applied_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      navigate('/training/my');
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Error submitting application');
    }
  };

  // Calculate compatibility if required certs exist
  const compatibility = job.required_certs ? computeCoverage(
    [], // Mock empty certificates - in real app, fetch user certificates
    job.required_certs
  ) : null;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux offres
        </Button>
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold text-ink-900 mb-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-ink-600 mb-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {job.company}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {job.type}
              </Badge>
              <Badge className="bg-red-100 text-red-800">
                Urgent
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-auto">
            <Button 
              size="lg" 
              className="rounded-2xl shadow-soft focus:ring-4 ring-brand-gold/40"
              onClick={handleApply}
            >
              {t('jobs.apply')}
            </Button>
            {compatibility && (
              <div className="text-center">
                <span className="text-sm text-ink-600">{t('jobs.compat')}: </span>
                <Badge variant={compatibility.coverage >= 80 ? "default" : "destructive"}>
                  {Math.round(compatibility.coverage)}%
                </Badge>
              </div>
            )}
            <Button variant="secondary" size="lg" className="rounded-2xl">
              Sauvegarder l'offre
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue">Description du poste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {job.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-ink-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue">Profil recherché</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-gold rounded-full mt-2 flex-shrink-0" />
                    <span className="text-ink-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue">Avantages</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-ink-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-ink-500" />
                <div>
                  <p className="text-sm text-ink-600">Salaire</p>
                  <p className="font-medium">{job.salary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-ink-500" />
                <div>
                  <p className="text-sm text-ink-600">Publié le</p>
                  <p className="font-medium">
                    {new Date(job.posted).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-ink-500" />
                <div>
                  <p className="text-sm text-ink-600">Type de contrat</p>
                  <p className="font-medium">{job.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{job.contact.name}</p>
                <p className="text-sm text-ink-600">{job.contact.email}</p>
                <p className="text-sm text-ink-600">{job.contact.phone}</p>
              </div>
              <Button variant="outline" className="w-full rounded-2xl">
                Contacter le recruteur
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-brand-blue">Offres similaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-paper-50 cursor-pointer">
                  <p className="font-medium text-sm">Ingénieur HSE Junior</p>
                  <p className="text-xs text-ink-600">RedMed Energy - Adrar</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-paper-50 cursor-pointer">
                  <p className="font-medium text-sm">Superviseur HSE</p>
                  <p className="text-xs text-ink-600">Staff Sahara - In Salah</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;