export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  | TimeRow[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: number
          label: string
        }
        Insert: {
          id?: number
          label: string
        }
        Update: {
          id?: number
          label?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          clientId: number
          id: number
          label: string
        }
        Insert: {
          clientId: number
          id?: number
          label: string
        }
        Update: {
          clientId?: number
          id?: number
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_clientId_fkey"
            columns: ["clientId"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
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
          label?: string | null
          userId?: string | null
        }
        Update: {
          content?: Json | null
          id?: number
          label?: string | null
          userId?: string | null
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
