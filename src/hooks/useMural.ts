import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export interface MuralMessage {
  id: string;
  organization_id: string;
  author_id: string | null;
  author_name: string | null;
  content: string;
  source_type: string | null;
  source_resident_name: string | null;
  created_at: string;
}

export function useMuralMessages(orgId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!orgId) return;
    const channel = supabase.channel("mural_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mural_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["mural_messages", orgId] });
        qc.invalidateQueries({ queryKey: ["mural_unread", orgId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, qc]);

  return useQuery({
    queryKey: ["mural_messages", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("mural_messages" as any).select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as MuralMessage[];
    },
    enabled: !!orgId,
  });
}

export function useMuralUnreadCount(orgId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mural_unread", orgId],
    queryFn: async () => {
      if (!orgId || !user) return 0;
      // Get last read
      const { data: readData } = await supabase
        .from("mural_reads" as any).select("last_read_at")
        .eq("user_id", user.id).eq("organization_id", orgId).maybeSingle();
      const lastRead = (readData as any)?.last_read_at || "1970-01-01T00:00:00Z";
      // Count messages after last read
      const { count, error } = await supabase
        .from("mural_messages" as any).select("*", { count: "exact", head: true })
        .eq("organization_id", orgId).gt("created_at", lastRead);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!orgId && !!user,
    refetchInterval: 30000,
  });
}

export function useMarkMuralRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (orgId: string) => {
      if (!user) return;
      const { data: existing } = await supabase
        .from("mural_reads" as any).select("id")
        .eq("user_id", user.id).eq("organization_id", orgId).maybeSingle();
      if ((existing as any)?.id) {
        await supabase.from("mural_reads" as any).update({ last_read_at: new Date().toISOString() }).eq("id", (existing as any).id);
      } else {
        await supabase.from("mural_reads" as any).insert({ user_id: user.id, organization_id: orgId, last_read_at: new Date().toISOString() });
      }
    },
    onSuccess: (_, orgId) => qc.invalidateQueries({ queryKey: ["mural_unread", orgId] }),
  });
}

export function useSendMuralMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { organization_id: string; author_id: string; author_name: string; content: string }) => {
      const { error } = await supabase.from("mural_messages" as any).insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mural_messages"] }),
  });
}
