import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useRealtimeAlertas() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("alertas-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alertas",
          filter: `advogado_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["alertas"] });
          queryClient.invalidateQueries({ queryKey: ["alertas-unread-count"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
