import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface OTAttendance {
  id: string;
  resident_id: string;
  date_time: string;
  activity_type: string | null;
  attendance_notes: string | null;
  mural_notes: string | null;
  signature: string | null;
  created_by: string | null;
  created_at: string;
}

export function useOTAttendances(residentId: string | undefined) {
  return useQuery({
    queryKey: ["ot_attendances", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("ot_attendances" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date_time", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OTAttendance[];
    },
    enabled: !!residentId,
  });
}

export function useCreateOTAttendance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<OTAttendance, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("ot_attendances" as any).insert({
        ...data,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ot_attendances"] }),
  });
}
