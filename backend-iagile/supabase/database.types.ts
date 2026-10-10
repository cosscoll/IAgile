// Generated from IAgile Academy Supabase project after instructor feedback migration (2026-10-10).
// Keep this synchronized with project schema.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academy_course_assets: {
        Row: {
          asset_key: string
          course_slug: string
          published: boolean
          storage_path: string
          title: string
        }
        Insert: {
          asset_key: string
          course_slug: string
          published?: boolean
          storage_path: string
          title: string
        }
        Update: {
          asset_key?: string
          course_slug?: string
          published?: boolean
          storage_path?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_course_assets_course_slug_fkey"
            columns: ["course_slug"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["slug"]
          },
        ]
      }
      academy_course_modules: {
        Row: {
          body_markdown: string
          course_slug: string
          module_index: number
          published: boolean
          title: string
        }
        Insert: {
          body_markdown?: string
          course_slug: string
          module_index: number
          published?: boolean
          title: string
        }
        Update: {
          body_markdown?: string
          course_slug?: string
          module_index?: number
          published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_course_modules_course_slug_fkey"
            columns: ["course_slug"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["slug"]
          },
        ]
      }
      academy_courses: {
        Row: {
          created_at: string
          published: boolean
          slug: string
          summary: string
          title: string
        }
        Insert: {
          created_at?: string
          published?: boolean
          slug: string
          summary?: string
          title: string
        }
        Update: {
          created_at?: string
          published?: boolean
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      academy_deliverable_answers: {
        Row: {
          content: string
          course_slug: string
          deliverable_index: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          course_slug: string
          deliverable_index: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          course_slug?: string
          deliverable_index?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_deliverable_answers_course_slug_deliverable_index_fkey"
            columns: ["course_slug", "deliverable_index"]
            isOneToOne: false
            referencedRelation: "academy_deliverable_prompts"
            referencedColumns: ["course_slug", "deliverable_index"]
          },
        ]
      }
      academy_deliverable_feedback: {
        Row: {
          course_slug: string
          deliverable_index: number
          feedback_text: string
          instructor_id: string
          reviewed_at: string
          status: string
          user_id: string
        }
        Insert: {
          course_slug: string
          deliverable_index: number
          feedback_text: string
          instructor_id: string
          reviewed_at?: string
          status: string
          user_id: string
        }
        Update: {
          course_slug?: string
          deliverable_index?: number
          feedback_text?: string
          instructor_id?: string
          reviewed_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_deliverable_feedback_user_id_course_slug_deliverab_fkey"
            columns: ["user_id", "course_slug", "deliverable_index"]
            isOneToOne: true
            referencedRelation: "academy_deliverable_answers"
            referencedColumns: ["user_id", "course_slug", "deliverable_index"]
          },
        ]
      }
      academy_deliverable_prompts: {
        Row: {
          course_slug: string
          deliverable_index: number
          instructions_markdown: string
          published: boolean
          title: string
        }
        Insert: {
          course_slug: string
          deliverable_index: number
          instructions_markdown?: string
          published?: boolean
          title: string
        }
        Update: {
          course_slug?: string
          deliverable_index?: number
          instructions_markdown?: string
          published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_deliverable_prompts_course_slug_fkey"
            columns: ["course_slug"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["slug"]
          },
        ]
      }
      academy_enrollments: {
        Row: {
          active: boolean
          course_slug: string
          created_at: string
          source: string
          user_id: string
        }
        Insert: {
          active?: boolean
          course_slug: string
          created_at?: string
          source?: string
          user_id: string
        }
        Update: {
          active?: boolean
          course_slug?: string
          created_at?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_enrollments_course_slug_fkey"
            columns: ["course_slug"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["slug"]
          },
        ]
      }
      academy_instructor_courses: {
        Row: {
          assigned_at: string
          course_slug: string
          instructor_id: string
        }
        Insert: {
          assigned_at?: string
          course_slug: string
          instructor_id: string
        }
        Update: {
          assigned_at?: string
          course_slug?: string
          instructor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_instructor_courses_course_slug_fkey"
            columns: ["course_slug"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["slug"]
          },
        ]
      }
      academy_module_progress: {
        Row: {
          completed: boolean
          course_slug: string
          module_index: number
          notes: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_slug: string
          module_index: number
          notes?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          course_slug?: string
          module_index?: number
          notes?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_module_progress_course_slug_module_index_fkey"
            columns: ["course_slug", "module_index"]
            isOneToOne: false
            referencedRelation: "academy_course_modules"
            referencedColumns: ["course_slug", "module_index"]
          },
        ]
      }
      academy_profiles: {
        Row: {
          account_status: string
          created_at: string
          display_name: string
          user_id: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          display_name?: string
          user_id: string
        }
        Update: {
          account_status?: string
          created_at?: string
          display_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
