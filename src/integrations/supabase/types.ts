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
      address_access_log: {
        Row: {
          accessed_address_id: string
          accessed_at: string
          action: string
          admin_user_id: string
          customer_user_id: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          accessed_address_id: string
          accessed_at?: string
          action: string
          admin_user_id: string
          customer_user_id: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          accessed_address_id?: string
          accessed_at?: string
          action?: string
          admin_user_id?: string
          customer_user_id?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          postal_code: string
          street: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          postal_code: string
          street: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          postal_code?: string
          street?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_recommendations_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          product_id: string | null
          recommendations: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          product_id?: string | null
          recommendations: Json
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          product_id?: string | null
          recommendations?: Json
          user_id?: string
        }
        Relationships: []
      }
      auto_reorder_subscriptions: {
        Row: {
          created_at: string
          frequency_days: number
          id: string
          is_active: boolean
          next_order_date: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          frequency_days?: number
          id?: string
          is_active?: boolean
          next_order_date: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          frequency_days?: number
          id?: string
          is_active?: boolean
          next_order_date?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: []
      }
      bundle_analytics: {
        Row: {
          bundle_id: string
          created_at: string
          date: string
          id: string
          purchases: number
          revenue: number
          views: number
        }
        Insert: {
          bundle_id: string
          created_at?: string
          date?: string
          id?: string
          purchases?: number
          revenue?: number
          views?: number
        }
        Update: {
          bundle_id?: string
          created_at?: string
          date?: string
          id?: string
          purchases?: number
          revenue?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_analytics_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundle_products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_items: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          variant_id: string
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          variant_id: string
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundle_products"
            referencedColumns: ["id"]
          },
        ]
      }
      bundle_products: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          name: string
          quantity_required: number
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name: string
          quantity_required?: number
          total_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name?: string
          quantity_required?: number
          total_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      cashback_bonuses: {
        Row: {
          bonus_name: string
          bonus_percentage: number
          bonus_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          bonus_name: string
          bonus_percentage: number
          bonus_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          bonus_name?: string
          bonus_percentage?: number
          bonus_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_type: string
          session_id: string
          status: string | null
          updated_at: string
          user_id: string | null
          user_info: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_type: string
          session_id: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          user_info?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_type?: string
          session_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
          user_info?: Json | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          user_info: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          user_info?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          user_info?: Json | null
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          birth_date: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          images: string[] | null
          is_winner: boolean | null
          last_name: string
          message: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
          winner_position: number | null
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          images?: string[] | null
          is_winner?: boolean | null
          last_name: string
          message: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          winner_position?: number | null
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          images?: string[] | null
          is_winner?: boolean | null
          last_name?: string
          message?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          winner_position?: number | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          current_uses: number | null
          discount_type: string
          discount_value: number
          id: string
          max_uses: number | null
          min_order_amount: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          current_uses?: number | null
          discount_type: string
          discount_value: number
          id?: string
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      customer_tiers: {
        Row: {
          base_cashback_bonus: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          min_lifetime_purchases: number | null
          priority: number
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          base_cashback_bonus?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_lifetime_purchases?: number | null
          priority?: number
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          base_cashback_bonus?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_lifetime_purchases?: number | null
          priority?: number
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          perfume_id: string
          updated_at: string
          user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfume_id: string
          updated_at?: string
          user_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfume_id?: string
          updated_at?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number
          points: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_rules: {
        Row: {
          conditions: Json | null
          created_at: string
          id: string
          is_active: boolean
          points_earned: number
          priority: number
          rule_name: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          points_earned: number
          priority?: number
          rule_name: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          points_earned?: number
          priority?: number
          rule_name?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          preferences: Json | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          preferences?: Json | null
          subscribed_at?: string
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          sent_at: string | null
          sent_to_count: number
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          sent_at?: string | null
          sent_to_count?: number
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          sent_at?: string | null
          sent_to_count?: number
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          perfume_id: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          perfume_id: string
          quantity?: number
          total_price: number
          unit_price: number
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          perfume_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          billing_address_data: Json | null
          billing_address_id: string | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string | null
          partner_id: string | null
          shipping_address_data: Json | null
          shipping_address_id: string | null
          status: string
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_address_data?: Json | null
          billing_address_id?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          partner_id?: string | null
          shipping_address_data?: Json | null
          shipping_address_id?: string | null
          status?: string
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_address_data?: Json | null
          billing_address_id?: string | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          partner_id?: string | null
          shipping_address_data?: Json | null
          shipping_address_id?: string | null
          status?: string
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_billing_address_id_fkey"
            columns: ["billing_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_payouts: {
        Row: {
          amount: number
          bank_details: Json
          id: string
          notes: string | null
          partner_id: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: string
        }
        Insert: {
          amount: number
          bank_details: Json
          id?: string
          notes?: string | null
          partner_id: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          amount?: number
          bank_details?: Json
          id?: string
          notes?: string | null
          partner_id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_sales: {
        Row: {
          commission_amount: number
          created_at: string
          id: string
          order_id: string
          partner_id: string
          status: string
        }
        Insert: {
          commission_amount: number
          created_at?: string
          id?: string
          order_id: string
          partner_id: string
          status?: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          id?: string
          order_id?: string
          partner_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sales_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          application_data: Json | null
          approved_at: string | null
          approved_by: string | null
          bank_details: Json | null
          commission_rate: number
          created_at: string
          id: string
          partner_code: string
          status: Database["public"]["Enums"]["partner_status"]
          total_commission: number
          total_paid_out: number
          total_sales: number
          updated_at: string
          user_id: string
        }
        Insert: {
          application_data?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bank_details?: Json | null
          commission_rate?: number
          created_at?: string
          id?: string
          partner_code: string
          status?: Database["public"]["Enums"]["partner_status"]
          total_commission?: number
          total_paid_out?: number
          total_sales?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          application_data?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bank_details?: Json | null
          commission_rate?: number
          created_at?: string
          id?: string
          partner_code?: string
          status?: Database["public"]["Enums"]["partner_status"]
          total_commission?: number
          total_paid_out?: number
          total_sales?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payback_earnings: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          earned_at: string
          guest_email: string | null
          id: string
          order_id: string | null
          percentage: number
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          earned_at?: string
          guest_email?: string | null
          id?: string
          order_id?: string | null
          percentage?: number
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          earned_at?: string
          guest_email?: string | null
          id?: string
          order_id?: string | null
          percentage?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payback_earnings_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payback_payouts: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          bank_details: Json | null
          id: string
          notes: string | null
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          bank_details?: Json | null
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          bank_details?: Json | null
          id?: string
          notes?: string | null
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payback_payouts_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          metric_name: string
          metric_value: number
          page_url: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          metric_name: string
          metric_value: number
          page_url: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          page_url?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          cashback_percentage: number | null
          created_at: string
          description: string | null
          id: string
          in_stock: boolean
          name: string
          original_price: number | null
          preorder: boolean | null
          price: number
          product_id: string
          rating: number | null
          release_date: string | null
          review_count: number | null
          scent_notes: string | null
          stock_quantity: number
          updated_at: string
          variant_number: string
        }
        Insert: {
          cashback_percentage?: number | null
          created_at?: string
          description?: string | null
          id: string
          in_stock?: boolean
          name: string
          original_price?: number | null
          preorder?: boolean | null
          price: number
          product_id: string
          rating?: number | null
          release_date?: string | null
          review_count?: number | null
          scent_notes?: string | null
          stock_quantity?: number
          updated_at?: string
          variant_number: string
        }
        Update: {
          cashback_percentage?: number | null
          created_at?: string
          description?: string | null
          id?: string
          in_stock?: boolean
          name?: string
          original_price?: number | null
          preorder?: boolean | null
          price?: number
          product_id?: string
          rating?: number | null
          release_date?: string | null
          review_count?: number | null
          scent_notes?: string | null
          stock_quantity?: number
          updated_at?: string
          variant_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean
          product_id: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          video_url: string
          view_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          product_id: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url: string
          view_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean
          product_id?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string
          view_count?: number
        }
        Relationships: []
      }
      product_views: {
        Row: {
          id: string
          ip_address: unknown
          product_id: string
          session_id: string | null
          user_id: string | null
          variant_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown
          product_id: string
          session_id?: string | null
          user_id?: string | null
          variant_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown
          product_id?: string
          session_id?: string | null
          user_id?: string | null
          variant_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          category: string
          created_at: string
          default_cashback_percentage: number | null
          id: string
          image: string | null
          name: string
          size: string
          updated_at: string
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          default_cashback_percentage?: number | null
          id: string
          image?: string | null
          name: string
          size: string
          updated_at?: string
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          default_cashback_percentage?: number | null
          id?: string
          image?: string | null
          name?: string
          size?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_access_log: {
        Row: {
          accessed_at: string
          accessed_profile_id: string
          action: string
          admin_justification: string | null
          admin_user_id: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_profile_id: string
          action: string
          admin_justification?: string | null
          admin_user_id: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_profile_id?: string
          action?: string
          admin_justification?: string | null
          admin_user_id?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: []
      }
      profile_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          customer_tier_id: string | null
          full_name: string | null
          id: string
          payback_balance: number | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_tier_id?: string | null
          full_name?: string | null
          id: string
          payback_balance?: number | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_tier_id?: string | null
          full_name?: string | null
          id?: string
          payback_balance?: number | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_customer_tier_id_fkey"
            columns: ["customer_tier_id"]
            isOneToOne: false
            referencedRelation: "customer_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: string
          subscription_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscription_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subscription_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_events: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_id?: string | null
        }
        Relationships: []
      }
      returns: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          images: string[] | null
          order_id: string | null
          reason: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          order_id?: string | null
          reason: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          order_id?: string | null
          reason?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          helpful_count: number | null
          id: string
          images: string[] | null
          is_verified: boolean | null
          order_id: string | null
          perfume_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          variant_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          order_id?: string | null
          perfume_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          variant_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          order_id?: string | null
          perfume_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stock_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean
          product_id: string
          user_id: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean
          product_id: string
          user_id?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
          product_id?: string
          user_id?: string | null
          variant_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      wishlist_shares: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_public: boolean
          share_code: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean
          share_code: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean
          share_code?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_loyalty_points: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
      check_verified_purchase: {
        Args: { user_id_param: string; variant_id_param: string }
        Returns: boolean
      }
      clean_expired_ai_cache: { Args: never; Returns: undefined }
      cleanup_old_security_logs: { Args: never; Returns: undefined }
      generate_order_number: { Args: never; Returns: string }
      generate_partner_code: { Args: never; Returns: string }
      get_public_reviews: {
        Args: { p_perfume_id: string; p_variant_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          images: string[]
          is_verified: boolean
          rating: number
          reviewer_name: string
          title: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      log_security_event: {
        Args: { p_details?: Json; p_event_type: string; p_severity?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      partner_status: "pending" | "approved" | "rejected" | "suspended"
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
      app_role: ["admin", "user"],
      partner_status: ["pending", "approved", "rejected", "suspended"],
    },
  },
} as const
