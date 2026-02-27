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
      psychology_anamnesis: {
        Row: {
          cognitive_screening_mmse: number | null
          created_at: string
          date: string
          family_bond_quality: string | null
          id: string
          initial_emotional_reaction: Json | null
          initial_psychological_synthesis: string | null
          institutionalization_awareness: string | null
          mood_screening_gds: string | null
          orientation_level: string | null
          pia_psychological_goals: string | null
          recent_griefs_and_losses: string | null
          resident_id: string
          traumas_and_emotional_triggers: string | null
          updated_at: string
          visit_expectations: string | null
        }
        Insert: {
          cognitive_screening_mmse?: number | null
          created_at?: string
          date?: string
          family_bond_quality?: string | null
          id?: string
          initial_emotional_reaction?: Json | null
          initial_psychological_synthesis?: string | null
          institutionalization_awareness?: string | null
          mood_screening_gds?: string | null
          orientation_level?: string | null
          pia_psychological_goals?: string | null
          recent_griefs_and_losses?: string | null
          resident_id: string
          traumas_and_emotional_triggers?: string | null
          updated_at?: string
          visit_expectations?: string | null
        }
        Update: {
          cognitive_screening_mmse?: number | null
          created_at?: string
          date?: string
          family_bond_quality?: string | null
          id?: string
          initial_emotional_reaction?: Json | null
          initial_psychological_synthesis?: string | null
          institutionalization_awareness?: string | null
          mood_screening_gds?: string | null
          orientation_level?: string | null
          pia_psychological_goals?: string | null
          recent_griefs_and_losses?: string | null
          resident_id?: string
          traumas_and_emotional_triggers?: string | null
          updated_at?: string
          visit_expectations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychology_anamnesis_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      psychology_assessments: {
        Row: {
          cognitive_screening_mmse: number | null
          created_at: string
          date: string
          family_bond_quality: string | null
          id: string
          initial_emotional_reaction: Json | null
          initial_psychological_synthesis: string | null
          institutionalization_awareness: string | null
          mood_screening_gds: string | null
          orientation_level: string | null
          pia_psychological_goals: string | null
          recent_griefs_and_losses: string | null
          resident_id: string
          traumas_and_emotional_triggers: string | null
          updated_at: string
          visit_expectations: string | null
        }
        Insert: {
          cognitive_screening_mmse?: number | null
          created_at?: string
          date?: string
          family_bond_quality?: string | null
          id?: string
          initial_emotional_reaction?: Json | null
          initial_psychological_synthesis?: string | null
          institutionalization_awareness?: string | null
          mood_screening_gds?: string | null
          orientation_level?: string | null
          pia_psychological_goals?: string | null
          recent_griefs_and_losses?: string | null
          resident_id: string
          traumas_and_emotional_triggers?: string | null
          updated_at?: string
          visit_expectations?: string | null
        }
        Update: {
          cognitive_screening_mmse?: number | null
          created_at?: string
          date?: string
          family_bond_quality?: string | null
          id?: string
          initial_emotional_reaction?: Json | null
          initial_psychological_synthesis?: string | null
          institutionalization_awareness?: string | null
          mood_screening_gds?: string | null
          orientation_level?: string | null
          pia_psychological_goals?: string | null
          recent_griefs_and_losses?: string | null
          resident_id?: string
          traumas_and_emotional_triggers?: string | null
          updated_at?: string
          visit_expectations?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychology_assessments_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      psychology_attendances: {
        Row: {
          attendance_evolution: string | null
          created_at: string
          created_by: string | null
          date_time: string
          id: string
          intervention_type: string | null
          mural_notes: string | null
          needs_team_report: boolean
          private_notes: string | null
          resident_id: string
          signature: string | null
        }
        Insert: {
          attendance_evolution?: string | null
          created_at?: string
          created_by?: string | null
          date_time?: string
          id?: string
          intervention_type?: string | null
          mural_notes?: string | null
          needs_team_report?: boolean
          private_notes?: string | null
          resident_id: string
          signature?: string | null
        }
        Update: {
          attendance_evolution?: string | null
          created_at?: string
          created_by?: string | null
          date_time?: string
          id?: string
          intervention_type?: string | null
          mural_notes?: string | null
          needs_team_report?: boolean
          private_notes?: string | null
          resident_id?: string
          signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychology_attendances_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      psychology_evolutions: {
        Row: {
          created_at: string
          created_by: string | null
          current_socialization_quality: Json | null
          date: string
          id: string
          institutional_adaptation_status: string | null
          mood_behavior_evolution: string | null
          new_conduct: string | null
          pia_goal_status: string | null
          resident_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_socialization_quality?: Json | null
          date?: string
          id?: string
          institutional_adaptation_status?: string | null
          mood_behavior_evolution?: string | null
          new_conduct?: string | null
          pia_goal_status?: string | null
          resident_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_socialization_quality?: Json | null
          date?: string
          id?: string
          institutional_adaptation_status?: string | null
          mood_behavior_evolution?: string | null
          new_conduct?: string | null
          pia_goal_status?: string | null
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychology_evolutions_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_financials: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          id: string
          resident_id: string
          type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          resident_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          resident_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_financials_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_personal_items: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          observation: string | null
          resident_id: string
          status: string
        }
        Insert: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          observation?: string | null
          resident_id: string
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          observation?: string | null
          resident_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_personal_items_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_relatives: {
        Row: {
          created_at: string
          id: string
          is_responsible: boolean
          kinship: string | null
          name: string | null
          observation: string | null
          phone: string | null
          resident_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_responsible?: boolean
          kinship?: string | null
          name?: string | null
          observation?: string | null
          phone?: string | null
          resident_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_responsible?: boolean
          kinship?: string | null
          name?: string | null
          observation?: string | null
          phone?: string | null
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_relatives_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_visits: {
        Row: {
          created_at: string
          date: string
          id: string
          observation: string | null
          resident_id: string
          time_in: string | null
          time_out: string | null
          visitor_doc: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          observation?: string | null
          resident_id: string
          time_in?: string | null
          time_out?: string | null
          visitor_doc?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          observation?: string | null
          resident_id?: string
          time_in?: string | null
          time_out?: string | null
          visitor_doc?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resident_visits_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          address: string | null
          address_number: string | null
          admission_date: string | null
          admission_reason: string | null
          birth_date: string | null
          cad_unico: string | null
          candidate_id: string | null
          cep: string | null
          cert_book: string | null
          cert_city: string | null
          cert_date: string | null
          cert_number: string | null
          cert_page: string | null
          cert_state: string | null
          cert_type: string | null
          change_reason: string | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          dependency_level: string | null
          discharge_date: string | null
          discharge_reason: string | null
          education: string | null
          father_name: string | null
          favorite_activities: string | null
          gender: string | null
          id: string
          income: string | null
          inss_number: string | null
          inss_status: string | null
          issuing_body: string | null
          marital_status: string | null
          mother_name: string | null
          name: string
          nationality: string | null
          naturalness: string | null
          neighborhood: string | null
          nickname: string | null
          observations: string | null
          organization_id: string
          photo_url: string | null
          preferred_hospitals: string | null
          previous_institution: string | null
          profession: string | null
          reference: string | null
          religion: string | null
          rg: string | null
          room: string | null
          sams_card: string | null
          spouse: string | null
          state: string | null
          status: string
          stay_time: string | null
          stay_type: string | null
          sus_card: string | null
          updated_at: string
          voter_section: string | null
          voter_title: string | null
          voter_zone: string | null
        }
        Insert: {
          address?: string | null
          address_number?: string | null
          admission_date?: string | null
          admission_reason?: string | null
          birth_date?: string | null
          cad_unico?: string | null
          candidate_id?: string | null
          cep?: string | null
          cert_book?: string | null
          cert_city?: string | null
          cert_date?: string | null
          cert_number?: string | null
          cert_page?: string | null
          cert_state?: string | null
          cert_type?: string | null
          change_reason?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          dependency_level?: string | null
          discharge_date?: string | null
          discharge_reason?: string | null
          education?: string | null
          father_name?: string | null
          favorite_activities?: string | null
          gender?: string | null
          id?: string
          income?: string | null
          inss_number?: string | null
          inss_status?: string | null
          issuing_body?: string | null
          marital_status?: string | null
          mother_name?: string | null
          name: string
          nationality?: string | null
          naturalness?: string | null
          neighborhood?: string | null
          nickname?: string | null
          observations?: string | null
          organization_id: string
          photo_url?: string | null
          preferred_hospitals?: string | null
          previous_institution?: string | null
          profession?: string | null
          reference?: string | null
          religion?: string | null
          rg?: string | null
          room?: string | null
          sams_card?: string | null
          spouse?: string | null
          state?: string | null
          status?: string
          stay_time?: string | null
          stay_type?: string | null
          sus_card?: string | null
          updated_at?: string
          voter_section?: string | null
          voter_title?: string | null
          voter_zone?: string | null
        }
        Update: {
          address?: string | null
          address_number?: string | null
          admission_date?: string | null
          admission_reason?: string | null
          birth_date?: string | null
          cad_unico?: string | null
          candidate_id?: string | null
          cep?: string | null
          cert_book?: string | null
          cert_city?: string | null
          cert_date?: string | null
          cert_number?: string | null
          cert_page?: string | null
          cert_state?: string | null
          cert_type?: string | null
          change_reason?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          dependency_level?: string | null
          discharge_date?: string | null
          discharge_reason?: string | null
          education?: string | null
          father_name?: string | null
          favorite_activities?: string | null
          gender?: string | null
          id?: string
          income?: string | null
          inss_number?: string | null
          inss_status?: string | null
          issuing_body?: string | null
          marital_status?: string | null
          mother_name?: string | null
          name?: string
          nationality?: string | null
          naturalness?: string | null
          neighborhood?: string | null
          nickname?: string | null
          observations?: string | null
          organization_id?: string
          photo_url?: string | null
          preferred_hospitals?: string | null
          previous_institution?: string | null
          profession?: string | null
          reference?: string | null
          religion?: string | null
          rg?: string | null
          room?: string | null
          sams_card?: string | null
          spouse?: string | null
          state?: string | null
          status?: string
          stay_time?: string | null
          stay_type?: string | null
          sus_card?: string | null
          updated_at?: string
          voter_section?: string | null
          voter_title?: string | null
          voter_zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
