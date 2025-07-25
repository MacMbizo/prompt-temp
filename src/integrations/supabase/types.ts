export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id: string
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_submissions: {
        Row: {
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderator_notes: string | null
          prompt_id: string
          status: string
          submission_reason: string | null
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderator_notes?: string | null
          prompt_id: string
          status?: string
          submission_reason?: string | null
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderator_notes?: string | null
          prompt_id?: string
          status?: string
          submission_reason?: string | null
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_submissions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_history: {
        Row: {
          copied_at: string
          id: string
          platform_used: string | null
          prompt_id: string
          user_id: string
        }
        Insert: {
          copied_at?: string
          id?: string
          platform_used?: string | null
          prompt_id: string
          user_id: string
        }
        Update: {
          copied_at?: string
          id?: string
          platform_used?: string | null
          prompt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_history_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          is_trusted: boolean | null
          reputation_score: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_trusted?: boolean | null
          reputation_score?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_trusted?: boolean | null
          reputation_score?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      prompt_ratings: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean | null
          prompt_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful?: boolean | null
          prompt_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean | null
          prompt_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_ratings_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          average_rating: number | null
          category: string
          prompt_text: string
          copy_count: number | null
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          is_community: boolean | null
          is_featured: boolean | null
          is_template: boolean | null
          platforms: string[] | null
          rating_count: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          usage_count: number | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          prompt_text: string
          copy_count?: number | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_community?: boolean | null
          is_featured?: boolean | null
          is_template?: boolean | null
          platforms?: string[] | null
          rating_count?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          prompt_text?: string
          copy_count?: number | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_community?: boolean | null
          is_featured?: boolean | null
          is_template?: boolean | null
          platforms?: string[] | null
          rating_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          name: string
          query: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          name: string
          query: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string
          query?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          query: string
          result_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          query: string
          result_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string
          result_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_audit_event: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id: string
          p_details?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      get_prompts_by_search_term:
        {
          Args: {
            search_term: string
          }
          Returns: {
            category_id: string | null
            prompt_text: string
            created_at: string
            description: string | null
            folder_id: string | null
            id: string
            is_private: boolean
            name: string
            optimized_count: number
            platform_id: string | null
            share_count: number
            slug: string
            updated_at: string
            user_id: string
            variable_names: Json | null
            view_count: number
          }[]
        }
      get_prompts_for_user:
        {
          Args: {
            user_id: string
          }
          Returns: {
            category_id: string | null
            prompt_text: string
            created_at: string
            description: string | null
            folder_id: string | null
            id: string
            is_private: boolean
            name: string
            optimized_count: number
            platform_id: string | null
            share_count: number
            slug: string
            updated_at: string
            user_id: string
            variable_names: Json | null
            view_count: number
          }[]
        }
      get_public_prompts:
        {
          Args: Record<PropertyKey, never>
          Returns: {
            category_id: string | null
            prompt_text: string
            created_at: string
            description: string | null
            folder_id: string | null
            id: string
            is_private: boolean
            name: string
            optimized_count: number
            platform_id: string | null
            share_count: number
            slug: string
            updated_at: string
            user_id: string
            variable_names: Json | null
            view_count: number
          }[]
        }
      search_prompts:
        {
          Args: {
            query: string
          }
          Returns: {
            category_id: string | null
            prompt_text: string
            created_at: string
            description: string | null
            folder_id: string | null
            id: string
            is_private: boolean
            name: string
            optimized_count: number
            platform_id: string | null
            share_count: number
            slug: string
            updated_at: string
            user_id: string
            variable_names: Json | null
            view_count: number
          }[]
        }
      add_to_search_history: {
        Args: {
          p_query: string
          p_filters?: Json
          p_result_count?: number
        }
        Returns: undefined
      }
      get_recent_searches: {
        Args: {
          p_limit?: number
        }
        Returns: {
          query: string
          filters: Json | null
          created_at: string
          result_count: number | null
        }[]
      }
      get_popular_searches: {
        Args: {
          p_limit?: number
        }
        Returns: {
          query: string
          search_count: number
        }[]
      }
      cleanup_old_search_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export interface PromptVariable {
  name: string;
  description: string;
  type: 'text' | 'select' | 'number';
  defaultValue?: string;
  options?: string[];
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  category: string;
  tags: string[];
  platforms: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  variables: PromptVariable[];
  is_template: boolean;
  folder_id: string | null;
  is_community: boolean;
  copy_count: number;
  average_rating: number | null;
  rating_count: number;
  is_featured: boolean;
  status: string;
  usage_count: number;
  current_version: number;
  version_count: number;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  title: string;
  description: string;
  prompt_text: string;
  category: string;
  tags: string[];
  platforms: string[];
  variables: PromptVariable[];
  change_summary: string | null;
  created_at: string;
  created_by: string;
}

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never



export const Constants = {
  public: {
    Enums: {},
  },
} as const
