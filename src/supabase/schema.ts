export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
          puntaje: number | null
          room_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
          puntaje?: number | null
          room_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
          puntaje?: number | null
          room_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_room_name_fkey"
            columns: ["room_name"]
            referencedRelation: "rooms"
            referencedColumns: ["name"]
          }
        ]
      }
      rooms: {
        Row: {
          created_at: string | null
          host: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          host?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          host?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_host_fkey"
            columns: ["host"]
            referencedRelation: "players"
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

