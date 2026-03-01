import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PIA {
  id: string;
  resident_id: string;
  status: string;
  team_synthesis: string | null;
  interventions_psychology: string | null;
  interventions_nutrition: string | null;
  interventions_other: string | null;
  created_at: string;
  updated_at: string;
}

export interface PIAGoal {
  id: string;
  pia_id: string;
  competency: string;
  goal_text: string | null;
  status: string;
  review_deadline: string | null;
  observations: string | null;
  created_at: string;
}

export interface PIARevision {
  id: string;
  pia_id: string;
  date: string;
  revised_by: string | null;
  changes_description: string | null;
  created_by: string | null;
  created_at: string;
}

export function usePIA(residentId: string | undefined) {
  return useQuery({
    queryKey: ["pia", residentId],
    queryFn: async () => {
      if (!residentId) return null;
      const { data, error } = await supabase
        .from("pia" as any).select("*")
        .eq("resident_id", residentId)
        .order("created_at", { ascending: false })
        .limit(1).maybeSingle();
      if (error) throw error;
      return data as unknown as PIA | null;
    },
    enabled: !!residentId,
  });
}

export function usePIAGoals(piaId: string | undefined) {
  return useQuery({
    queryKey: ["pia_goals", piaId],
    queryFn: async () => {
      if (!piaId) return [];
      const { data, error } = await supabase
        .from("pia_goals" as any).select("*")
        .eq("pia_id", piaId).order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as PIAGoal[];
    },
    enabled: !!piaId,
  });
}

export function usePIARevisions(piaId: string | undefined) {
  return useQuery({
    queryKey: ["pia_revisions", piaId],
    queryFn: async () => {
      if (!piaId) return [];
      const { data, error } = await supabase
        .from("pia_revisions" as any).select("*")
        .eq("pia_id", piaId).order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PIARevision[];
    },
    enabled: !!piaId,
  });
}

export function useCreatePIA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (residentId: string) => {
      const { data, error } = await supabase.from("pia" as any)
        .insert({ resident_id: residentId }).select().single();
      if (error) throw error;
      return data as unknown as PIA;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pia"] }),
  });
}

export function useUpdatePIA() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<PIA> & { id: string }) => {
      const { error } = await supabase.from("pia" as any).update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pia"] }),
  });
}

export function useCreatePIAGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<PIAGoal, "id" | "created_at">) => {
      const { error } = await supabase.from("pia_goals" as any).insert(data);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pia_goals"] }),
  });
}

export function useUpdatePIAGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<PIAGoal> & { id: string }) => {
      const { error } = await supabase.from("pia_goals" as any).update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pia_goals"] }),
  });
}

export function useDeletePIAGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pia_goals" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pia_goals"] }),
  });
}

export function useCreatePIARevision() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { pia_id: string; revised_by: string; changes_description: string }) => {
      const { error } = await supabase.from("pia_revisions" as any).insert({
        ...data, created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pia_revisions"] }),
  });
}
