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
          created_at: string
          id_activity: string
          id_day: string
          order: number
          transfer_time: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          activity_description: string
          activity_link?: string | null
          activity_type: string
          created_at?: string
          id_activity?: string
          id_day: string
          order: number
          transfer_time: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          activity_description?: string
          activity_link?: string | null
          activity_type?: string
          created_at?: string
          id_activity?: string
          id_day?: string
          order?: number
          transfer_time?: string
          updated_at?: string
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
          created_at: string
          id_city: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city_image_path?: string | null
          city_name: string
          created_at?: string
          id_city?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city_image_path?: string | null
          city_name?: string
          created_at?: string
          id_city?: string
          updated_at?: string
        }
        Relationships: []
      }
      day: {
        Row: {
          active: boolean
          created_at: string
          day_description: string
          id_city: string
          id_day: string
          id_itinerary: string
          image_path: string | null
          lodging_place: string | null
          order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          day_description: string
          id_city: string
          id_day?: string
          id_itinerary: string
          image_path?: string | null
          lodging_place?: string | null
          order: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          day_description?: string
          id_city?: string
          id_day?: string
          id_itinerary?: string
          image_path?: string | null
          lodging_place?: string | null
          order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_id_city_fkey"
            columns: ["id_city"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id_city"]
          },
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
          created_at: string
          destination: string
          end_date: string
          id_itinerary: string
          id_theme: string
          language: string
          path_img_back: string
          path_img_client: string | null
          path_img_fair: string | null
          path_img_front: string
          path_itinerary_image: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          destination: string
          end_date: string
          id_itinerary?: string
          id_theme: string
          language: string
          path_img_back: string
          path_img_client?: string | null
          path_img_fair?: string | null
          path_img_front: string
          path_itinerary_image?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          destination?: string
          end_date?: string
          id_itinerary?: string
          id_theme?: string
          language?: string
          path_img_back?: string
          path_img_client?: string | null
          path_img_fair?: string | null
          path_img_front?: string
          path_itinerary_image?: string | null
          start_date?: string
          title?: string
          updated_at?: string
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
          city_img_size_px: number | null
          color_back_cover: string | null
          color_cover: string | null
          color_headings: string | null
          created_at: string
          day_layout: string | null
          font_body: string | null
          font_body_size: number | null
          font_size_title: number | null
          font_title: string
          heading_font_size: number | null
          heading_image_height: number | null
          icon_size: number | null
          icon_style: string | null
          id_theme: string
          line_height: number | null
          margin_title_top: number | null
          name_theme: string
          page_background_color: string | null
          page_height_px: number | null
          page_padding_px: number | null
          page_width_px: number | null
          paragraph_spacing: number | null
          path_img_agency: string
          section_divider: string | null
          section_spacing: number | null
          summary_banner_background_color: string | null
          summary_banner_border_color: string | null
          summary_banner_text_color: string | null
          timeline_color: string | null
          title_alignment: string | null
          title_case: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          city_img_size_px?: number | null
          color_back_cover?: string | null
          color_cover?: string | null
          color_headings?: string | null
          created_at?: string
          day_layout?: string | null
          font_body?: string | null
          font_body_size?: number | null
          font_size_title?: number | null
          font_title: string
          heading_font_size?: number | null
          heading_image_height?: number | null
          icon_size?: number | null
          icon_style?: string | null
          id_theme?: string
          line_height?: number | null
          margin_title_top?: number | null
          name_theme: string
          page_background_color?: string | null
          page_height_px?: number | null
          page_padding_px?: number | null
          page_width_px?: number | null
          paragraph_spacing?: number | null
          path_img_agency: string
          section_divider?: string | null
          section_spacing?: number | null
          summary_banner_background_color?: string | null
          summary_banner_border_color?: string | null
          summary_banner_text_color?: string | null
          timeline_color?: string | null
          title_alignment?: string | null
          title_case?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          city_img_size_px?: number | null
          color_back_cover?: string | null
          color_cover?: string | null
          color_headings?: string | null
          created_at?: string
          day_layout?: string | null
          font_body?: string | null
          font_body_size?: number | null
          font_size_title?: number | null
          font_title?: string
          heading_font_size?: number | null
          heading_image_height?: number | null
          icon_size?: number | null
          icon_style?: string | null
          id_theme?: string
          line_height?: number | null
          margin_title_top?: number | null
          name_theme?: string
          page_background_color?: string | null
          page_height_px?: number | null
          page_padding_px?: number | null
          page_width_px?: number | null
          paragraph_spacing?: number | null
          path_img_agency?: string
          section_divider?: string | null
          section_spacing?: number | null
          summary_banner_background_color?: string | null
          summary_banner_border_color?: string | null
          summary_banner_text_color?: string | null
          timeline_color?: string | null
          title_alignment?: string | null
          title_case?: string | null
          updated_at?: string
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
