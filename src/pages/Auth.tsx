import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72);

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!authLoading && user) navigate("/app", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const emailParsed = emailSchema.safeParse(email);
      if (!emailParsed.success) {
        toast.error(emailParsed.error.issues[0].message);
        return;
      }

      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(emailParsed.data, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Enviamos um link de recuperação para seu email.");
        setResetMode(false);
        return;
      }

      const passParsed = passwordSchema.safeParse(password);
      if (!passParsed.success) {
        toast.error(passParsed.error.issues[0].message);
        return;
      }

      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email: emailParsed.data,
          password: passParsed.data,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está cadastrado. Faça login.");
            setTab("login");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Cadastro realizado! Verifique seu email para confirmar a conta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParsed.data,
          password: passParsed.data,
        });
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("Email ou senha incorretos.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Confirme seu email antes de entrar.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Bem-vindo de volta!");
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">EbookAI Builder</span>
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          {resetMode ? (
            <>
              <h1 className="font-display text-2xl font-bold">Recuperar senha</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar link
                </Button>
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="text-xs text-muted-foreground hover:text-foreground w-full"
                >
                  Voltar para o login
                </button>
              </form>
            </>
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {tab === "login" && (
                      <button
                        type="button"
                        onClick={() => setResetMode(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                    minLength={6}
                    className="mt-1.5"
                  />
                  {tab === "signup" && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">Mínimo de 6 caracteres.</p>
                  )}
                </div>

                <TabsContent value="login" className="m-0">
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </TabsContent>
                <TabsContent value="signup" className="m-0">
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar minha conta
                  </Button>
                  <p className="mt-3 text-[11px] text-muted-foreground text-center">
                    Você receberá um email para confirmar sua conta.
                  </p>
                </TabsContent>
              </form>
            </Tabs>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Voltar para o início</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
