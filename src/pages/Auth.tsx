import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72);
const usernameSchema = z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(50, "Nome muito longo");

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Mock de e-mails já existentes para validação local
  const existingEmails = ["teste@teste.com", "contato@ebookaibuilder.com", "admin@admin.com"];

  useEffect(() => {
    if (tab === "signup" && email && existingEmails.includes(email.toLowerCase())) {
      setEmailError("Este e-mail já está em uso.");
    } else {
      setEmailError("");
    }
  }, [email, tab]);

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
      if (tab === "signup" && emailError) {
        toast.error(emailError);
        setSubmitting(false);
        return;
      }

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
        const usernameParsed = usernameSchema.safeParse(username);
        if (!usernameParsed.success) {
          toast.error(usernameParsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: emailParsed.data,
          password: passParsed.data,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { username: usernameParsed.data },
          },
        });
        if (error) {
          if (error.message.includes("already registered") || error.status === 400 || error.status === 422) {
            toast.error("Este email já está cadastrado em nossa base.");
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

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao entrar com Google");
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

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
                {tab === "signup" && (
                  <div>
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Seu nome"
                      required
                      autoComplete="off"
                      className="mt-1.5"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="off"
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
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                )}
                Google
              </Button>
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
