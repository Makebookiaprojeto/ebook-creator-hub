import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubscriptionStatus = {
  loading: boolean;
  isActive: boolean;
  planType: "monthly" | "lifetime" | null;
  expiresAt: Date | null;
};

export function useSubscription(): SubscriptionStatus {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<SubscriptionStatus>({
    loading: true,
    isActive: false,
    planType: null,
    expiresAt: null,
  });

  useEffect(() => {
    let cancelled = false;

    if (authLoading) return;
    
    if (!user) {
      setState({ loading: false, isActive: false, planType: null, expiresAt: null });
      return;
    }

    const checkSubscription = async () => {
      try {
        console.log("Checking subscription for:", user.email);
        
        // 1. Usar a View consolidada para checar acesso
        const { data: accessData, error: accessError } = await supabase
          .from("user_access_status")
          .select("has_active_access, current_plan")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (accessError) {
          console.error("Error fetching access status:", accessError);
          // Fallback para não assinante em caso de erro
          setState({ loading: false, isActive: false, planType: null, expiresAt: null });
          return;
        }

        if (accessData) {
          setState({ 
            loading: false, 
            isActive: accessData.has_active_access, 
            planType: accessData.current_plan as any, 
            expiresAt: null // A view não traz data, mas o isActive já considera a validade
          });
          return;
        }

        setState({ loading: false, isActive: false, planType: null, expiresAt: null });

      } catch (err) {
        console.error("Erro useSubscription:", err);
        if (!cancelled) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    checkSubscription();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return state;
}
