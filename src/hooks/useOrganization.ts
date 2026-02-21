import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Organization {
  id: string;
  name: string;
  org_type: string;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  central_council_name: string | null;
  metropolitan_council_name: string | null;
}

export function useOrganization() {
  const { userOrgId } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userOrgId) {
      setOrg(null);
      setLoading(false);
      return;
    }
    supabase
      .from("organizations")
      .select("*")
      .eq("id", userOrgId)
      .single()
      .then(({ data }) => {
        setOrg(data as Organization | null);
        setLoading(false);
      });
  }, [userOrgId]);

  return { org, loading };
}
