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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      checklist_templates: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          equipment: Json | null
          id: string
          include_photos: boolean | null
          location_name: string | null
          process_number: string | null
          questions: Json | null
          responsible_employee: string | null
          signatories: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          equipment?: Json | null
          id?: string
          include_photos?: boolean | null
          location_name?: string | null
          process_number?: string | null
          questions?: Json | null
          responsible_employee?: string | null
          signatories?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          equipment?: Json | null
          id?: string
          include_photos?: boolean | null
          location_name?: string | null
          process_number?: string | null
          questions?: Json | null
          responsible_employee?: string | null
          signatories?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          auth_user_id: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          role: string
          status: string
          updated_at: string
          username: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          notes: string | null
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          notes?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tasks: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string
          id: string
          lead_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date: string
          id?: string
          lead_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string
          id?: string
          lead_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string
          created_at: string
          email: string | null
          id: string
          interest: string | null
          lost_reason: string | null
          name: string
          notes: string | null
          origin: Database["public"]["Enums"]["lead_origin"]
          phone: string
          proposal_date: string | null
          proposal_status: string | null
          proposal_value: number | null
          responsible_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          status_changed_at: string | null
          tag: Database["public"]["Enums"]["lead_tag"] | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          company?: string
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          lost_reason?: string | null
          name: string
          notes?: string | null
          origin?: Database["public"]["Enums"]["lead_origin"]
          phone?: string
          proposal_date?: string | null
          proposal_status?: string | null
          proposal_value?: number | null
          responsible_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_changed_at?: string | null
          tag?: Database["public"]["Enums"]["lead_tag"] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          lost_reason?: string | null
          name?: string
          notes?: string | null
          origin?: Database["public"]["Enums"]["lead_origin"]
          phone?: string
          proposal_date?: string | null
          proposal_status?: string | null
          proposal_value?: number | null
          responsible_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_changed_at?: string | null
          tag?: Database["public"]["Enums"]["lead_tag"] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      location_contracts: {
        Row: {
          created_at: string
          id: string
          labor_cost_per_visit: number
          location_id: string
          monthly_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          labor_cost_per_visit?: number
          location_id: string
          monthly_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          labor_cost_per_visit?: number
          location_id?: string
          monthly_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          frequency: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          responsible: string | null
          structure_type: string | null
          updated_at: string
          water_volume: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          responsible?: string | null
          structure_type?: string | null
          updated_at?: string
          water_volume?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          responsible?: string | null
          structure_type?: string | null
          updated_at?: string
          water_volume?: number | null
        }
        Relationships: []
      }
      maintenances: {
        Row: {
          checklist: Json
          chlorine: number | null
          created_at: string
          date: string
          employee_id: string
          end_time: string | null
          id: string
          location_id: string
          notes: string | null
          ph: number | null
          photos: Json
          start_time: string | null
          temperature: number | null
          template_id: string | null
          turbidity: number | null
          updated_at: string
          used_supplies: Json
          user_id: string | null
        }
        Insert: {
          checklist?: Json
          chlorine?: number | null
          created_at?: string
          date?: string
          employee_id: string
          end_time?: string | null
          id?: string
          location_id: string
          notes?: string | null
          ph?: number | null
          photos?: Json
          start_time?: string | null
          temperature?: number | null
          template_id?: string | null
          turbidity?: number | null
          updated_at?: string
          used_supplies?: Json
          user_id?: string | null
        }
        Update: {
          checklist?: Json
          chlorine?: number | null
          created_at?: string
          date?: string
          employee_id?: string
          end_time?: string | null
          id?: string
          location_id?: string
          notes?: string | null
          ph?: number | null
          photos?: Json
          start_time?: string | null
          temperature?: number | null
          template_id?: string | null
          turbidity?: number | null
          updated_at?: string
          used_supplies?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplies: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number | null
          id: string
          minimum_stock: number | null
          name: string
          notes: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          id?: string
          minimum_stock?: number | null
          name: string
          notes?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number | null
          id?: string
          minimum_stock?: number | null
          name?: string
          notes?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "ligacao"
        | "whatsapp"
        | "reuniao"
        | "proposta"
        | "email"
        | "outro"
      app_role: "admin" | "tecnico"
      lead_origin:
        | "google"
        | "facebook"
        | "instagram"
        | "indicacao"
        | "site"
        | "outro"
      lead_status:
        | "novo"
        | "contato_iniciado"
        | "qualificado"
        | "proposta_enviada"
        | "negociacao"
        | "fechado_ganho"
        | "perdido"
      lead_tag: "quente" | "morno" | "frio" | "urgente"
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
      activity_type: [
        "ligacao",
        "whatsapp",
        "reuniao",
        "proposta",
        "email",
        "outro",
      ],
      app_role: ["admin", "tecnico"],
      lead_origin: [
        "google",
        "facebook",
        "instagram",
        "indicacao",
        "site",
        "outro",
      ],
      lead_status: [
        "novo",
        "contato_iniciado",
        "qualificado",
        "proposta_enviada",
        "negociacao",
        "fechado_ganho",
        "perdido",
      ],
      lead_tag: ["quente", "morno", "frio", "urgente"],
    },
  },
} as const
