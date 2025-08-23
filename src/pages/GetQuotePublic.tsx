import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Seo } from "@/components/Seo";

const GetQuotePublic = () => {
  return (
    <>
      <Seo 
        title="Demander un devis - Service de recrutement"
        description="Obtenez un devis personnalisé pour vos besoins en recrutement. Contactez-nous pour une solution sur mesure."
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Demander un devis
          </h1>
          <p className="text-xl text-muted-foreground">
            Décrivez votre projet de recrutement et recevez un devis personnalisé
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations sur votre projet</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour recevoir un devis adapté à vos besoins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input id="company" placeholder="Nom de votre entreprise" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="votre@email.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Poste à pourvoir</Label>
              <Input id="position" placeholder="Ex: Développeur Full Stack Senior" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description du projet</Label>
              <Textarea 
                id="description" 
                placeholder="Décrivez votre besoin en recrutement..."
                rows={4}
              />
            </div>
            
            <Button size="lg" className="w-full">
              Recevoir mon devis
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GetQuotePublic;