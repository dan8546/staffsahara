import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SkeletonPage } from "@/components/ui/skeleton-page";

interface Lead {
  id: string;
  company: string;
  name: string;
  email: string;
  phone?: string;
  site?: string;
  need_summary?: string;
  source: string;
  created_at: string;
  star_aviation?: any;
  ticketing?: boolean;
}

const AdminLeads = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.need_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const exportToCsv = () => {
    if (filteredLeads.length === 0) return;

    const headers = ['Société', 'Nom', 'Email', 'Téléphone', 'Site', 'Besoin', 'Source', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.company}"`,
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.phone || ''}"`,
        `"${lead.site || ''}"`,
        `"${lead.need_summary || ''}"`,
        `"${lead.source}"`,
        `"${new Date(lead.created_at).toLocaleDateString('fr-FR')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900 mb-2">
          {t('leads.title')}
        </h1>
        <p className="text-muted-foreground">
          Gestion des demandes de devis et contacts
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par société, nom, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={sourceFilter === "all" ? "default" : "outline"}
                onClick={() => setSourceFilter("all")}
                size="sm"
              >
                Tous ({leads.length})
              </Button>
              <Button
                variant={sourceFilter === "get-quote" ? "default" : "outline"}
                onClick={() => setSourceFilter("get-quote")}
                size="sm"
              >
                Devis ({leads.filter(l => l.source === 'get-quote').length})
              </Button>
            </div>
            <Button onClick={exportToCsv} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {t('leads.export')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t('leads.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Société</th>
                    <th className="text-left p-4 font-medium">Contact</th>
                    <th className="text-left p-4 font-medium">Site</th>
                    <th className="text-left p-4 font-medium">Besoin</th>
                    <th className="text-left p-4 font-medium">Source</th>
                    <th className="text-left p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-t hover:bg-muted/25">
                      <td className="p-4">
                        <div className="font-medium">{lead.company}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-muted-foreground text-xs">{lead.email}</div>
                        {lead.phone && (
                          <div className="text-muted-foreground text-xs">{lead.phone}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">{lead.site || '-'}</span>
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="truncate" title={lead.need_summary}>
                          {lead.need_summary || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{lead.source}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminLeads;