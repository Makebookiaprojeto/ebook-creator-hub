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
      chapters: {
        Row: {
          content: string | null
          created_at: string
          ebook_id: string
          id: string
          image_url: string | null
          order_index: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          ebook_id: string
          id?: string
          image_url?: string | null
          order_index?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          ebook_id?: string
          id?: string
          image_url?: string | null
          order_index?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapters_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "public_ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_payment_config: {
        Row: {
          checkout_url: string | null
          created_at: string
          ebook_id: string
          id: string
          owner_id: string
          payment_platform: string
          product_id: string | null
          updated_at: string
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string
          ebook_id: string
          id?: string
          owner_id: string
          payment_platform?: string
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          checkout_url?: string | null
          created_at?: string
          ebook_id?: string
          id?: string
          owner_id?: string
          payment_platform?: string
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebook_payment_config_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: true
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ebook_payment_config_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: true
            referencedRelation: "public_ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_sales: {
        Row: {
          amount_paid_cents: number | null
          cakto_transaction_id: string | null
          created_at: string | null
          customer_email: string
          ebook_id: string | null
          ebook_owner_id: string | null
          id: string
          platform: string
          platform_transaction_id: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid_cents?: number | null
          cakto_transaction_id?: string | null
          created_at?: string | null
          customer_email: string
          ebook_id?: string | null
          ebook_owner_id?: string | null
          id?: string
          platform?: string
          platform_transaction_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid_cents?: number | null
          cakto_transaction_id?: string | null
          created_at?: string | null
          customer_email?: string
          ebook_id?: string | null
          ebook_owner_id?: string | null
          id?: string
          platform?: string
          platform_transaction_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ebook_sales_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ebook_sales_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "public_ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_templates: {
        Row: {
          audience: string | null
          chapters: Json
          cover_prompt: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          niche: string
          subtitle: string | null
          tags: string[] | null
          title: string
          updated_at: string
          use_count: number
        }
        Insert: {
          audience?: string | null
          chapters?: Json
          cover_prompt?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          niche: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          audience?: string | null
          chapters?: Json
          cover_prompt?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          niche?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: []
      }
      ebook_webhook_secrets: {
        Row: {
          created_at: string
          ebook_id: string
          owner_id: string
          updated_at: string
          webhook_secret: string
        }
        Insert: {
          created_at?: string
          ebook_id: string
          owner_id: string
          updated_at?: string
          webhook_secret: string
        }
        Update: {
          created_at?: string
          ebook_id?: string
          owner_id?: string
          updated_at?: string
          webhook_secret?: string
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          audience: string | null
          author_name: string | null
          cakto_checkout_url: string | null
          category: string | null
          content_json: Json | null
          cover_url: string | null
          created_at: string
          description: string | null
          external_product_id: string | null
          generation_error: string | null
          generation_input: Json | null
          generation_progress: Json
          generation_status: string
          id: string
          is_public: boolean
          is_template: boolean | null
          niche: string | null
          payment_platform: string | null
          pdf_url: string | null
          price: number | null
          price_cents: number | null
          sales_pitch: string | null
          slug: string | null
          status: Database["public"]["Enums"]["ebook_status"]
          subtitle: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          audience?: string | null
          author_name?: string | null
          cakto_checkout_url?: string | null
          category?: string | null
          content_json?: Json | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          external_product_id?: string | null
          generation_error?: string | null
          generation_input?: Json | null
          generation_progress?: Json
          generation_status?: string
          id?: string
          is_public?: boolean
          is_template?: boolean | null
          niche?: string | null
          payment_platform?: string | null
          pdf_url?: string | null
          price?: number | null
          price_cents?: number | null
          sales_pitch?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["ebook_status"]
          subtitle?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          audience?: string | null
          author_name?: string | null
          cakto_checkout_url?: string | null
          category?: string | null
          content_json?: Json | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          external_product_id?: string | null
          generation_error?: string | null
          generation_input?: Json | null
          generation_progress?: Json
          generation_status?: string
          id?: string
          is_public?: boolean
          is_template?: boolean | null
          niche?: string | null
          payment_platform?: string | null
          pdf_url?: string | null
          price?: number | null
          price_cents?: number | null
          sales_pitch?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["ebook_status"]
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number
          buyer_email: string | null
          cakto_transaction_id: string | null
          created_at: string
          currency: string
          ebook_id: string
          ebook_owner_id: string
          id: string
          platform: string
          platform_transaction_id: string | null
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          buyer_email?: string | null
          cakto_transaction_id?: string | null
          created_at?: string
          currency?: string
          ebook_id: string
          ebook_owner_id: string
          id?: string
          platform?: string
          platform_transaction_id?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          buyer_email?: string | null
          cakto_transaction_id?: string | null
          created_at?: string
          currency?: string
          ebook_id?: string
          ebook_owner_id?: string
          id?: string
          platform?: string
          platform_transaction_id?: string | null
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          ebooks_generated_this_month: number | null
          id: string
          last_ebook_reset_at: string | null
          monthly_ebook_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          ebooks_generated_this_month?: number | null
          id?: string
          last_ebook_reset_at?: string | null
          monthly_ebook_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          ebooks_generated_this_month?: number | null
          id?: string
          last_ebook_reset_at?: string | null
          monthly_ebook_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_paid_cents: number | null
          created_at: string
          customer_email: string
          ebook_id: string
          ebook_owner_id: string | null
          id: string
          platform: string | null
          platform_transaction_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_paid_cents?: number | null
          created_at?: string
          customer_email: string
          ebook_id: string
          ebook_owner_id?: string | null
          id?: string
          platform?: string | null
          platform_transaction_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_paid_cents?: number | null
          created_at?: string
          customer_email?: string
          ebook_id?: string
          ebook_owner_id?: string | null
          id?: string
          platform?: string | null
          platform_transaction_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "public_ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          buyer_email: string
          cakto_transaction_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          buyer_email: string
          cakto_transaction_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          buyer_email?: string
          cakto_transaction_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_payment_configs: {
        Row: {
          checkout_url: string | null
          created_at: string
          id: string
          payment_platform: string | null
          product_id: string | null
          updated_at: string
          user_id: string
          webhook_secret: string | null
        }
        Insert: {
          checkout_url?: string | null
          created_at?: string
          id?: string
          payment_platform?: string | null
          product_id?: string | null
          updated_at?: string
          user_id: string
          webhook_secret?: string | null
        }
        Update: {
          checkout_url?: string | null
          created_at?: string
          id?: string
          payment_platform?: string | null
          product_id?: string | null
          updated_at?: string
          user_id?: string
          webhook_secret?: string | null
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
    }
    Views: {
      public_ebook_checkout: {
        Row: {
          checkout_url: string | null
          ebook_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ebook_payment_config_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: true
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ebook_payment_config_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: true
            referencedRelation: "public_ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      public_ebooks: {
        Row: {
          audience: string | null
          author_name: string | null
          category: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_public: boolean | null
          niche: string | null
          price_cents: number | null
          sales_pitch: string | null
          slug: string | null
          status: Database["public"]["Enums"]["ebook_status"] | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audience?: string | null
          author_name?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_public?: boolean | null
          niche?: string | null
          price_cents?: number | null
          sales_pitch?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["ebook_status"] | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audience?: string | null
          author_name?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_public?: boolean | null
          niche?: string | null
          price_cents?: number | null
          sales_pitch?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["ebook_status"] | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_email_exists: { Args: { email_to_check: string }; Returns: boolean }
      find_active_template_by_niche: {
        Args: { _niche: string }
        Returns: {
          audience: string
          chapters: Json
          cover_prompt: string
          id: string
          niche: string
          subtitle: string
          title: string
        }[]
      }
      get_public_ebook_pdf_url: { Args: { _ebook_id: string }; Returns: string }
      get_user_id_by_email: { Args: { email_param: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_template_use: {
        Args: { _template_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      ebook_status: "draft" | "published" | "archived"
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
      app_role: ["admin", "moderator", "user"],
      ebook_status: ["draft", "published", "archived"],
    },
  },
} as const
