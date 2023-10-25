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
      clients: {
        Row: {
          id: number
          label: string
          tags: string | null
        }
        Insert: {
          id?: number
          label: string
          tags?: string | null
        }
        Update: {
          id?: number
          label?: string
          tags?: string | null
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          content: Json | null
          id: number
          label: string
          userId: string
        }
        Insert: {
          content?: Json | null
          id?: number
          label: string
          userId: string
        }
        Update: {
          content?: Json | null
          id?: number
          label?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_userId_fkey"
            columns: ["userId"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
