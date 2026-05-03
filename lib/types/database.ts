/**
 * Database type definitions.
 *
 * These types match the schema in supabase/schema.sql. Once the project
 * is connected to Supabase you should regenerate them with:
 *
 *   npx supabase gen types typescript \
 *     --project-id <your-project-ref> > lib/types/database.ts
 *
 * The hand-written shape below is good enough to compile against until the
 * Supabase CLI is set up.
 */

export type UserRole = 'admin' | 'teacher' | 'student'
export type SessionStatus = 'in-progress' | 'completed' | 'abandoned'

export type GradeLevel =
  | '3ème année collège'
  | 'Tronc commun scientifique'
  | '1ère année Baccalauréat – Sciences expérimentales'
  | '1ère année Baccalauréat – Sciences mathématiques'

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }

      student_profiles: {
        Row: {
          user_id: string
          full_name: string | null
          age: number | null
          gender: 'Male' | 'Female' | '' | null
          teacher_id: string | null
          teacher_name: string | null
          school_name: string | null
          grade_level: GradeLevel | null
          academic_track: string | null
          academic_year: string | null
          math_average_2024_2025: number | null
          math_average_2025_2026: number | null
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['student_profiles']['Row'],
          'updated_at'
        > & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>
      }

      tests: {
        Row: {
          id: string
          name: string
          domain: string
          description: string | null
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          domain: string
          description?: string | null
          metadata?: Json
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['tests']['Insert']>
      }

      questions: {
        Row: {
          id: string
          test_id: string
          external_id: string
          prompt: string | null
          options: Json
          correct_answer: Json | null
          competencies: string[]
          position: number | null
          metadata: Json
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id'> & {
          id?: string
        }
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }

      test_sessions: {
        Row: {
          id: string
          user_id: string
          test_id: string
          status: SessionStatus
          started_at: string
          completed_at: string | null
          total_ms: number | null
          score: number | null
          correct_count: number | null
          total_questions: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_id: string
          status?: SessionStatus
          started_at?: string
          completed_at?: string | null
          total_ms?: number | null
          score?: number | null
          correct_count?: number | null
          total_questions?: number | null
          metadata?: Json
        }
        Update: Partial<Database['public']['Tables']['test_sessions']['Insert']>
      }

      trial_results: {
        Row: {
          id: number
          session_id: string
          question_index: number
          question_id: string
          selected: Json
          free_text: string | null
          correct: boolean
          score: number
          reaction_time_ms: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trial_results']['Row'], 'id' | 'created_at'> & {
          id?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['trial_results']['Insert']>
      }

      metrics: {
        Row: {
          user_id: string
          test_id: string
          period: string
          attempts: number
          best_score: number | null
          avg_score: number | null
          last_attempt: string | null
          updated_at: string
        }
        Insert: Database['public']['Tables']['metrics']['Row']
        Update: Partial<Database['public']['Tables']['metrics']['Row']>
      }
    }
    Views: {
      my_students: {
        Row: {
          user_id: string
          full_name: string | null
          email: string
          grade_level: GradeLevel | null
          math_average_2024_2025: number | null
          math_average_2025_2026: number | null
          teacher_id: string | null
        }
      }
    }
    Functions: {
      role_of: { Args: { uid: string }; Returns: UserRole }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_teacher: { Args: Record<string, never>; Returns: boolean }
      is_my_student: { Args: { student: string }; Returns: boolean }
    }
    Enums: {
      user_role: UserRole
      session_status: SessionStatus
      grade_level: GradeLevel
    }
  }
}
