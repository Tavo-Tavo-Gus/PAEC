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
      students: {
        Row: {
          id: string
          name: string
          age: number
          grade: string
          diagnosis: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          grade: string
          diagnosis?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          grade?: string
          diagnosis?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          id: string
          student_id: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          next_dose: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          next_dose: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          user_id?: string
          name?: string
          dosage?: string
          frequency?: string
          next_dose?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_plans: {
        Row: {
          id: string
          student_id: string
          support_needs: string[]
          skills: string[]
          triggers: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          support_needs?: string[]
          skills?: string[]
          triggers?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          support_needs?: string[]
          skills?: string[]
          triggers?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          student_id: string
          title: string
          type: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          type: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          type?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      function_security_audit: {
        Row: {
          schema_name: string
          function_name: string
          is_security_definer: boolean
          has_search_path_set: boolean
          search_path_value: string
          security_status: 'SECURE' | 'VULNERABLE' | 'NEEDS_REVIEW'
          function_signature: string
        }
        Relationships: []
      }
    }
    Functions: {
      detect_mutable_search_path_functions: {
        Args: Record<string, never>
        Returns: {
          function_name: string
          function_schema: string
          has_search_path_set: boolean
          current_search_path: string
          security_risk: string
        }[]
      }
      validate_search_path_security: {
        Args: Record<string, never>
        Returns: {
          check_name: string
          status: string
          details: string
          recommendation: string
        }[]
      }
      fix_function_search_paths: {
        Args: Record<string, never>
        Returns: unknown[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}