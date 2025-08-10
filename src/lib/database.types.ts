export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personas: {
        Row: {
          constraints: string | null
          created_at: string
          description: string | null
          expertise: string[]
          id: string
          is_favorite: boolean
          name: string
          role: string | null
          system_prompt: string | null
          tone: string | null
          updated_at: string
          use_count: number
          user_id: string
        }
        Insert: {
          constraints?: string | null
          created_at?: string
          description?: string | null
          expertise?: string[]
          id?: string
          is_favorite?: boolean
          name: string
          role?: string | null
          system_prompt?: string | null
          tone?: string | null
          updated_at?: string
          use_count?: number
          user_id: string
        }
        Update: {
          constraints?: string | null
          created_at?: string
          description?: string | null
          expertise?: string[]
          id?: string
          is_favorite?: boolean
          name?: string
          role?: string | null
          system_prompt?: string | null
          tone?: string | null
          updated_at?: string
          use_count?: number
          user_id?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          content: string
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          is_favorite: boolean
          is_template: boolean
          last_used: string | null
          persona_id: string | null
          position: number
          tags: string[]
          title: string
          updated_at: string
          use_count: number
          user_id: string
          variables: Json
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean
          is_template?: boolean
          last_used?: string | null
          persona_id?: string | null
          position?: number
          tags?: string[]
          title: string
          updated_at?: string
          use_count?: number
          user_id: string
          variables?: Json
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean
          is_template?: boolean
          last_used?: string | null
          persona_id?: string | null
          position?: number
          tags?: string[]
          title?: string
          updated_at?: string
          use_count?: number
          user_id?: string
          variables?: Json
        }
        Relationships: []
      }
      prompt_usage: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          prompt_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          prompt_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          prompt_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          last_active: string
          name: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          last_active?: string
          name?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          last_active?: string
          name?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_prompt_usage: {
        Args: {
          prompt_id: string
        }
        Returns: void
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export interface Prompt extends Tables<'prompts'> {
  folder?: Pick<Tables<'folders'>, 'id' | 'name' | 'color'> | null
  persona?: Pick<Tables<'personas'>, 'id' | 'name' | 'role'> | null
}

export interface Folder extends Tables<'folders'> {
  prompt_count?: number
}

export interface Persona extends Tables<'personas'> {
  prompt_count?: number
}

export interface PromptVariable {
  name: string
  type: 'text' | 'textarea' | 'select' | 'number'
  default?: string
  options?: string[]
  description?: string
  required?: boolean
}
