import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import saasLogo from "@/assets/saas-logo.jpg";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72);
const usernameSchema = z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(50, "Nome muito longo");

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message);
      // Limpa o estado para não repetir o toast
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const timer = setTimeout(() => {
        navigate("/app", { replace: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (tab === "signup" && email.trim() !== "" && emailSchema.safeParse(email).success) {
        setIsValidatingEmail(true);
        try {
          const { data, error } = await supabase.rpc('check_email_exists', { 
            email_to_check: email.trim().toLowerCase() 
          });
          
          if (error) throw error;
          
          if (data === true) {
            setEmailError("Este e-mail já está sendo usado por outra conta.");
          } else {
            setEmailError("");
          }
        } catch (err) {
          console.error("Erro ao validar email:", err);
        } finally {
          setIsValidatingEmail(false);
        }
      } else {
        setEmailError("");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email, tab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (tab === "signup" && emailError) {
        toast.error(emailError);
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
          const msg = error.message?.toLowerCase() ?? "";
          const isPwned =
            msg.includes("pwned") ||
            msg.includes("compromised") ||
            msg.includes("data breach") ||
            msg.includes("has been found in a data breach") ||
            (error.status === 422 && msg.includes("password"));

          if (isPwned) {
            toast.error("Insira uma senha mais segura");
          } else if (error.message.toLowerCase().includes("already registered") || (error.status === 422 && !msg.includes("password")) || error.status === 400) {
            toast.error("Este e-mail já possui uma conta vinculada. Por favor, faça login.");
            setTab("login");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Cadastro solicitado! Verifique sua caixa de entrada para confirmar o e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParsed.data,
          password: passParsed.data,
        });

        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error("E-mail ou senha incorretos.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Sua conta ainda não foi confirmada. Verifique seu e-mail.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Bem-vindo de volta!");
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Ocorreu um erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-glow">
            <img src={saasLogo} alt="EbookAI Builder" className="h-full w-full object-cover" />
          </div>
          <span className="font-display text-xl font-bold">EbookAI Builder</span>
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-xl">
          {resetMode ? (
            <>
              <h1 className="font-display text-2xl font-bold">Recuperar senha</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Digite seu e-mail e enviaremos um link de recuperação.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="reset-email">E-mail</Label>
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
              <TabsList className="grid w-full grid-cols-2 gap-3 h-auto bg-transparent p-0">
                <TabsTrigger
                  value="login"
                  className="group relative h-11 rounded-xl text-base font-semibold tracking-wide border border-primary/40 bg-background text-primary overflow-hidden transition-all duration-300 hover:border-primary/70 hover:bg-primary/5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)] data-[state=active]:scale-[1.02]"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="group relative h-11 rounded-xl text-base font-semibold tracking-wide border border-primary/40 bg-background text-primary overflow-hidden transition-all duration-300 hover:border-primary/70 hover:bg-primary/5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)] data-[state=active]:scale-[1.02]"
                >
                  Criar conta
                </TabsTrigger>
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
                      placeholder="Como quer ser chamado"
                      required
                      autoComplete="off"
                      className="mt-1.5"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email" className="flex items-center justify-between">
                    E-mail
                    {isValidatingEmail && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="off"
                    className={`mt-1.5 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {tab === "signup" && emailError && (
                    <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                      {emailError}
                    </p>
                  )}
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
                  <Button type="submit" disabled={submitting || !!emailError} className="w-full">
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar minha conta
                  </Button>
                  <p className="mt-3 text-[11px] text-muted-foreground text-center">
                    Enviaremos um e-mail de confirmação para você.
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
