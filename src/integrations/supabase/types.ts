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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          first_name: string
          id: string
          is_default_billing: boolean | null
          is_default_shipping: boolean | null
          label: string | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          last_name: string
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string
          id: string
          product_id: string
          quantity: number | null
        }
        Insert: {
          bundle_id: string
          id?: string
          product_id: string
          quantity?: number | null
        }
        Update: {
          bundle_id?: string
          id?: string
          product_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          badge: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          price: number
          tagline: string | null
        }
        Insert: {
          badge?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          price: number
          tagline?: string | null
        }
        Update: {
          badge?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          price?: number
          tagline?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          bundle_id: string | null
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          starts_at: string | null
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          starts_at?: string | null
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          starts_at?: string | null
          uses_count?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_subscribed: boolean | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_subscribed?: boolean | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          bundle_id: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          discount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          benefits: string[] | null
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          how_to_use: string | null
          id: string
          image_url: string
          images: string[] | null
          ingredients: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price: number
          sku: string | null
          stock_quantity: number | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          benefits?: string[] | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          how_to_use?: string | null
          id?: string
          image_url: string
          images?: string[] | null
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price: number
          sku?: string | null
          stock_quantity?: number | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          benefits?: string[] | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          how_to_use?: string | null
          id?: string
          image_url?: string
          images?: string[] | null
          ingredients?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
          preferences: Json | null
          purchase_history: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          preferences?: Json | null
          purchase_history?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          purchase_history?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          bundle_id: string | null
          created_at: string
          id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_secure_order_number: { Args: never; Returns: string }
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
