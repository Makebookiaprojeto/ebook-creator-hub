import { Bell, ShoppingCart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotif = payload.new;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
          
          if (newNotif.type === "sale" || newNotif.type === "pending_sale") {
            playSaleSound();
            
            // Obter o valor da venda mais recente para este vendedor
            const { data: purchaseData } = await supabase
              .from("purchases")
              .select("amount_paid_cents")
              .eq("seller_user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1);

            let displayAmount = "";
            if (purchaseData && purchaseData[0]) {
              const amount = purchaseData[0].amount_paid_cents / 100;
              displayAmount = amount.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              });
            }

            toast.success("VENDA REALIZADA !!!", {
              description: displayAmount,
              duration: 5000,
              position: "top-right",
              icon: <ShoppingCart className="h-4 w-4 text-green-500" />,
            });
          }
        }
      )
      .subscribe();

    // User interaction listener to "unlock" audio (browser policy)
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
        }).catch(() => {});
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [user]);

  const playSaleSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.4; // Volume ajustado para um nível confortável
      audioRef.current.play().catch(err => {
        console.warn("Som de venda bloqueado pelo navegador. Interaja com a página primeiro.", err);
      });
    }
  };

  const markAsRead = async () => {
    if (unreadCount === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user?.id)
      .eq("read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <audio 
        ref={audioRef} 
        src="/sounds/sale.mp3" 
        preload="auto"
      />
      <DropdownMenu onOpenChange={(open) => open && markAsRead()}>
        <DropdownMenuTrigger asChild>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition-all hover:bg-muted active:scale-95">
            <Bell className="h-4.5 w-4.5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary p-0.5 text-[10px] font-bold text-primary-foreground animate-in zoom-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2">
          <DropdownMenuLabel className="px-2 py-1.5">Notificações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-default rounded-lg focus:bg-muted">
                  <div className="flex w-full items-center justify-between">
                    <span className={`text-sm font-semibold ${!notif.read ? "text-primary" : "text-foreground"}`}>
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notif.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
