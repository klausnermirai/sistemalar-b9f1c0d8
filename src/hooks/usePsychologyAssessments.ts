import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PsychologyAssessment {
  id: string;
  resident_id: string;
  date: string;
  institutionalization_awareness: string | null;
  initial_emotional_reaction: string[] | null;
  recent_griefs_and_losses: string | null;
  traumas_and_emotional_triggers: string | null;
  orientation_level: string | null;
  mood_screening_gds: string | null;
  cognitive_screening_mmse: number | null;
  family_bond_quality: string | null;
  visit_expectations: string | null;
  initial_psychological_synthesis: string | null;
  pia_psychological_goals: string | null;
  created_at: string;
  updated_at: string;
}

export function usePsychologyAssessment(residentId: string | undefined) {
  return useQuery({
    queryKey: ["psychology_assessments", residentId],
    queryFn: async () => {
      if (!residentId) return null;
      const { data, error } = await supabase
        .from("psychology_assessments" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as PsychologyAssessment | null;
    },
    enabled: !!residentId,
  });
}

export function useUpsertPsychologyAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PsychologyAssessment> & { resident_id: string }) => {
      if (data.id) {
        const { id, created_at, updated_at, ...rest } = data as any;
        const { error } = await supabase.from("psychology_assessments" as any).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id, created_at, updated_at, ...rest } = data as any;
        const { error } = await supabase.from("psychology_assessments" as any).insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["psychology_assessments"] }),
  });
}
