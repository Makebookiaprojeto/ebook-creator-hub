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
        const email = user.email?.toLowerCase() ?? "";

        // 1. Verificar Admin
        const { data: isAdminData } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        
        if (cancelled) return;
        
        if (isAdminData === true) {
          setState({ loading: false, isActive: true, planType: "lifetime", expiresAt: null });
          return;
        }

        // 2. Buscar assinatura (user_id ou email)
        const { data, error } = await supabase
          .from("subscriptions")
          .select("plan_type, status, expires_at")
          .or(`user_id.eq.${user.id},buyer_email.eq.${email}`)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data) {
          setState({ loading: false, isActive: false, planType: null, expiresAt: null });
          return;
        }

        const planType = data.plan_type as "monthly" | "lifetime";
        const expiresAt = data.expires_at ? new Date(data.expires_at) : null;

        const isActive =
          planType === "lifetime" ||
          (planType === "monthly" && !!expiresAt && expiresAt.getTime() > Date.now());

        setState({ loading: false, isActive, planType, expiresAt });
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
