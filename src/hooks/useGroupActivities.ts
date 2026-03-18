import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";

export interface GroupActivity {
  id: string;
  organization_id: string;
  date: string;
  time_start: string | null;
  time_end: string | null;
  competency: string | null;
  activity_title: string | null;
  activity_description: string | null;
  objectives: string | null;
  observations: string | null;
  mural_notes: string | null;
  signature: string | null;
  created_by: string | null;
  created_at: string;
}

export interface GroupActivityParticipant {
  id: string;
  group_activity_id: string;
  resident_id: string;
  participated: boolean;
  observation: string | null;
}

export function useGroupActivities() {
  const { organization } = useOrganization();
  return useQuery({
    queryKey: ["group_activities", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from("group_activities" as any)
        .select("*")
        .eq("organization_id", organization.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as GroupActivity[];
    },
    enabled: !!organization?.id,
  });
}

export function useGroupActivityParticipants(activityId: string | undefined) {
  return useQuery({
    queryKey: ["group_activity_participants", activityId],
    queryFn: async () => {
      if (!activityId) return [];
      const { data, error } = await supabase
        .from("group_activity_participants" as any)
        .select("*")
        .eq("group_activity_id", activityId);
      if (error) throw error;
      return (data || []) as unknown as GroupActivityParticipant[];
    },
    enabled: !!activityId,
  });
}

export function useCreateGroupActivity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      activity: Omit<GroupActivity, "id" | "created_at" | "created_by" | "organization_id">;
      participantIds: string[];
    }) => {
      const { data: inserted, error } = await supabase
        .from("group_activities" as any)
        .insert({
          ...data.activity,
          organization_id: organization?.id,
          created_by: user?.id,
        })
        .select("id")
        .single();
      if (error) throw error;

      const activityId = (inserted as any).id;
      if (data.participantIds.length > 0) {
        const participants = data.participantIds.map((rid) => ({
          group_activity_id: activityId,
          resident_id: rid,
          participated: true,
        }));
        const { error: pError } = await supabase
          .from("group_activity_participants" as any)
          .insert(participants);
        if (pError) throw pError;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group_activities"] });
      qc.invalidateQueries({ queryKey: ["group_activity_participants"] });
    },
  });
}
