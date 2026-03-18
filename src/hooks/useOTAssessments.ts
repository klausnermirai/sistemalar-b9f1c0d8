import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OTAssessment {
  id: string;
  resident_id: string;
  date: string;
  functional_independence_level: string | null;
  adl_evaluation: string | null;
  cognitive_motor_screening: string | null;
  leisure_interests: string | null;
  environmental_adaptation_needs: string | null;
  pia_ot_goals: string | null;
  initial_ot_synthesis: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useOTAssessment(residentId: string | undefined) {
  return useQuery({
    queryKey: ["ot_assessments", residentId],
    queryFn: async () => {
      if (!residentId) return null;
      const { data, error } = await supabase
        .from("ot_assessments" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as OTAssessment | null;
    },
    enabled: !!residentId,
  });
}

export function useUpsertOTAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<OTAssessment> & { resident_id: string }) => {
      if (data.id) {
        const { id, created_at, updated_at, ...rest } = data as any;
        const { error } = await supabase.from("ot_assessments" as any).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id, created_at, updated_at, ...rest } = data as any;
        const { error } = await supabase.from("ot_assessments" as any).insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ot_assessments"] }),
  });
}
