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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      citations: {
        Row: {
          confidence: number
          created_at: string
          excerpt: string | null
          id: string
          page_ref: string | null
          question_id: string
          source_label: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          excerpt?: string | null
          id?: string
          page_ref?: string | null
          question_id: string
          source_label: string
        }
        Update: {
          confidence?: number
          created_at?: string
          excerpt?: string | null
          id?: string
          page_ref?: string | null
          question_id?: string
          source_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "citations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      correct_answers: {
        Row: {
          explanation: string | null
          explanation_bn: string | null
          option_id: string
          question_id: string
        }
        Insert: {
          explanation?: string | null
          explanation_bn?: string | null
          option_id: string
          question_id: string
        }
        Update: {
          explanation?: string | null
          explanation_bn?: string | null
          option_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "correct_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correct_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          breakdown: Json
          created_at: string
          duration_seconds: number
          finished_at: string | null
          id: string
          score: number
          started_at: string
          total: number
          track_id: string
          user_id: string
        }
        Insert: {
          breakdown?: Json
          created_at?: string
          duration_seconds?: number
          finished_at?: string | null
          id?: string
          score?: number
          started_at?: string
          total?: number
          track_id: string
          user_id: string
        }
        Update: {
          breakdown?: Json
          created_at?: string
          duration_seconds?: number
          finished_at?: string | null
          id?: string
          score?: number
          started_at?: string
          total?: number
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          preferred_language: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: string
          label: string
          option_text: string
          option_text_bn: string | null
          ordinal: number
          question_id: string
        }
        Insert: {
          id?: string
          label: string
          option_text: string
          option_text_bn?: string | null
          ordinal?: number
          question_id: string
        }
        Update: {
          id?: string
          label?: string
          option_text?: string
          option_text_bn?: string | null
          ordinal?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          institution: string
          language: string
          question_text: string
          question_text_bn: string | null
          subject_id: string
          topic_tags: string[]
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          difficulty?: string
          id?: string
          institution: string
          language?: string
          question_text: string
          question_text_bn?: string | null
          subject_id: string
          topic_tags?: string[]
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          institution?: string
          language?: string
          question_text?: string
          question_text_bn?: string | null
          subject_id?: string
          topic_tags?: string[]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_bookmarks: {
        Row: {
          created_at: string
          id: string
          last_reviewed_at: string | null
          question_id: string
          reason: string
          review_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          question_id: string
          reason?: string
          review_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          question_id?: string
          reason?: string
          review_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          name_bn: string
          name_en: string
          ordinal: number
          track_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_bn: string
          name_en: string
          ordinal?: number
          track_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_bn?: string
          name_en?: string
          ordinal?: number
          track_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          color_token: string
          created_at: string
          description_bn: string
          description_en: string
          id: string
          name_bn: string
          name_en: string
          ordinal: number
          updated_at: string
        }
        Insert: {
          color_token?: string
          created_at?: string
          description_bn: string
          description_en: string
          id: string
          name_bn: string
          name_en: string
          ordinal?: number
          updated_at?: string
        }
        Update: {
          color_token?: string
          created_at?: string
          description_bn?: string
          description_en?: string
          id?: string
          name_bn?: string
          name_en?: string
          ordinal?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          active_track: string | null
          exam_state: Json | null
          notes: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          active_track?: string | null
          exam_state?: Json | null
          notes?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          active_track?: string | null
          exam_state?: Json | null
          notes?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_active_track_fkey"
            columns: ["active_track"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "moderator" | "student"
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
      app_role: ["admin", "moderator", "student"],
    },
  },
} as const
