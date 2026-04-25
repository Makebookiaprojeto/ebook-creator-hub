import { useState } from "react";
import { BookOpen, Check, Download, ExternalLink, Eye, Globe, Link2, Loader2, Lock, Tag, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEbooks, type Ebook, type Chapter } from "@/hooks/useEbooks";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { EbookPreview } from "@/components/EbookPreview";
import { downloadPdf, generateEbookPdf } from "@/lib/ebookPdf";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

interface Props {
  onCreateNew?: () => void;
}

export function LibraryView({ onCreateNew }: Props) {
  const { ebooks, loading, deleteEbook, getEbookWithChapters, refresh } = useEbooks();
  const [openEbook, setOpenEbook] = useState<Ebook | null>(null);
  const [openChapters, setOpenChapters] = useState<Chapter[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Ebook | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);

  const formatPriceBR = (cents?: number | null) =>
    !cents || cents <= 0 ? "" : (cents / 100).toFixed(2).replace(".", ",");

  const savePrice = async (eb: Ebook) => {
    const raw = priceDrafts[eb.id] ?? formatPriceBR(eb.price_cents);
    const normalized = raw.replace(/\./g, "").replace(",", ".").trim();
    const value = Number(normalized);
    if (!normalized || isNaN(value) || value < 0.5) {
      toast.error("Defina um preço válido (mínimo R$ 0,50).");
      return;
    }
    const cents = Math.round(value * 100);
    setSavingPriceId(eb.id);
    try {
      const { error } = await supabase
        .from("ebooks")
        .update({ price_cents: cents })
        .eq("id", eb.id);
      if (error) throw error;
      toast.success("Preço atualizado!");
      setPriceDrafts((p) => {
        const n = { ...p };
        delete n[eb.id];
        return n;
      });
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar o preço.");
    } finally {
      setSavingPriceId(null);
    }
  };

  const togglePublic = async (eb: Ebook) => {
    setTogglingId(eb.id);
    try {
      const { error } = await supabase
        .from("ebooks")
        .update({ is_public: !eb.is_public })
        .eq("id", eb.id);
      if (error) throw error;
      toast.success(!eb.is_public ? "Página publicada!" : "Página despublicada.");
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível atualizar.");
    } finally {
      setTogglingId(null);
    }
  };

  const copyPublicLink = (eb: Ebook) => {
    if (!eb.slug) return;
    const url = `${window.location.origin}/e/${eb.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handlePreview = async (eb: Ebook) => {
    setOpenEbook(eb);
    setLoadingPreview(true);
    try {
      const { chapters } = await getEbookWithChapters(eb.id);
      setOpenChapters(chapters);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar o eBook.");
      setOpenEbook(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async (eb: Ebook) => {
    setDownloadingId(eb.id);
    try {
      const { chapters } = await getEbookWithChapters(eb.id);
      const blob = await generateEbookPdf({
        title: eb.title,
        subtitle: eb.subtitle,
        cover_url: eb.cover_url,
        chapters: chapters.map((c) => ({
          title: c.title,
          content: c.content ?? "",
          image_url: c.image_url,
        })),
      });
      downloadPdf(blob, eb.title);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteEbook(confirmDelete.id);
      toast.success("eBook deletado.");
    } catch {
      toast.error("Erro ao deletar.");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Biblioteca</h1>
          <p className="mt-1 text-muted-foreground">
            Todos os seus eBooks gerados — visualize, baixe ou delete.
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4" /> Criar novo
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : ebooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/40 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 font-display text-lg font-semibold">Nenhum eBook ainda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie seu primeiro eBook para vê-lo aqui.
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="mt-5 gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4" /> Criar eBook
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ebooks.map((eb) => (
            <div
              key={eb.id}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:shadow-glow"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/30 to-primary/70">
                {eb.cover_url ? (
                  <img
                    src={eb.cover_url}
                    alt={eb.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-primary-foreground/40" />
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className="absolute right-2 top-2 backdrop-blur-md bg-background/70"
                >
                  {statusLabel[eb.status] ?? eb.status}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 font-display font-bold leading-tight">{eb.title}</h3>
                {eb.subtitle && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{eb.subtitle}</p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(eb.created_at).toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-3 flex gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handlePreview(eb)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gradient-primary text-primary-foreground"
                    onClick={() => handleDownload(eb)}
                    disabled={downloadingId === eb.id}
                  >
                    {downloadingId === eb.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(eb)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Price editor */}
                <div className="mt-3">
                  <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <Tag className="h-3 w-3" /> Preço de venda
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground">
                        R$
                      </span>
                      <Input
                        inputMode="decimal"
                        placeholder="0,00"
                        value={priceDrafts[eb.id] ?? formatPriceBR(eb.price_cents)}
                        onChange={(e) =>
                          setPriceDrafts((p) => ({ ...p, [eb.id]: e.target.value }))
                        }
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2"
                      onClick={() => savePrice(eb)}
                      disabled={savingPriceId === eb.id}
                      title="Salvar preço"
                    >
                      {savingPriceId === eb.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  {(!eb.price_cents || eb.price_cents < 50) && (
                    <p className="mt-1 text-[10px] text-amber-500">
                      Defina um preço para habilitar a venda.
                    </p>
                  )}
                </div>

                {/* Public page controls */}
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-1.5">
                    <Button
                      size="sm"
                      variant={eb.is_public ? "default" : "ghost"}
                      className={`h-7 flex-1 text-[11px] ${eb.is_public ? "bg-success hover:bg-success/90" : ""}`}
                      onClick={() => togglePublic(eb)}
                      disabled={togglingId === eb.id}
                    >
                      {togglingId === eb.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : eb.is_public ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {eb.is_public ? "Público" : "Publicar página"}
                    </Button>
                    {eb.is_public && eb.slug && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => copyPublicLink(eb)}
                        title="Copiar link"
                      >
                        <Link2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {eb.is_public && eb.slug ? (
                    <a
                      href={`/e/${eb.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-accent px-3 text-xs font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Ver na web
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!eb.is_public) {
                          toast.info("Publique a página primeiro para vê-la na web.", {
                            description: 'Clique em "Publicar página" acima.',
                          });
                        } else {
                          toast.error("Link ainda não disponível. Tente novamente em instantes.");
                        }
                      }}
                      className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/20 px-3 text-xs font-medium text-muted-foreground transition hover:bg-muted/40"
                    >
                      <Lock className="h-3.5 w-3.5" /> Ver na web
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview dialog */}
      <Dialog open={!!openEbook} onOpenChange={(o) => !o && setOpenEbook(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{openEbook?.title}</DialogTitle>
          </DialogHeader>
          {loadingPreview ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : openEbook ? (
            <EbookPreview
              title={openEbook.title}
              subtitle={openEbook.subtitle ?? undefined}
              coverUrl={openEbook.cover_url}
              chapters={openChapters.map((c) => ({
                title: c.title,
                content: c.content ?? "",
                image_url: c.image_url,
              }))}
            />
          ) : null}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenEbook(null)}>
              Fechar
            </Button>
            {openEbook && (
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => handleDownload(openEbook)}
                disabled={downloadingId === openEbook.id}
              >
                {downloadingId === openEbook.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Baixar PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar eBook?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente "{confirmDelete?.title}" e todos os seus capítulos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
