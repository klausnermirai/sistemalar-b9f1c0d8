export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          admission_date: string | null
          archive_reason: string | null
          archived_at: string | null
          board_opinion: string | null
          contact_date: string | null
          contract_status: string | null
          created_at: string
          created_by: string | null
          elder_name: string
          id: string
          integration_date: string | null
          integration_report: string | null
          medical_opinion: string | null
          medical_status: string | null
          organization_id: string
          phone: string | null
          priority: Database["public"]["Enums"]["candidate_priority"]
          stage: Database["public"]["Enums"]["candidate_stage"]
          updated_at: string
          visit_address: string | null
        }
        Insert: {
          admission_date?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          board_opinion?: string | null
          contact_date?: string | null
          contract_status?: string | null
          created_at?: string
          created_by?: string | null
          elder_name: string
          id?: string
          integration_date?: string | null
          integration_report?: string | null
          medical_opinion?: string | null
          medical_status?: string | null
          organization_id: string
          phone?: string | null
          priority?: Database["public"]["Enums"]["candidate_priority"]
          stage?: Database["public"]["Enums"]["candidate_stage"]
          updated_at?: string
          visit_address?: string | null
        }
        Update: {
          admission_date?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          board_opinion?: string | null
          contact_date?: string | null
          contract_status?: string | null
          created_at?: string
          created_by?: string | null
          elder_name?: string
          id?: string
          integration_date?: string | null
          integration_report?: string | null
          medical_opinion?: string | null
          medical_status?: string | null
          organization_id?: string
          phone?: string | null
          priority?: Database["public"]["Enums"]["candidate_priority"]
          stage?: Database["public"]["Enums"]["candidate_stage"]
          updated_at?: string
          visit_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_data: {
        Row: {
          admission_reason: string | null
          candidate_id: string
          created_at: string
          dependency: Json | null
          family_detail: Json | null
          family_support: Json | null
          health: Json | null
          housing: Json | null
          id: string
          identification: Json | null
          legal_guardian: Json | null
          psychosocial: Json | null
          social_opinion: string | null
          socioeconomic: Json | null
          updated_at: string
        }
        Insert: {
          admission_reason?: string | null
          candidate_id: string
          created_at?: string
          dependency?: Json | null
          family_detail?: Json | null
          family_support?: Json | null
          health?: Json | null
          housing?: Json | null
          id?: string
          identification?: Json | null
          legal_guardian?: Json | null
          psychosocial?: Json | null
          social_opinion?: string | null
          socioeconomic?: Json | null
          updated_at?: string
        }
        Update: {
          admission_reason?: string | null
          candidate_id?: string
          created_at?: string
          dependency?: Json | null
          family_detail?: Json | null
          family_support?: Json | null
          health?: Json | null
          housing?: Json | null
          id?: string
          identification?: Json | null
          legal_guardian?: Json | null
          psychosocial?: Json | null
          social_opinion?: string | null
          socioeconomic?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_data_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          central_council_name: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          id: string
          metropolitan_council_name: string | null
          name: string
          org_type: Database["public"]["Enums"]["org_type"]
          parent_id: string | null
          state: string | null
        }
        Insert: {
          central_council_name?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          metropolitan_council_name?: string | null
          name: string
          org_type: Database["public"]["Enums"]["org_type"]
          parent_id?: string | null
          state?: string | null
        }
        Update: {
          central_council_name?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          metropolitan_council_name?: string | null
          name?: string
          org_type?: Database["public"]["Enums"]["org_type"]
          parent_id?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_org_by_cnpj: { Args: { _cnpj: string }; Returns: string }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "coordinator" | "social_worker" | "viewer"
      candidate_priority: "padrao" | "social_urgente" | "dependencia_duvidosa"
      candidate_stage:
        | "agendamento"
        | "entrevista"
        | "lista_espera"
        | "acolhido"
        | "arquivado"
        | "decisao_diretoria"
        | "avaliacao_medica"
        | "integracao"
      org_type:
        | "conselho_nacional"
        | "conselho_metropolitano"
        | "conselho_central"
        | "obra_unida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordinator", "social_worker", "viewer"],
      candidate_priority: ["padrao", "social_urgente", "dependencia_duvidosa"],
      candidate_stage: [
        "agendamento",
        "entrevista",
        "lista_espera",
        "acolhido",
        "arquivado",
        "decisao_diretoria",
        "avaliacao_medica",
        "integracao",
      ],
      org_type: [
        "conselho_nacional",
        "conselho_metropolitano",
        "conselho_central",
        "obra_unida",
      ],
    },
  },
} as const
