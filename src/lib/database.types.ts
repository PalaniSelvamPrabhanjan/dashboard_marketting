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
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          role?: string
          created_at?: string
        }
      }
      platform_stats: {
        Row: {
          id: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          period_start: string
          period_end: string
          total_likes: number
          total_views: number
          total_comments: number
          total_posts: number
          received_at: string
          signature_verified: boolean
        }
        Insert: {
          id?: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          period_start: string
          period_end: string
          total_likes?: number
          total_views?: number
          total_comments?: number
          total_posts?: number
          received_at?: string
          signature_verified?: boolean
        }
        Update: {
          id?: string
          platform?: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          period_start?: string
          period_end?: string
          total_likes?: number
          total_views?: number
          total_comments?: number
          total_posts?: number
          received_at?: string
          signature_verified?: boolean
        }
      }
      top_posts: {
        Row: {
          id: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          post_id: string
          likes: number
          views: number
          comments: number
          created_at: string
          received_at: string
        }
        Insert: {
          id?: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          post_id: string
          likes?: number
          views?: number
          comments?: number
          created_at?: string
          received_at?: string
        }
        Update: {
          id?: string
          platform?: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          post_id?: string
          likes?: number
          views?: number
          comments?: number
          created_at?: string
          received_at?: string
        }
      }
      activity_calendar: {
        Row: {
          id: string
          date: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe' | 'all'
          event_type: string
          event_count: number
          color_code: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe' | 'all'
          event_type: string
          event_count?: number
          color_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          platform?: 'fb-dupe' | 'tw-dupe' | 'tt-dupe' | 'all'
          event_type?: string
          event_count?: number
          color_code?: string
          created_at?: string
        }
      }
      scheduled_posts: {
        Row: {
          id: string
          user_id: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          content: string
          media_url: string | null
          scheduled_time: string
          status: 'pending' | 'published' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          content: string
          media_url?: string | null
          scheduled_time: string
          status?: 'pending' | 'published' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'fb-dupe' | 'tw-dupe' | 'tt-dupe'
          content?: string
          media_url?: string | null
          scheduled_time?: string
          status?: 'pending' | 'published' | 'failed'
          created_at?: string
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
