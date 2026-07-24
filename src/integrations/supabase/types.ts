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
      admin_activity_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip: string | null
          metadata: Json
          summary: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          summary?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          summary?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          is_global: boolean
          link_url: string | null
          read_by: string[]
          target_user_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean
          link_url?: string | null
          read_by?: string[]
          target_user_id?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_global?: boolean
          link_url?: string | null
          read_by?: string[]
          target_user_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_cache: {
        Row: {
          ai_content: Json | null
          cost_credits: number
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          language: string
          model: string | null
          module: string
          prompt_version: string
          provider: string | null
          record_id: string
          record_type: string
          request_hash: string | null
          status: string
          tokens_in: number
          tokens_out: number
          updated_at: string
        }
        Insert: {
          ai_content?: Json | null
          cost_credits?: number
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          language?: string
          model?: string | null
          module: string
          prompt_version?: string
          provider?: string | null
          record_id: string
          record_type: string
          request_hash?: string | null
          status?: string
          tokens_in?: number
          tokens_out?: number
          updated_at?: string
        }
        Update: {
          ai_content?: Json | null
          cost_credits?: number
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          language?: string
          model?: string | null
          module?: string
          prompt_version?: string
          provider?: string | null
          record_id?: string
          record_type?: string
          request_hash?: string | null
          status?: string
          tokens_in?: number
          tokens_out?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_daily: {
        Row: {
          count: number
          created_at: string
          feature_key: string
          id: string
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          feature_key: string
          id?: string
          updated_at?: string
          usage_date: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          feature_key?: string
          id?: string
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          feature_key: string
          id: string
          ip: unknown
          metadata: Json | null
          question_id: string | null
          used_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          feature_key: string
          id?: string
          ip?: unknown
          metadata?: Json | null
          question_id?: string | null
          used_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          feature_key?: string
          id?: string
          ip?: unknown
          metadata?: Json | null
          question_id?: string | null
          used_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_zh: string | null
          id: string
          is_active: boolean
          name_en: string
          name_zh: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          id?: string
          is_active?: boolean
          name_en: string
          name_zh: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          id?: string
          is_active?: boolean
          name_en?: string
          name_zh?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          allow_comments: boolean
          author_id: string | null
          category: string | null
          category_id: string | null
          content: string
          content_en: string | null
          content_zh: string | null
          cover_alt_en: string | null
          cover_alt_zh: string | null
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          excerpt_en: string | null
          excerpt_zh: string | null
          featured: boolean
          id: string
          meta_description_en: string | null
          meta_description_zh: string | null
          og_image_url: string | null
          published_at: string | null
          reading_time: number | null
          scheduled_at: string | null
          seo_description: string | null
          seo_title: string | null
          seo_title_en: string | null
          seo_title_zh: string | null
          slug: string
          slug_en: string | null
          sort_order: number
          status: string
          tags: string[]
          title: string
          title_en: string | null
          title_zh: string | null
          updated_at: string
          views: number
        }
        Insert: {
          allow_comments?: boolean
          author_id?: string | null
          category?: string | null
          category_id?: string | null
          content?: string
          content_en?: string | null
          content_zh?: string | null
          cover_alt_en?: string | null
          cover_alt_zh?: string | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          excerpt_zh?: string | null
          featured?: boolean
          id?: string
          meta_description_en?: string | null
          meta_description_zh?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          seo_title_en?: string | null
          seo_title_zh?: string | null
          slug: string
          slug_en?: string | null
          sort_order?: number
          status?: string
          tags?: string[]
          title: string
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
          views?: number
        }
        Update: {
          allow_comments?: boolean
          author_id?: string | null
          category?: string | null
          category_id?: string | null
          content?: string
          content_en?: string | null
          content_zh?: string | null
          cover_alt_en?: string | null
          cover_alt_zh?: string | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          excerpt_en?: string | null
          excerpt_zh?: string | null
          featured?: boolean
          id?: string
          meta_description_en?: string | null
          meta_description_zh?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          seo_title_en?: string | null
          seo_title_zh?: string | null
          slug?: string
          slug_en?: string | null
          sort_order?: number
          status?: string
          tags?: string[]
          title?: string
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name_en: string
          name_zh: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en: string
          name_zh: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string
          name_zh?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          cover_image_url: string | null
          created_at: string
          details: Json
          id: string
          is_visible: boolean
          slug: string
          sort_order: number
          summary: string | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          details?: Json
          id?: string
          is_visible?: boolean
          slug: string
          sort_order?: number
          summary?: string | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          details?: Json
          id?: string
          is_visible?: boolean
          slug?: string
          sort_order?: number
          summary?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          category: string | null
          created_at: string
          duration_seconds: number | null
          exam_slug: string
          id: string
          passed: boolean
          score: number
          session_id: string | null
          total: number
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          duration_seconds?: number | null
          exam_slug: string
          id?: string
          passed?: boolean
          score?: number
          session_id?: string | null
          total?: number
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          duration_seconds?: number | null
          exam_slug?: string
          id?: string
          passed?: boolean
          score?: number
          session_id?: string | null
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          bucket: string
          created_at: string
          height: number | null
          id: string
          is_public: boolean
          mime_type: string | null
          name: string
          path: string
          size_bytes: number | null
          tags: string[]
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          bucket?: string
          created_at?: string
          height?: number | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          name: string
          path: string
          size_bytes?: number | null
          tags?: string[]
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          bucket?: string
          created_at?: string
          height?: number | null
          id?: string
          is_public?: boolean
          mime_type?: string | null
          name?: string
          path?: string
          size_bytes?: number | null
          tags?: string[]
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          country: string | null
          created_at: string
          id: number
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: number
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: number
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          blocks: Json
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          nav_label: string
          page_type: string
          show_in_admin_shortcut: boolean
          show_in_nav: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          nav_label: string
          page_type?: string
          show_in_admin_shortcut?: boolean
          show_in_nav?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          nav_label?: string
          page_type?: string
          show_in_admin_shortcut?: boolean
          show_in_nav?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          scope: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          scope: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          scope?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      product_modules: {
        Row: {
          category: string | null
          code: string
          config: Json
          created_at: string
          enabled: boolean
          icon: string | null
          id: string
          name: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          config?: Json
          created_at?: string
          enabled?: boolean
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          config?: Json
          created_at?: string
          enabled?: boolean
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          hero_image_url: string | null
          id: string
          is_visible: boolean
          long_content: Json
          short_desc: string | null
          slug: string
          sort_order: number
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_visible?: boolean
          long_content?: Json
          short_desc?: string | null
          slug: string
          sort_order?: number
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_visible?: boolean
          long_content?: Json
          short_desc?: string | null
          slug?: string
          sort_order?: number
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_bank_nodes: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          include_in_exam: boolean
          is_active: boolean
          legacy_category: string | null
          metadata: Json
          name: string
          name_en: string | null
          node_type: string
          notes: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          include_in_exam?: boolean
          is_active?: boolean
          legacy_category?: string | null
          metadata?: Json
          name: string
          name_en?: string | null
          node_type: string
          notes?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          include_in_exam?: boolean
          is_active?: boolean
          legacy_category?: string | null
          metadata?: Json
          name?: string
          name_en?: string | null
          node_type?: string
          notes?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "question_bank_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_exams: {
        Row: {
          back_href: string | null
          back_label: string | null
          bilingual: boolean
          category: string
          created_at: string
          id: string
          is_active: boolean
          pass_count: number
          sort_order: number
          subtitle: string | null
          time_seconds: number
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          back_href?: string | null
          back_label?: string | null
          bilingual?: boolean
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          pass_count?: number
          sort_order?: number
          subtitle?: string | null
          time_seconds?: number
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          back_href?: string | null
          back_label?: string | null
          bilingual?: boolean
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          pass_count?: number
          sort_order?: number
          subtitle?: string | null
          time_seconds?: number
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          explanation_en: string | null
          google_keywords: string | null
          id: string
          image_url: string | null
          is_active: boolean
          manual_chapter: string | null
          manual_name: string | null
          manual_page: string | null
          manual_url: string | null
          official_source: string | null
          option_a: string
          option_a_en: string | null
          option_b: string
          option_b_en: string | null
          option_c: string | null
          option_c_en: string | null
          option_d: string | null
          option_d_en: string | null
          question: string
          question_bank_id: string | null
          question_en: string | null
          question_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          correct_answer: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          explanation_en?: string | null
          google_keywords?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          manual_chapter?: string | null
          manual_name?: string | null
          manual_page?: string | null
          manual_url?: string | null
          official_source?: string | null
          option_a: string
          option_a_en?: string | null
          option_b: string
          option_b_en?: string | null
          option_c?: string | null
          option_c_en?: string | null
          option_d?: string | null
          option_d_en?: string | null
          question: string
          question_bank_id?: string | null
          question_en?: string | null
          question_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          explanation_en?: string | null
          google_keywords?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          manual_chapter?: string | null
          manual_name?: string | null
          manual_page?: string | null
          manual_url?: string | null
          official_source?: string | null
          option_a?: string
          option_a_en?: string | null
          option_b?: string
          option_b_en?: string | null
          option_c?: string | null
          option_c_en?: string | null
          option_d?: string | null
          option_d_en?: string | null
          question?: string
          question_bank_id?: string | null
          question_en?: string | null
          question_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_bank_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      sb_products: {
        Row: {
          brand: string | null
          category: string
          compat: Json
          cost_price: number | null
          created_at: string
          currency: string
          description_en: string | null
          description_zh: string | null
          id: string
          image_url: string | null
          install_fee: number
          is_sample: boolean
          is_visible: boolean
          list_price: number
          model: string | null
          name_en: string
          name_zh: string
          price_updated_at: string
          slug: string
          sort_order: number
          specs: Json
          stock_status: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          compat?: Json
          cost_price?: number | null
          created_at?: string
          currency?: string
          description_en?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          install_fee?: number
          is_sample?: boolean
          is_visible?: boolean
          list_price?: number
          model?: string | null
          name_en: string
          name_zh: string
          price_updated_at?: string
          slug: string
          sort_order?: number
          specs?: Json
          stock_status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          compat?: Json
          cost_price?: number | null
          created_at?: string
          currency?: string
          description_en?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          install_fee?: number
          is_sample?: boolean
          is_visible?: boolean
          list_price?: number
          model?: string | null
          name_en?: string
          name_zh?: string
          price_updated_at?: string
          slug?: string
          sort_order?: number
          specs?: Json
          stock_status?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sb_settings: {
        Row: {
          contact_email: string
          contact_phone: string | null
          currency: string
          default_service_fee: number
          disclaimer_en: string
          disclaimer_zh: string
          discount_rate: number
          id: number
          margin_rate: number
          proposal_validity_days: number
          tax_rate: number
          updated_at: string
        }
        Insert: {
          contact_email?: string
          contact_phone?: string | null
          currency?: string
          default_service_fee?: number
          disclaimer_en?: string
          disclaimer_zh?: string
          discount_rate?: number
          id?: number
          margin_rate?: number
          proposal_validity_days?: number
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          contact_email?: string
          contact_phone?: string | null
          currency?: string
          default_service_fee?: number
          disclaimer_en?: string
          disclaimer_zh?: string
          discount_rate?: number
          id?: number
          margin_rate?: number
          proposal_validity_days?: number
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      sb_solutions: {
        Row: {
          admin_notes: string | null
          annual_total: number
          assigned_to: string | null
          compat_warnings: Json
          computed: Json
          config: Json
          created_at: string
          created_by: string | null
          currency: string
          customer_budget: string | null
          customer_city: string | null
          customer_email: string | null
          customer_name: string | null
          customer_notes: string | null
          customer_phone: string | null
          customer_timeline: string | null
          deleted_at: string | null
          discount: number
          id: string
          items: Json
          language: string
          monthly_total: number
          one_time_total: number
          organization_name: string | null
          service_fee: number
          share_expires_at: string | null
          share_token: string | null
          solution_number: string
          solution_type: string
          source: string
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          annual_total?: number
          assigned_to?: string | null
          compat_warnings?: Json
          computed?: Json
          config?: Json
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_budget?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          customer_timeline?: string | null
          deleted_at?: string | null
          discount?: number
          id?: string
          items?: Json
          language?: string
          monthly_total?: number
          one_time_total?: number
          organization_name?: string | null
          service_fee?: number
          share_expires_at?: string | null
          share_token?: string | null
          solution_number?: string
          solution_type: string
          source?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          annual_total?: number
          assigned_to?: string | null
          compat_warnings?: Json
          computed?: Json
          config?: Json
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_budget?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          customer_timeline?: string | null
          deleted_at?: string | null
          discount?: number
          id?: string
          items?: Json
          language?: string
          monthly_total?: number
          one_time_total?: number
          organization_name?: string | null
          service_fee?: number
          share_expires_at?: string | null
          share_token?: string | null
          solution_number?: string
          solution_type?: string
          source?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_meta: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          og_image_url: string | null
          path: string
          robots: string
          title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          og_image_url?: string | null
          path: string
          robots?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          og_image_url?: string | null
          path?: string
          robots?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_visible: boolean
          page_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          page_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          page_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_items: {
        Row: {
          button_text: string | null
          button_url: string | null
          category_id: string | null
          content: string | null
          created_at: string
          description: string | null
          external_url: string | null
          html_content: string | null
          icon: string | null
          id: string
          image_url: string | null
          internal_url: string | null
          is_visible: boolean
          link_url: string | null
          page_id: string
          page_title: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          status: string
          subtitle: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          html_content?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          internal_url?: string | null
          is_visible?: boolean
          link_url?: string | null
          page_id: string
          page_title?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          html_content?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          internal_url?: string | null
          is_visible?: boolean
          link_url?: string | null
          page_id?: string
          page_title?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tool_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tool_items"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_plugins: {
        Row: {
          category: string | null
          code: string
          component_key: string
          created_at: string
          default_config: Json
          description: string | null
          enabled: boolean
          icon: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
          version: string
        }
        Insert: {
          category?: string | null
          code: string
          component_key: string
          created_at?: string
          default_config?: Json
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string | null
          code?: string
          component_key?: string
          created_at?: string
          default_config?: Json
          description?: string | null
          enabled?: boolean
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          version?: string
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
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
