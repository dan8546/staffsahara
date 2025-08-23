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
      console.log('LEAD_SUBMIT', formData);
      
      toast({
        title: t('getQuote.form.success'),
        variant: "default"
      });
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      toast({
        title: t('getQuote.form.error'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            {t('getQuote.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('getQuote.subtitle')}
          </p>
        </div>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <CardTitle>{t('getQuote.title')}</CardTitle>
            <CardDescription>
              {t('getQuote.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">{t('getQuote.form.company')}</Label>
                  <Input 
                    id="company"
                    value={formData.company}
                    onChange={handleChange('company')}
                    placeholder={t('getQuote.form.companyPlaceholder')}
                    required
                    aria-describedby="company-desc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('getQuote.form.name')}</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder={t('getQuote.form.namePlaceholder')}
                    required
                    aria-describedby="name-desc"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('getQuote.form.email')}</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder={t('getQuote.form.emailPlaceholder')}
                    required
                    aria-describedby="email-desc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('getQuote.form.phone')}</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    placeholder={t('getQuote.form.phonePlaceholder')}
                    aria-describedby="phone-desc"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">{t('getQuote.form.region')}</Label>
                <Input 
                  id="region"
                  value={formData.region}
                  onChange={handleChange('region')}
                  placeholder={t('getQuote.form.regionPlaceholder')}
                  aria-describedby="region-desc"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">{t('getQuote.form.summary')}</Label>
                <Textarea 
                  id="summary"
                  value={formData.summary}
                  onChange={handleChange('summary')}
                  placeholder={t('getQuote.form.summaryPlaceholder')}
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
                      {t('getQuote.form.starAviation')}
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
                      {t('getQuote.form.billetterie')}
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
                {isSubmitting ? "..." : t('getQuote.form.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GetQuotePublic;