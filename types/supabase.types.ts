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
      }
      medications: {
        Row: {
          id: string
          student_id: string
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
          name?: string
          dosage?: string
          frequency?: string
          next_dose?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}