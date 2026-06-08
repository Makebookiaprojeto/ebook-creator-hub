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
    console.log("NotificationBell montado para o usuário:", user.id);

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) console.error("Erro ao buscar notificações iniciais:", error);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
        console.log("Notificações iniciais carregadas:", data.length);
      }
    };

    fetchNotifications();

    console.log("Criando canal Realtime...");
    const channel = supabase
      .channel(`db-changes-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("EVENTO RECEBIDO NO FRONTEND:", payload);
          const newNotif = payload.new;
          
          console.log("Comparando user_id - Notificação:", newNotif.user_id, "Usuário Logado:", user.id);
          
          if (newNotif.user_id !== user.id) {
            console.warn("Payload recebido para outro usuário, ignorando.");
            return;
          }
          
          console.log("Atualizando estado React...");
          setNotifications((prev) => {
            const updated = [newNotif, ...prev].slice(0, 10);
            console.log("Estado notifications atualizado. Novo tamanho:", updated.length);
            return updated;
          });
          
          setUnreadCount((prev) => {
            console.log("unreadCount atualizado:", prev + 1);
            return prev + 1;
          });
          
          if (newNotif.type === "sale" || newNotif.type === "pending_sale") {
            console.log("Notificação de venda detectada. Disparando Toast e Som.");
            playSaleSound();
            
            const { data: purchaseData } = await supabase
              .from("purchases")
              .select("amount_paid_cents, ebooks(title)")
              .eq("seller_user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            let displayDescription = "";
            if (purchaseData) {
              const amount = purchaseData.amount_paid_cents / 100;
              const formattedAmount = amount.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              });
              const ebookTitle = (purchaseData.ebooks as any)?.title || "Ebook";
              displayDescription = `${ebookTitle} - ${formattedAmount}`;
            }

            console.log("Disparando toast.success...");
            toast.success("VENDA REALIZADA !!!", {
              description: displayDescription,
              duration: 5000,
              position: "top-right",
              icon: <ShoppingCart className="h-4 w-4 text-green-500" />,
            });
            console.log("Toast disparado com sucesso.");
            window.dispatchEvent(new CustomEvent("refresh-dashboard"));
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
        if (status === 'CHANNEL_ERROR') {
          console.error("ERRO NO CANAL REALTIME: Verifique se a tabela tem Realtime habilitado e se o filtro está correto.");
        }
      });

    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          console.log("Áudio desbloqueado com sucesso.");
        }).catch((err) => console.warn("Falha ao desbloquear áudio:", err));
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    
    return () => {
      console.log("Desmontando NotificationBell, removendo canal.");
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
        src="/sounds/sale.mp3?v=3" 
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
              {notifications.map((notif) => {
                const isPendingSale = notif.title === "Venda pendente";
                return (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 p-3 cursor-default rounded-lg focus:bg-muted">
                    <div className="flex w-full items-center justify-between">
                      <span className={`text-sm font-semibold ${
                        isPendingSale 
                          ? "text-[#22C55E]" 
                          : !notif.read ? "text-primary" : "text-foreground"
                      }`}>
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
