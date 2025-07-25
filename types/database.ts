export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity: {
        Row: {
          active: boolean
          activity_description: string
          activity_link: string | null
          activity_type: string
          id_activity: string
          id_day: string
          order: number
          transfer_time: string | null
        }
        Insert: {
          active?: boolean
          activity_description: string
          activity_link?: string | null
          activity_type: string
          id_activity?: string
          id_day: string
          order: number
          transfer_time?: string | null
        }
        Update: {
          active?: boolean
          activity_description?: string
          activity_link?: string | null
          activity_type?: string
          id_activity?: string
          id_day?: string
          order?: number
          transfer_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_id_day_fkey"
            columns: ["id_day"]
            isOneToOne: false
            referencedRelation: "day"
            referencedColumns: ["id_day"]
          },
        ]
      }
      city: {
        Row: {
          active: boolean
          city_image_path: string | null
          city_name: string
          id_city: string
        }
        Insert: {
          active?: boolean
          city_image_path?: string | null
          city_name: string
          id_city?: string
        }
        Update: {
          active?: boolean
          city_image_path?: string | null
          city_name?: string
          id_city?: string
        }
        Relationships: []
      }
      city_day: {
        Row: {
          id_city: string
          id_day: string
        }
        Insert: {
          id_city: string
          id_day: string
        }
        Update: {
          id_city?: string
          id_day?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_day_id_city_fkey"
            columns: ["id_city"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id_city"]
          },
          {
            foreignKeyName: "city_day_id_day_fkey"
            columns: ["id_day"]
            isOneToOne: false
            referencedRelation: "day"
            referencedColumns: ["id_day"]
          },
        ]
      }
      day: {
        Row: {
          active: boolean
          day_description: string
          id_day: string
          id_itinerary: string
          image_path: string | null
          lodging_place: string
          order: number
        }
        Insert: {
          active?: boolean
          day_description: string
          id_day?: string
          id_itinerary: string
          image_path?: string | null
          lodging_place: string
          order: number
        }
        Update: {
          active?: boolean
          day_description?: string
          id_day?: string
          id_itinerary?: string
          image_path?: string | null
          lodging_place?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "day_id_itinerary_fkey"
            columns: ["id_itinerary"]
            isOneToOne: false
            referencedRelation: "itinerary"
            referencedColumns: ["id_itinerary"]
          },
        ]
      }
      itinerary: {
        Row: {
          active: boolean
          destination: string
          end_date: string
          id_itinerary: string
          id_theme: string
          language: string
          start_date: string
          title: string
        }
        Insert: {
          active?: boolean
          destination: string
          end_date: string
          id_itinerary?: string
          id_theme: string
          language: string
          start_date: string
          title: string
        }
        Update: {
          active?: boolean
          destination?: string
          end_date?: string
          id_itinerary?: string
          id_theme?: string
          language?: string
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_id_theme_fkey"
            columns: ["id_theme"]
            isOneToOne: false
            referencedRelation: "theme"
            referencedColumns: ["id_theme"]
          },
        ]
      }
      theme: {
        Row: {
          active: boolean
          color_back: string
          color_front: string
          created_at: string
          font: string
          id_theme: string
          name_theme: string
          path_img_agency: string
          path_img_back: string
          path_img_client: string
          path_img_fair: string
          path_img_front: string
          size_title: number
        }
        Insert: {
          active?: boolean
          color_back: string
          color_front: string
          created_at?: string
          font: string
          id_theme?: string
          name_theme: string
          path_img_agency: string
          path_img_back: string
          path_img_client: string
          path_img_fair: string
          path_img_front: string
          size_title: number
        }
        Update: {
          active?: boolean
          color_back?: string
          color_front?: string
          created_at?: string
          font?: string
          id_theme?: string
          name_theme?: string
          path_img_agency?: string
          path_img_back?: string
          path_img_client?: string
          path_img_fair?: string
          path_img_front?: string
          size_title?: number
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
    Enums: {},
  },
} as const
