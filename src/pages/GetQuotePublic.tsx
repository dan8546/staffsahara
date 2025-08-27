import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Seo } from "@/components/Seo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";

const GetQuotePublic = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    region: "",
    summary: "",
    starAviation: false,
    billetterie: false
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleCheckboxChange = (field: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save lead to Supabase
      const { error } = await supabase.from('leads').insert({
        company: formData.company,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        site: formData.region,
        need_summary: formData.summary,
        star_aviation: formData.starAviation ? {} : null,
        ticketing: formData.billetterie
      });

      if (error) throw error;
      
      // Track lead submission
      track('LEAD_SUBMIT', { source: 'get-quote' });
      
      toast({
        title: t('quote.ok'),
        variant: "default"
      });
      
      // Reset form
      setFormData({
        company: "",
        name: "",
        email: "",
        phone: "",
        region: "",
        summary: "",
        starAviation: false,
        billetterie: false
      });
    } catch (error) {
      toast({
        title: "Erreur lors de l'envoi",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessActions = () => {
    return (
      <div className="text-center space-y-4 mt-6">
        <p className="text-ink-700">{t('quote.ok')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => window.open('https://redmed-learn-hub.vercel.app/', '_blank', 'noopener')}
            className="rounded-2xl"
          >
            Voir nos formations RMTC
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="rounded-2xl"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Seo 
        title={t('getQuote.title')}
        description={t('getQuote.subtitle')}
      />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('quote.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('quote.subtitle')}
          </p>
        </div>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle>{t('quote.title')}</CardTitle>
            <CardDescription>
              {t('quote.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">{t('quote.company')}</Label>
                  <Input 
                    id="company"
                    value={formData.company}
                    onChange={handleChange('company')}
                    required
                    aria-describedby="company-desc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('quote.name')}</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    required
                    aria-describedby="name-desc"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('quote.email')}</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    aria-describedby="email-desc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('quote.phone')}</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    aria-describedby="phone-desc"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">{t('quote.site')}</Label>
                <Input 
                  id="region"
                  value={formData.region}
                  onChange={handleChange('region')}
                  aria-describedby="region-desc"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">{t('quote.need')}</Label>
                <Textarea 
                  id="summary"
                  value={formData.summary}
                  onChange={handleChange('summary')}
                  rows={4}
                  required
                  aria-describedby="summary-desc"
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Services d'intérêt</Label>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="starAviation"
                      checked={formData.starAviation}
                      onCheckedChange={handleCheckboxChange('starAviation')}
                      aria-describedby="star-aviation-desc"
                    />
                    <Label htmlFor="starAviation" className="font-normal">
                      Star Aviation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="billetterie"
                      checked={formData.billetterie}
                      onCheckedChange={handleCheckboxChange('billetterie')}
                      aria-describedby="billetterie-desc"
                    />
                    <Label htmlFor="billetterie" className="font-normal">
                      Billetterie
                    </Label>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-2xl"
                disabled={isSubmitting}
                aria-describedby="submit-desc"
              >
                {isSubmitting ? "..." : t('quote.submit')}
              </Button>
              
              {/* Success actions shown after successful submission */}
              {!formData.company && !formData.email && showSuccessActions()}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GetQuotePublic;