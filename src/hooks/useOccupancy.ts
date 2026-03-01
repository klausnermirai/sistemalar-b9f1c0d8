import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useOccupancy() {
  const { userOrgId } = useAuth();

  return useQuery({
    queryKey: ["occupancy", userOrgId],
    queryFn: async () => {
      if (!userOrgId) return { maleResidents: 0, femaleResidents: 0, maleBeds: 30, femaleBeds: 22, maleAvailable: 30, femaleAvailable: 22 };

      const [orgRes, residentsRes] = await Promise.all([
        supabase.from("organizations").select("total_male_beds, total_female_beds").eq("id", userOrgId).single(),
        supabase.from("residents").select("gender").eq("organization_id", userOrgId).eq("status", "ativo"),
      ]);

      const maleBeds = (orgRes.data as any)?.total_male_beds ?? 30;
      const femaleBeds = (orgRes.data as any)?.total_female_beds ?? 22;

      let maleResidents = 0;
      let femaleResidents = 0;
      residentsRes.data?.forEach((r) => {
        if (r.gender === "masculino") maleResidents++;
        else if (r.gender === "feminino") femaleResidents++;
      });

      return {
        maleResidents,
        femaleResidents,
        maleBeds,
        femaleBeds,
        maleAvailable: maleBeds - maleResidents,
        femaleAvailable: femaleBeds - femaleResidents,
      };
    },
    enabled: !!userOrgId,
  });
}
