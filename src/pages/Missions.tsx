import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Search, Plus, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
// import { MissionCreateModal } from "@/components/MissionCreateModal";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  title: string;
  site?: string;
  status: string;
  created_at: string;
  rfq_id?: string;
  description?: string;
}

const Missions = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [siteFilter, setSiteFilter] = useState(searchParams.get('site') || 'all');
  // const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (siteFilter !== 'all') params.set('site', siteFilter);
    setSearchParams(params);
  }, [searchTerm, statusFilter, siteFilter, setSearchParams]);

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Error loading missions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les missions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "in_review": return "bg-blue-100 text-blue-800";
      case "signed": return "bg-amber-100 text-amber-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const matchesSearch = !searchTerm ||
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.site?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
      const matchesSite = siteFilter === 'all' || mission.site === siteFilter;
      return matchesSearch && matchesStatus && matchesSite;
    });
  }, [missions, searchTerm, statusFilter, siteFilter]);

  const uniqueSites = useMemo(() => {
    const sites = missions
      .map(m => m.site)
      .filter(Boolean)
      .filter((site, index, arr) => arr.indexOf(site) === index);
    return sites;
  }, [missions]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-ink-900 mb-2">
            {t('missions.title')}
          </h1>
          <p className="text-xl text-ink-700">
            {t('missions.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="rounded-2xl shadow-soft">
            <Link to="/rfq">
              <FileText className="h-4 w-4 mr-2" />
              {t('missions.createFromRfq')}
            </Link>
          </Button>
          <Button className="rounded-2xl shadow-soft">
            <Plus className="h-4 w-4 mr-2" />
            {t('missions.newMission')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder={t('missions.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('missions.filters.all')}</SelectItem>
            <SelectItem value="draft">{t('missions.status.draft')}</SelectItem>
            <SelectItem value="in_review">{t('missions.status.in_review')}</SelectItem>
            <SelectItem value="signed">{t('missions.status.signed')}</SelectItem>
            <SelectItem value="active">{t('missions.status.active')}</SelectItem>
            <SelectItem value="completed">{t('missions.status.completed')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger>
            <SelectValue placeholder={t('missions.filters.site')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('missions.filters.all')}</SelectItem>
            {uniqueSites.map(site => (
              <SelectItem key={site} value={site!}>{site}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      ) : filteredMissions.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">{t('missions.emptyState.title')}</h3>
            <p className="text-muted-foreground mb-4">{t('missions.emptyState.description')}</p>
            <Button asChild>
              <Link to="/rfq">{t('missions.emptyState.createFirst')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('missions.table.title')}</TableHead>
                <TableHead>{t('missions.table.site')}</TableHead>
                <TableHead>{t('missions.table.status')}</TableHead>
                <TableHead>{t('missions.table.createdAt')}</TableHead>
                <TableHead className="w-32">{t('missions.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMissions.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell className="font-medium">{mission.title}</TableCell>
                  <TableCell>
                    {mission.site ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {mission.site}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(mission.status)}>
                      {t(`missions.status.${mission.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/missions/${mission.id}`}>
                          {t('missions.viewDetails')}
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modale désactivée temporairement */}
      {/* <MissionCreateModal open={createModalOpen} onOpenChange={setCreateModalOpen} /> */}
    </div>
  );
};

export default Missions;
