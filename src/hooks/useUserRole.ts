import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = "admin" | "social_worker" | "psicologo" | "nutricionista" | "coordinator" | "viewer" | "terapeuta_ocupacional";

type Module =
  | "triagens"
  | "residentes"
  | "res:dados_pessoais"
  | "res:familiares"
  | "res:financeiro"
  | "res:itens"
  | "res:prontuario"
  | "res:pia"
  | "atendimento"
  | "atend:psicologia"
  | "atend:nutricao"
  | "atend:terapia_ocupacional"
  | "atend:atividades_grupo"
  | "configuracoes"
  | "minha_conta";

const PERMISSIONS: Record<Module, AppRole[]> = {
  triagens: ["admin", "social_worker"],
  residentes: ["admin", "social_worker", "psicologo", "nutricionista", "terapeuta_ocupacional"],
  "res:dados_pessoais": ["admin", "social_worker", "psicologo", "nutricionista", "terapeuta_ocupacional"],
  "res:familiares": ["admin", "social_worker"],
  "res:financeiro": ["admin", "social_worker"],
  "res:itens": ["admin", "social_worker"],
  "res:prontuario": ["admin", "social_worker", "psicologo", "nutricionista", "terapeuta_ocupacional"],
  "res:pia": ["admin", "social_worker", "psicologo", "nutricionista", "terapeuta_ocupacional"],
  atendimento: ["admin", "psicologo", "nutricionista", "terapeuta_ocupacional"],
  "atend:psicologia": ["admin", "psicologo"],
  "atend:nutricao": ["admin", "nutricionista"],
  "atend:terapia_ocupacional": ["admin", "terapeuta_ocupacional"],
  "atend:atividades_grupo": ["admin", "psicologo", "nutricionista", "terapeuta_ocupacional"],
  configuracoes: ["admin"],
  minha_conta: ["admin", "social_worker", "psicologo", "nutricionista", "coordinator", "viewer", "terapeuta_ocupacional"],
};

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .limit(1)
      .single()
      .then(({ data }) => {
        setRole((data?.role as AppRole) || null);
        setLoading(false);
      });
  }, [user]);

  const canAccess = (module: Module): boolean => {
    if (!role) return false;
    return PERMISSIONS[module]?.includes(role) ?? false;
  };

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isSocialWorker: role === "social_worker",
    isPsicologo: role === "psicologo",
    isNutricionista: role === "nutricionista",
    isTerapeutaOcupacional: role === "terapeuta_ocupacional",
    canAccess,
  };
}
