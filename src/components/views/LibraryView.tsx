import { useEffect, useState } from "react";
import { BookOpen, Check, Download, ExternalLink, Eye, Globe, Loader2, Lock, Tag, Trash2, Plus, Settings, Copy, Link2, Webhook } from "lucide-react";
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
import { toast } from "sonner";
import { generateEbookPDF } from "@/lib/pdf-generator";

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Ebook | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [savingCheckoutId, setSavingCheckoutId] = useState<string | null>(null);
  const [checkoutUrlDrafts, setCheckoutUrlDrafts] = useState<Record<string, string>>({});
  const [productIdDrafts, setProductIdDrafts] = useState<Record<string, string>>({});

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  

  const copyPublicLink = (eb: Ebook) => {
    if (!eb.slug) return;
    const url = `${window.location.origin}/e/${eb.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link da página de vendas copiado!");
  };

  const copyCheckoutLinkWithParams = (eb: Ebook) => {
    const checkoutUrl = (eb as any).cakto_checkout_url || (eb as any).checkout_url;
    if (!checkoutUrl) {
      toast.error("Configure o link de checkout primeiro.");
      return;
    }
    try {
      const url = new URL(checkoutUrl);
      url.searchParams.set("ebook_id", eb.id);
      url.searchParams.set("seller_user_id", eb.user_id);
      navigator.clipboard.writeText(url.toString());
      toast.success("Link de checkout com parâmetros copiado!");
    } catch (e) {
      navigator.clipboard.writeText(checkoutUrl);
      toast.success("Link de checkout copiado!");
    }
  };

  const saveCaktoSettings = async (eb: Ebook) => {
    const url = (checkoutUrlDrafts[eb.id] ?? (eb as any).cakto_checkout_url ?? "").trim();
    const productId = (productIdDrafts[eb.id] ?? (eb as any).cakto_product_id ?? "").trim();

    if (url && !/^https?:\/\//i.test(url)) {
      toast.error("Use um link de checkout válido (começando com https://).");
      return;
    }

    if (!productId) {
      toast.error("O Product ID da Cakto é obrigatório para processar vendas.");
      return;
    }

    setSavingCheckoutId(eb.id);
    try {
      const { error } = await supabase
        .from("ebooks")
        .update({ 
          cakto_checkout_url: url || null,
          cakto_product_id: productId
        } as any)
        .eq("id", eb.id);
      
      if (error) throw error;
      
      toast.success("Configurações da Cakto salvas!");
      
      setCheckoutUrlDrafts((p) => {
        const n = { ...p };
        delete n[eb.id];
        return n;
      });
      setProductIdDrafts((p) => {
        const n = { ...p };
        delete n[eb.id];
        return n;
      });
      
      await refresh();
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar as configurações.");
    } finally {
      setSavingCheckoutId(null);
    }
  };


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



  const handleDownloadPDF = async (eb: Ebook) => {
    const triggerDownload = async (url: string) => {
      try {
        let blob: Blob;

        // Se for um link do Supabase Storage, tentamos baixar via SDK para evitar problemas de CORS
        if (url.includes("storage/v1/object/public/ebook-files/")) {
          const path = url.split("ebook-files/")[1];
          const { data, error } = await supabase.storage.from("ebook-files").download(path);
          if (error) throw error;
          blob = data;
        } else {
          const response = await fetch(url);
          blob = await response.blob();
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", `${eb.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error("Erro ao processar download:", err);
        window.open(url, "_blank");
      }
    };

    if (eb.pdf_url) {
      setDownloadingId(eb.id);
      await triggerDownload(eb.pdf_url);
      setDownloadingId(null);
      return;
    }

    setDownloadingId(eb.id);
    setIsGeneratingPDF(true);
    
    try {
      toast.info("Preparando seu PDF...");
      
      const { chapters } = await getEbookWithChapters(eb.id);
      
      if (!chapters || chapters.length === 0) {
        throw new Error("O eBook ainda não possui conteúdo para gerar o PDF.");
      }

      const pdfUrl = await generateEbookPDF(
        eb.title,
        eb.subtitle || null,
        chapters,
        eb.id
      );

      if (pdfUrl) {
        await triggerDownload(pdfUrl);
        toast.success("PDF gerado com sucesso!");
        await refresh();
      }
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      toast.error(err.message || "Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setDownloadingId(null);
      setIsGeneratingPDF(false);
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
    <div className="space-y-6 animate-fade-in -mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Biblioteca</h1>
          <p className="mt-1 text-muted-foreground">
            Todos os seus eBooks gerados.
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
                    loading="lazy"
                    decoding="async"
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
                <p className="mt-1 text-xs text-muted-foreground">{eb.chapter_count ?? 0} capítulos</p>

                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(eb.created_at).toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 min-w-[70px]"
                    onClick={() => handlePreview(eb)}
                    title="Ver eBook"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver
                  </Button>


                  {eb.slug && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-9 h-9 p-0 shrink-0"
                      onClick={() => window.open(`/e/${eb.slug}`, "_blank")}
                      title="Abrir página de vendas"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(eb)}
                    className="w-9 h-9 p-0 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Deletar eBook"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Preço de venda */}
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

                 {/* Integração Cakto */}
                 <div className="mt-4 pt-4 border-t space-y-3">
                   <div className="flex items-center gap-2 mb-1">
                     <div className="p-1 rounded bg-primary/10">
                       <Link2 className="h-3.5 w-3.5 text-primary" />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Integração</span>
                   </div>

                   <div>
                     <label className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                       URL de Checkout
                     </label>
                     <Input
                       placeholder="Link do seu Checkout"
                       value={checkoutUrlDrafts[eb.id] ?? (eb as any).cakto_checkout_url ?? ""}
                       onChange={(e) =>
                         setCheckoutUrlDrafts((p) => ({ ...p, [eb.id]: e.target.value }))
                       }
                       className="h-8 text-xs"
                     />
                   </div>

                   <div>
                     <label className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                       ID do Produto
                     </label>
                     <Input
                       placeholder="ID do Produto"
                       value={productIdDrafts[eb.id] ?? (eb as any).cakto_product_id ?? ""}
                       onChange={(e) =>
                         setProductIdDrafts((p) => ({ ...p, [eb.id]: e.target.value }))
                       }
                       className="h-8 text-xs font-mono"
                     />
                   </div>

                   <Button
                     size="sm"
                     className="w-full h-8 text-xs font-semibold"
                     onClick={() => saveCaktoSettings(eb)}
                     disabled={savingCheckoutId === eb.id}
                   >
                     {savingCheckoutId === eb.id ? (
                       <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Salvando...</>
                     ) : (
                       "Salvar Integração"
                     )}
                   </Button>

                   {eb.slug && (
                     <div className="pt-2">
                       <label className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                         <Globe className="h-3 w-3" /> Link da Página de Vendas
                       </label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            readOnly
                            value={`${window.location.origin}/e/${eb.slug}`}
                            className="h-8 text-xs bg-muted/30 select-all"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2 shrink-0"
                            onClick={() => copyPublicLink(eb)}
                            title="Copiar link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                     <div className="pt-2">
                       <label className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase">
                         <Webhook className="h-3 w-3" /> Configure o webhook
                       </label>
                       <div className="flex items-center gap-1.5">
                         <Input
                           readOnly
                           value="https://qbksltxsnpkeaijfihug.supabase.co/functions/v1/webhook-payment"
                           className="h-8 text-[10px] bg-muted/30 select-all font-mono"
                         />
                         <Button
                           size="sm"
                           variant="secondary"
                           className="h-8 px-2 shrink-0"
                           onClick={() => {
                             navigator.clipboard.writeText("https://qbksltxsnpkeaijfihug.supabase.co/functions/v1/webhook-payment");
                             toast.success("URL do webhook copiada!");
                           }}
                           title="Copiar webhook"
                         >
                           <Copy className="h-3.5 w-3.5" />
                         </Button>
                       </div>
                     </div>
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
              pdfUrl={openEbook.pdf_url}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Deletar eBook?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Tem certeza que deseja deletar permanentemente:
              <span className="mt-2 block rounded-lg border bg-muted/50 p-3 font-semibold text-foreground">
                "{confirmDelete?.title}"
              </span>
              <span className="mt-3 block text-xs">
                Esta ação não pode ser desfeita. Todos os capítulos vinculados também serão removidos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel className="mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Confirmar exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
