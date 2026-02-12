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
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          is_premium: boolean
          premium_expires_at: string | null
          subscription_platform: string | null
          delivery_enabled: boolean
          delivery_time: string
          delivery_method: string
          phone_number: string | null
          timezone: string
          expo_push_token: string | null
          jokes_generated_today: number
          last_joke_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          subscription_platform?: string | null
          delivery_enabled?: boolean
          delivery_time?: string
          delivery_method?: string
          phone_number?: string | null
          timezone?: string
          expo_push_token?: string | null
          jokes_generated_today?: number
          last_joke_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          premium_expires_at?: string | null
          subscription_platform?: string | null
          delivery_enabled?: boolean
          delivery_time?: string
          delivery_method?: string
          phone_number?: string | null
          timezone?: string
          expo_push_token?: string | null
          jokes_generated_today?: number
          last_joke_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jokes: {
        Row: {
          id: string
          user_id: string
          content: string
          topic: string | null
          joke_type: string | null
          category: string | null
          model_used: string | null
          tokens_used: number | null
          cost_usd: number | null
          user_rating: number | null
          favorited: boolean
          shared: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          topic?: string | null
          joke_type?: string | null
          category?: string | null
          model_used?: string | null
          tokens_used?: number | null
          cost_usd?: number | null
          user_rating?: number | null
          favorited?: boolean
          shared?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          topic?: string | null
          joke_type?: string | null
          category?: string | null
          model_used?: string | null
          tokens_used?: number | null
          cost_usd?: number | null
          user_rating?: number | null
          favorited?: boolean
          shared?: boolean
          created_at?: string
        }
      }
    }
  }
}
