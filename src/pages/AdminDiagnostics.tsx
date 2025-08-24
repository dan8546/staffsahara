import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

const AdminDiagnostics = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: DiagnosticResult[] = [];

    try {
      // 1. Auth & Current Role
      try {
        const { data: userData, error } = await supabase.rpc('get_me');
        if (error) throw error;
        
        diagnostics.push({
          name: "Auth & Current Role",
          status: userData?.length > 0 ? 'success' : 'error',
          message: userData?.length > 0 ? `✅ Connecté: ${userData[0]?.role}` : "❌ Erreur d'authentification"
        });
      } catch (error) {
        diagnostics.push({
          name: "Auth & Current Role",
          status: 'error',
          message: `❌ Erreur: ${error}`
        });
      }

      // 2. Storage Bucket Access
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        
        const hasDocs = buckets?.some(bucket => bucket.name === 'docs');
        diagnostics.push({
          name: "Storage Bucket 'docs'",
          status: hasDocs ? 'success' : 'warning',
          message: hasDocs ? "✅ Bucket 'docs' trouvé" : "⚠️ Bucket 'docs' manquant"
        });
      } catch (error) {
        diagnostics.push({
          name: "Storage Bucket 'docs'",
          status: 'error',
          message: `❌ Erreur storage: ${error}`
        });
      }

      // 3. Key Tables
      const tables = ['training_courses', 'training_sessions', 'enrollments', 'certificates'] as const;
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('id').limit(1);
          if (error) throw error;
          
          diagnostics.push({
            name: `Table ${table}`,
            status: 'success',
            message: `✅ Table ${table} accessible`
          });
        } catch (error) {
          diagnostics.push({
            name: `Table ${table}`,
            status: 'error',
            message: `❌ Table ${table}: ${error}`
          });
        }
      }

      // 4. RLS Policies Test
      try {
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('id')
          .limit(1);
        
        const { data: certificates, error: certError } = await supabase
          .from('certificates')
          .select('id')
          .limit(1);

        if (enrollError && certError) {
          diagnostics.push({
            name: "RLS Policies",
            status: 'warning',
            message: "⚠️ RLS potentiellement restrictive"
          });
        } else {
          diagnostics.push({
            name: "RLS Policies",
            status: 'success',
            message: "✅ Accès RLS fonctionnel"
          });
        }
      } catch (error) {
        diagnostics.push({
          name: "RLS Policies",
          status: 'error',
          message: `❌ Erreur RLS: ${error}`
        });
      }

      // 5. i18n Keys
      try {
        const complianceKeys = [
          t('missions.compliance.tab'),
          t('missions.compliance.required'),
          t('missions.compliance.propose')
        ];
        
        const hasKeys = complianceKeys.every(key => key && !key.includes('missions.compliance'));
        diagnostics.push({
          name: "i18n Keys missions.compliance.*",
          status: hasKeys ? 'success' : 'warning',
          message: hasKeys ? "✅ Clés i18n trouvées" : "⚠️ Clés i18n manquantes"
        });
      } catch (error) {
        diagnostics.push({
          name: "i18n Keys missions.compliance.*",
          status: 'error',
          message: `❌ Erreur i18n: ${error}`
        });
      }

      // 6. jsPDF Import
      try {
        // Check if jsPDF is available
        const jsPDF = await import('jspdf');
        await import('jspdf-autotable');
        
        diagnostics.push({
          name: "jsPDF Import",
          status: 'success',
          message: "✅ jsPDF et jspdf-autotable accessibles"
        });
      } catch (error) {
        diagnostics.push({
          name: "jsPDF Import",
          status: 'error',
          message: `❌ Erreur jsPDF: ${error}`
        });
      }

    } catch (globalError) {
      diagnostics.push({
        name: "Diagnostic Global",
        status: 'error',
        message: `❌ Erreur globale: ${globalError}`
      });
    }

    setResults(diagnostics);
    setLoading(false);

    // Summary toast
    const successCount = diagnostics.filter(d => d.status === 'success').length;
    const totalCount = diagnostics.length;
    
    toast({
      title: "Diagnostic terminé",
      description: `${successCount}/${totalCount} vérifications réussies`,
      variant: successCount === totalCount ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default' as const;
      case 'warning': return 'secondary' as const;
      case 'error': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <>
      <Seo 
        title="Diagnostics Admin — Staff Sahara"
        description="Diagnostic système et vérifications de fonctionnement"
      />
      
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ink-900 mb-4">
            Diagnostics Système
          </h1>
          <p className="text-xl text-ink-600">
            Vérifications runtime des composants critiques
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Résultats des diagnostics</span>
              <Button 
                onClick={runDiagnostics}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {loading ? "Test en cours..." : "Re-tester"}
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Cliquez sur "Re-tester" pour lancer les diagnostics
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground max-w-md text-right">
                        {result.message}
                      </span>
                      <Badge variant={getStatusVariant(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {results.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Réussis</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Avertissements</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {results.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Erreurs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default AdminDiagnostics;