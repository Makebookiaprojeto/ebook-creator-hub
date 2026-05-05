import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";

export type Chapter = {
  title: string;
  content: string;
  image_url?: string | null;
  order_index?: number;
};

export type Ebook = Tables<"ebooks"> & { 
  chapter_count?: number;
  content_json?: Chapter[];
};

export type NewChapter = Chapter;

export type NewEbook = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  niche?: string | null;
  audience?: string | null;
  cover_url?: string | null;
  status?: "draft" | "published" | "archived";
  pdf_url?: string | null;
};

export function useEbooks() {
  const { user } = useAuth();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEbooks = useCallback(async () => {
    if (!user) {
      setEbooks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("ebooks")
      .select(`
        *,
        chapters(id)
      `)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      const formatted = (data as any[]).map(eb => ({
        ...eb,
        chapter_count: eb.chapters?.length ?? 0
      }));
      setEbooks(formatted);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  const createEbookWithChapters = async (ebook: NewEbook, chapters: NewChapter[]) => {
    if (!user) throw new Error("Não autenticado");

    const { data: newEbook, error: ebookError } = await supabase
      .from("ebooks")
      .insert({
        user_id: user.id,
        title: ebook.title,
        subtitle: ebook.subtitle ?? null,
        description: ebook.description ?? null,
        category: ebook.category ?? ebook.niche ?? null,
        niche: ebook.niche ?? null,
        audience: ebook.audience ?? null,
        cover_url: ebook.cover_url ?? null,
        status: ebook.status ?? "draft",
        pdf_url: ebook.pdf_url ?? null,
      })
      .select()
      .single();

    if (ebookError || !newEbook) throw ebookError ?? new Error("Falha ao criar ebook");

    if (chapters.length > 0) {
      const rows = chapters.map((c, i) => ({
        ebook_id: newEbook.id,
        user_id: user.id,
        title: c.title,
        content: c.content,
        image_url: c.image_url ?? null,
        order_index: i,
      }));
      const { error: chErr } = await supabase.from("chapters").insert(rows);
      if (chErr) throw chErr;
    }

    await fetchEbooks();
    return newEbook;
  };

  const deleteEbook = async (id: string) => {
    try {
      // Deletar dependências que não estão configuradas com CASCADE
      await supabase.from("ebook_sales").delete().eq("ebook_id", id);
      
      const { error } = await supabase.from("ebooks").delete().eq("id", id);
      
      if (error) {
        console.error("Erro ao deletar ebook:", error);
        
        // Fallback: manually delete chapters if the first attempt failed due to foreign key constraints
        // although chapters has CASCADE, it's a good safety measure
        if (error.code === '23503') {
          await supabase.from("chapters").delete().eq("ebook_id", id);
          await supabase.from("ebook_payment_config" as any).delete().eq("ebook_id", id);
          const { error: retryError } = await supabase.from("ebooks").delete().eq("id", id);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error("Erro geral no deleteEbook:", err);
      throw err;
    }
    
    setEbooks((prev) => prev.filter((eb) => eb.id !== id));
  };

  const getEbookWithChapters = async (id: string) => {
    // 1) Pegar o eBook
    const { data: ebook, error: eErr } = await supabase
      .from("ebooks")
      .select("*")
      .eq("id", id)
      .single();
    
    if (eErr || !ebook) throw eErr ?? new Error("Ebook não encontrado");

    // 2) Pegar capítulos via RLS (deve funcionar agora com as novas políticas)
    const { data: chapters, error: cErr } = await supabase
      .from("chapters")
      .select("*")
      .eq("ebook_id", id)
      .order("order_index", { ascending: true });
    
    if (cErr) throw cErr;

    return { ebook, chapters: chapters ?? [] };
  };

  return {
    ebooks,
    loading,
    createEbookWithChapters,
    deleteEbook,
    getEbookWithChapters,
    refresh: fetchEbooks,
  };
}
