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
