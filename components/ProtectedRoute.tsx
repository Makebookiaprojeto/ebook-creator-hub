import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Se true, não exige assinatura ativa (usado na própria página /planos). */
  allowWithoutSubscription?: boolean;
}

export function ProtectedRoute({ children, allowWithoutSubscription = false }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { loading: subLoading, isActive } = useSubscription();

  if (authLoading || (user && !allowWithoutSubscription && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Verifica se o e-mail está confirmado (Requisito de segurança do fluxo de autenticação)
  const isEmailConfirmed = !!user.email_confirmed_at;
  if (!isEmailConfirmed && !allowWithoutSubscription) {
    return <Navigate to="/auth" replace state={{ message: "Por favor, confirme seu e-mail para acessar o sistema." }} />;
  }

  if (!allowWithoutSubscription && !isActive) {
    return <Navigate to="/planos" replace />;
  }

  return <>{children}</>;
}
