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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      air_requests: {
        Row: {
          created_at: string | null
          created_by: string
          details: Json | null
          extra: Json | null
          id: string
          kind: string | null
          pax_count: number | null
          request_type: string
          route: Json | null
          site: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          details?: Json | null
          extra?: Json | null
          id?: string
          kind?: string | null
          pax_count?: number | null
          request_type: string
          route?: Json | null
          site?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          details?: Json | null
          extra?: Json | null
          id?: string
          kind?: string | null
          pax_count?: number | null
          request_type?: string
          route?: Json | null
          site?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "air_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_id: string
          applied_at: string | null
          cover_letter: string | null
          id: string
          opening_id: string
          resume_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          opening_id: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          applied_at?: string | null
          cover_letter?: string | null
          id?: string
          opening_id?: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "openings"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_badges: {
        Row: {
          badge_data: Json | null
          badge_type: string
          earned_at: string | null
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_data?: Json | null
          badge_type: string
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_data?: Json | null
          badge_type?: string
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_code: string | null
          created_at: string | null
          expires_at: string | null
          file_url: string | null
          id: string
          issued_at: string | null
          issuer: string | null
          talent_id: string | null
        }
        Insert: {
          course_code?: string | null
          created_at?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          talent_id?: string | null
        }
        Update: {
          course_code?: string | null
          created_at?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string | null
          issuer?: string | null
          talent_id?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          created_at: string | null
          id: string
          session_id: string | null
          source: string | null
          status: string | null
          talent_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          source?: string | null
          status?: string | null
          talent_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string | null
          source?: string | null
          status?: string | null
          talent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string
          created_at: string | null
          email: string
          id: string
          name: string
          need_summary: string | null
          phone: string | null
          site: string | null
          source: string | null
          star_aviation: Json | null
          ticketing: boolean | null
        }
        Insert: {
          company: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          need_summary?: string | null
          phone?: string | null
          site?: string | null
          source?: string | null
          star_aviation?: Json | null
          ticketing?: boolean | null
        }
        Update: {
          company?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          need_summary?: string | null
          phone?: string | null
          site?: string | null
          source?: string | null
          star_aviation?: Json | null
          ticketing?: boolean | null
        }
        Relationships: []
      }
      mission_docs: {
        Row: {
          created_at: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          kind: string | null
          mime_type: string | null
          mission_id: string
          tenant_id: string
          uploaded_by: string
          version: number | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          kind?: string | null
          mime_type?: string | null
          mission_id: string
          tenant_id: string
          uploaded_by: string
          version?: number | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          kind?: string | null
          mime_type?: string | null
          mission_id?: string
          tenant_id?: string
          uploaded_by?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_docs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_docs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          rfq_id: string | null
          site: string | null
          sla_json: Json | null
          start_date: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          rfq_id?: string | null
          site?: string | null
          sla_json?: Json | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          rfq_id?: string | null
          site?: string | null
          sla_json?: Json | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      openings: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          location: string | null
          requirements: string[] | null
          salary_range: string | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "openings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          first_name: string | null
          id: string
          is_staff: boolean
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          first_name?: string | null
          id?: string
          is_staff?: boolean
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          first_name?: string | null
          id?: string
          is_staff?: boolean
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          addons_json: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          profiles_json: Json | null
          sites_json: Json | null
          sla_json: Json | null
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          addons_json?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          profiles_json?: Json | null
          sites_json?: Json | null
          sla_json?: Json | null
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          addons_json?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          profiles_json?: Json | null
          sites_json?: Json | null
          sla_json?: Json | null
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          availability: string | null
          certifications: Json | null
          created_at: string | null
          experience_years: number | null
          id: string
          location: string | null
          skills: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?: string | null
          certifications?: Json | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: string | null
          certifications?: Json | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          slug: string
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      training_courses: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          reqs: Json | null
          title: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          reqs?: Json | null
          title: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          reqs?: Json | null
          title?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          capacity: number | null
          course_id: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          location: string | null
          starts_at: string | null
          status: string | null
        }
        Insert: {
          capacity?: number | null
          course_id?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          status?: string | null
        }
        Update: {
          capacity?: number | null
          course_id?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      me: {
        Row: {
          created_at: string | null
          department: string | null
          first_name: string | null
          id: string | null
          is_staff: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: string | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_slug: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          department: string | null
          first_name: string | null
          id: string
          is_staff: boolean
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }[]
      }
      get_me: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          department: string
          email: string
          first_name: string
          id: string
          is_staff: boolean
          last_name: string
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          tenant_id: string
          tenant_name: string
          tenant_slug: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_staff_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "client_admin"
        | "approver"
        | "ops"
        | "recruiter"
        | "finance"
        | "talent"
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
      user_role: [
        "client_admin",
        "approver",
        "ops",
        "recruiter",
        "finance",
        "talent",
      ],
    },
  },
} as const
