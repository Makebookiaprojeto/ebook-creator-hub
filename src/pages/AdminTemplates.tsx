import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Sparkles, Trash2, ArrowLeft, Save, X } from "lucide-react";
import { toast } from "sonner";

type Chapter = { title: string; subtitle: string; content: string };
type Template = {
  id: string;
  niche: string;
  audience: string | null;
  title: string;
  subtitle: string | null;
  cover_prompt: string | null;
  chapters: Chapter[];
  tags: string[] | null;
  is_active: boolean;
  use_count: number;
  created_at: string;
};

export default function AdminTemplates() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [draftingNiche, setDraftingNiche] = useState("");
  const [draftingAudience, setDraftingAudience] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
      if (!data) setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) loadTemplates();
  }, [isAdmin]);

  const loadTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ebook_templates" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar templates");
    } else {
      setTemplates((data as any) ?? []);
    }
    setLoading(false);
  };

  const handleGenerateDraft = async () => {
    if (!draftingNiche.trim()) {
      toast.error("Informe o nicho");
      return;
    }
    setGeneratingDraft(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-template-draft", {
        body: { niche: draftingNiche, audience: draftingAudience },
      });
      if (error || (data as any)?.error) {
        toast.error((data as any)?.error || "Falha ao gerar rascunho");
        return;
      }
      const d = data as any;
      setEditing({
        id: "",
        niche: draftingNiche,
        audience: draftingAudience || null,
        title: d.title,
        subtitle: d.subtitle,
        cover_prompt: d.cover_prompt,
        chapters: d.chapters,
        tags: [],
        is_active: true,
        use_count: 0,
        created_at: new Date().toISOString(),
      });
      setDraftingNiche("");
      setDraftingAudience("");
      toast.success("Rascunho gerado! Revise e salve.");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleNewBlank = () => {
    setEditing({
      id: "",
      niche: "",
      audience: null,
      title: "",
      subtitle: "",
      cover_prompt: "",
      chapters: [{ title: "", subtitle: "", content: "" }],
      tags: [],
      is_active: true,
      use_count: 0,
      created_at: new Date().toISOString(),
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.niche.trim() || !editing.title.trim()) {
      toast.error("Nicho e título são obrigatórios");
      return;
    }
    setSaving(true);
    const payload: any = {
      niche: editing.niche.trim(),
      audience: editing.audience?.trim() || null,
      title: editing.title.trim(),
      subtitle: editing.subtitle?.trim() || null,
      cover_prompt: editing.cover_prompt?.trim() || null,
      chapters: editing.chapters,
      tags: editing.tags ?? [],
      is_active: editing.is_active,
      created_by: user?.id,
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("ebook_templates" as any).update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("ebook_templates" as any).insert(payload));
    }
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Template salvo!");
    setEditing(null);
    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este template?")) return;
    const { error } = await supabase.from("ebook_templates" as any).delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Excluído");
      loadTemplates();
    }
  };

  const toggleActive = async (t: Template) => {
    const { error } = await supabase
      .from("ebook_templates" as any)
      .update({ is_active: !t.is_active })
      .eq("id", t.id);
    if (error) toast.error("Erro");
    else loadTemplates();
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground mb-4">Apenas administradores podem acessar esta área.</p>
          <Button onClick={() => navigate("/app")}>Voltar</Button>
        </Card>
      </div>
    );
  }

  // ----- Editor -----
  if (editing) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar template
              </Button>
            </div>
          </div>

          <Card className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">{editing.id ? "Editar template" : "Novo template"}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Nicho *</label>
                <Input
                  value={editing.niche}
                  onChange={(e) => setEditing({ ...editing, niche: e.target.value })}
                  placeholder="ex: marketing digital"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Público sugerido</label>
                <Input
                  value={editing.audience ?? ""}
                  onChange={(e) => setEditing({ ...editing, audience: e.target.value })}
                  placeholder="ex: empreendedores iniciantes"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium">Subtítulo</label>
              <Input
                value={editing.subtitle ?? ""}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Prompt de capa (inglês, sem texto)</label>
              <Textarea
                rows={2}
                value={editing.cover_prompt ?? ""}
                onChange={(e) => setEditing({ ...editing, cover_prompt: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm">Ativo (será usado em entregas)</label>
            </div>
          </Card>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Capítulos ({editing.chapters.length})</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setEditing({
                    ...editing,
                    chapters: [...editing.chapters, { title: "", subtitle: "", content: "" }],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar capítulo
              </Button>
            </div>

            {editing.chapters.map((c, i) => (
              <Card key={i} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Capítulo {i + 1}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        chapters: editing.chapters.filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Título do capítulo"
                  value={c.title}
                  onChange={(e) => {
                    const next = [...editing.chapters];
                    next[i] = { ...c, title: e.target.value };
                    setEditing({ ...editing, chapters: next });
                  }}
                />
                <Input
                  placeholder="Subtítulo"
                  value={c.subtitle}
                  onChange={(e) => {
                    const next = [...editing.chapters];
                    next[i] = { ...c, subtitle: e.target.value };
                    setEditing({ ...editing, chapters: next });
                  }}
                />
                <Textarea
                  placeholder="Conteúdo do capítulo (markdown leve, '## ' para subtítulos)"
                  rows={10}
                  value={c.content}
                  onChange={(e) => {
                    const next = [...editing.chapters];
                    next[i] = { ...c, content: e.target.value };
                    setEditing({ ...editing, chapters: next });
                  }}
                />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----- Lista -----
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={() => navigate("/app")} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao app
            </Button>
            <h1 className="text-3xl font-bold">Catálogo de Templates</h1>
            <p className="text-muted-foreground">
              Ebooks-base servidos aos usuários por nicho. Reduzem o custo de IA.
            </p>
          </div>
        </div>

        <Card className="p-6 mb-6 border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Gerar rascunho com IA</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            A IA cria um template-base completo para você revisar e salvar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              placeholder="Nicho (ex: marketing digital)"
              value={draftingNiche}
              onChange={(e) => setDraftingNiche(e.target.value)}
            />
            <Input
              placeholder="Público sugerido (opcional)"
              value={draftingAudience}
              onChange={(e) => setDraftingAudience(e.target.value)}
            />
            <Button onClick={handleGenerateDraft} disabled={generatingDraft}>
              {generatingDraft ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Gerar rascunho
            </Button>
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={handleNewBlank}>
              <Plus className="h-4 w-4 mr-2" /> Criar em branco
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            Nenhum template ainda. Gere o primeiro acima.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <Card key={t.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {t.niche}
                    </Badge>
                    <h3 className="font-semibold">{t.title}</h3>
                    {t.subtitle && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{t.subtitle}</p>
                    )}
                  </div>
                  <Badge variant={t.is_active ? "default" : "secondary"}>
                    {t.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {t.chapters?.length ?? 0} capítulos · usado {t.use_count}x
                  {t.audience && ` · público: ${t.audience}`}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => setEditing(t)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(t)}>
                    {t.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
