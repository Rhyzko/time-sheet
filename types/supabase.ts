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
          chargeable: boolean | null
          color: string | null
          id: number
          label: string
          tags: string | null
        }
        Insert: {
          chargeable?: boolean | null
          color?: string | null
          id?: number
          label: string
          tags?: string | null
        }
        Update: {
          chargeable?: boolean | null
          color?: string | null
          id?: number
          label?: string
          tags?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          clientsPreferences: Json[] | null
          email: string | null
          firstName: string | null
          id: string
          lastName: string | null
          role: string | null
        }
        Insert: {
          clientsPreferences?: Json[] | null
          email?: string | null
          firstName?: string | null
          id: string
          lastName?: string | null
          role?: string | null
        }
        Update: {
          clientsPreferences?: Json[] | null
          email?: string | null
          firstName?: string | null
          id?: string
          lastName?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
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
            isOneToOne: false
            referencedRelation: "profiles"
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
