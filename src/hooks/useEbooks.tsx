import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";

export type Ebook = Tables<"ebooks">;
export type Chapter = Tables<"chapters">;

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
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setEbooks(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  const createEbookWithChapters = async (
    ebook: { title: string; description?: string; category?: string; status?: "draft" | "published" | "archived" },
    chapters: { title: string; content: string }[]
  ) => {
    if (!user) throw new Error("Não autenticado");

    const { data: newEbook, error: ebookError } = await supabase
      .from("ebooks")
      .insert({
        user_id: user.id,
        title: ebook.title,
        description: ebook.description,
        category: ebook.category,
        status: ebook.status ?? "draft",
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
        order_index: i,
      }));
      const { error: chErr } = await supabase.from("chapters").insert(rows);
      if (chErr) throw chErr;
    }

    await fetchEbooks();
    return newEbook;
  };

  const deleteEbook = async (id: string) => {
    const { error } = await supabase.from("ebooks").delete().eq("id", id);
    if (error) throw error;
    await fetchEbooks();
  };

  return { ebooks, loading, createEbookWithChapters, deleteEbook, refresh: fetchEbooks };
}
