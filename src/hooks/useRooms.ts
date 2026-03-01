import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Room {
  id: string;
  organization_id: string;
  identifier: string;
  type: string;
  beds: number;
  observations: string | null;
  created_at: string;
}

export function useRooms() {
  const { userOrgId } = useAuth();

  return useQuery({
    queryKey: ["rooms", userOrgId],
    queryFn: async () => {
      if (!userOrgId) return [];
      const { data, error } = await supabase
        .from("rooms" as any)
        .select("*")
        .eq("organization_id", userOrgId)
        .order("identifier");
      if (error) throw error;
      return (data as unknown) as Room[];
    },
    enabled: !!userOrgId,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  const { userOrgId } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<Room, "id" | "organization_id" | "created_at">) => {
      if (!userOrgId) throw new Error("Não autenticado");
      const { error } = await supabase.from("rooms" as any).insert({ ...data, organization_id: userOrgId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Room> & { id: string }) => {
      const { error } = await supabase.from("rooms" as any).update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}
