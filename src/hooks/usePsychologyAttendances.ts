import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PsychologyAttendance {
  id: string;
  resident_id: string;
  date_time: string;
  intervention_type: string | null;
  attendance_evolution: string | null;
  mural_notes: string | null;
  private_notes: string | null;
  needs_team_report: boolean;
  signature: string | null;
  created_by: string | null;
  created_at: string;
}

export function usePsychologyAttendances(residentId: string | undefined) {
  return useQuery({
    queryKey: ["psychology_attendances", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("psychology_attendances" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date_time", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PsychologyAttendance[];
    },
    enabled: !!residentId,
  });
}

export function useCreatePsychologyAttendance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<PsychologyAttendance, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("psychology_attendances" as any).insert({
        ...data,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["psychology_attendances"] }),
  });
}
