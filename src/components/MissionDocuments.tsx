import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface MissionDocument {
  id: string;
  mission_id: string;
  filename: string;
  file_path: string;
  kind: string;
  version: number;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
  created_at: string;
}

interface MissionDocumentsProps {
  missionId: string;
}

const MissionDocuments = ({ missionId }: MissionDocumentsProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<MissionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<string>("other");

  const kindOptions = [
    { value: "sla", label: t("missions.docs.kinds.sla") },
    { value: "hse", label: t("missions.docs.kinds.hse") },
    { value: "contract", label: t("missions.docs.kinds.contract") },
    { value: "other", label: t("missions.docs.kinds.other") }
  ];

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("mission_docs")
        .select("*")
        .eq("mission_id", missionId)
        .order("kind", { ascending: true })
        .order("version", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const filePath = `missions/${missionId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("docs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get next version for this kind
      const { data: existingDocs } = await supabase
        .from("mission_docs")
        .select("version")
        .eq("mission_id", missionId)
        .eq("kind", kind)
        .order("version", { ascending: false })
        .limit(1);

      const nextVersion = (existingDocs?.[0]?.version || 0) + 1;

      // Get current user tenant_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id!)
        .single();

      // Insert record
      const { error: insertError } = await supabase
        .from("mission_docs")
        .insert({
          mission_id: missionId,
          tenant_id: profile?.tenant_id!,
          filename: file.name,
          file_path: filePath,
          kind,
          version: nextVersion,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id!
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: `Document téléversé (v${nextVersion})`
      });

      setFile(null);
      setKind("other");
      await loadDocuments();

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de téléverser le fichier",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: MissionDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from("docs")
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (doc: MissionDocument) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("docs")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("mission_docs")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Document supprimé"
      });

      await loadDocuments();

    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [missionId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t("missions.docs.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="file">{t("missions.docs.upload")}</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
              aria-label="Sélectionner un fichier"
            />
          </div>
          <div>
            <Label htmlFor="kind">{t("missions.docs.kind")}</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger id="kind" aria-label="Type de document">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kindOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              aria-label="Téléverser le document"
            >
              {uploading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {t("missions.docs.upload")}
            </Button>
          </div>
        </div>

        {/* Documents Table */}
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("missions.docs.empty")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("missions.docs.kind")}</TableHead>
                <TableHead>Fichier</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Taille</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {kindOptions.find(k => k.value === doc.kind)?.label || doc.kind}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{doc.filename}</TableCell>
                  <TableCell>v{doc.version}</TableCell>
                  <TableCell>
                    {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        aria-label={`${t("missions.docs.download")} ${doc.filename}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`${t("missions.docs.delete")} ${doc.filename}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{doc.filename}" ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(doc)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {t("missions.docs.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionDocuments;