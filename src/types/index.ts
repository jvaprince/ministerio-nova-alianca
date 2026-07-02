// ============================================
// MINISTÉRIO NOVA ALIANÇA — TIPOS COMPLETOS
// ============================================

export interface Profile {
  id: string
  name: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  favorite_verse: string | null
  favorite_verse_ref: string | null
  role: 'admin' | 'leader' | 'member'
  joined_at: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  content: string | null
  media_url: string | null
  media_type: 'image' | 'video' | 'audio' | null
  post_type: 'post' | 'testimony' | 'announcement' | 'worship_banner' | 'palavra_do_dia'
  is_approved: boolean
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  author?: Profile
  user_liked?: boolean
}

export interface PostComment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: Profile
}

export interface PalavraDodia {
  id: string
  responsible_id: string
  scheduled_date: string
  verse: string | null
  verse_ref: string | null
  verse_book: string | null
  verse_chapter: number | null
  verse_number: number | null
  reflection: string | null
  video_url: string | null
  audio_url: string | null
  is_published: boolean
  devotional_count: number
  praying_count: number
  created_at: string
  updated_at: string
  responsible?: Profile
  user_devotional?: boolean
  user_praying?: boolean
  user_liked?: boolean
}

export interface Event {
  id: string
  created_by: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  event_type: 'culto' | 'vigilia' | 'evangelismo' | 'social' | 'general' | 'louvor'
  cover_url: string | null
  created_at: string
  creator?: Profile
  participants?: EventParticipant[]
  participant_count?: number
  user_status?: 'going' | 'maybe' | 'not_going' | null
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'maybe' | 'not_going'
  created_at: string
  user?: Profile
}

export interface Louvor {
  id: string
  created_by: string
  title: string
  artist: string | null
  youtube_url: string | null
  lyrics: string | null
  culto_date: string | null
  likes_count: number
  listened_count: number
  created_at: string
  creator?: Profile
  user_liked?: boolean
  user_listened?: boolean
}

export interface PrayerRequest {
  id: string
  author_id: string
  title: string
  description: string | null
  category: 'familia' | 'trabalho' | 'saude' | 'estudos' | 'relacionamento' | 'ministerio' | 'general'
  is_answered: boolean
  is_anonymous: boolean
  praying_count: number
  created_at: string
  updated_at: string
  author?: Profile
  user_praying?: boolean
}

export interface SocialProject {
  id: string
  created_by: string
  title: string
  description: string | null
  project_date: string | null
  status: 'planned' | 'active' | 'completed'
  cover_url: string | null
  final_report: string | null
  participants_count: number
  created_at: string
  updated_at: string
  creator?: Profile
  participants?: ProjectParticipant[]
  photos?: ProjectPhoto[]
}

export interface ProjectParticipant {
  id: string
  project_id: string
  user_id: string
  created_at: string
  user?: Profile
}

export interface ProjectPhoto {
  id: string
  project_id: string
  url: string
  caption: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export interface BibleHighlight {
  id: string
  user_id: string
  book: string
  chapter: number
  verse: number
  verse_text: string
  color: string
  note: string | null
  created_at: string
}

export interface PalavraScale {
  id: string
  user_id: string
  scheduled_date: string
  notified: boolean
  created_at: string
  user?: Profile
}

// ============================================
// DATABASE TYPES (para Supabase client)
// ============================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string; name: string }
        Update: Partial<Profile>
      }
      posts: {
        Row: Omit<Post, 'author' | 'user_liked'>
        Insert: Partial<Omit<Post, 'id' | 'author' | 'user_liked' | 'created_at' | 'updated_at'>> & { author_id: string }
        Update: Partial<Omit<Post, 'id' | 'author' | 'user_liked'>>
      }
      post_likes: {
        Row: { id: string; post_id: string; user_id: string; created_at: string }
        Insert: { post_id: string; user_id: string }
        Update: never
      }
      post_comments: {
        Row: Omit<PostComment, 'author'>
        Insert: { post_id: string; author_id: string; content: string }
        Update: { content?: string }
      }
      palavra_do_dia: {
        Row: Omit<PalavraDodia, 'responsible' | 'user_devotional' | 'user_praying' | 'user_liked'>
        Insert: Partial<Omit<PalavraDodia, 'id' | 'responsible' | 'user_devotional' | 'user_praying' | 'user_liked' | 'created_at' | 'updated_at'>> & { responsible_id: string; scheduled_date: string }
        Update: Partial<Omit<PalavraDodia, 'id' | 'responsible' | 'user_devotional' | 'user_praying' | 'user_liked'>>
      }
      palavra_interactions: {
        Row: { id: string; palavra_id: string; user_id: string; type: 'devotional' | 'praying' | 'like'; created_at: string }
        Insert: { palavra_id: string; user_id: string; type: 'devotional' | 'praying' | 'like' }
        Update: never
      }
      palavra_scale: {
        Row: Omit<PalavraScale, 'user'>
        Insert: { user_id: string; scheduled_date: string }
        Update: { notified?: boolean }
      }
      events: {
        Row: Omit<Event, 'creator' | 'participants' | 'participant_count' | 'user_status'>
        Insert: Partial<Omit<Event, 'id' | 'creator' | 'participants' | 'participant_count' | 'user_status' | 'created_at'>> & { created_by: string; title: string; event_date: string }
        Update: Partial<Omit<Event, 'id' | 'creator' | 'participants' | 'participant_count' | 'user_status'>>
      }
      event_participants: {
        Row: Omit<EventParticipant, 'user'>
        Insert: { event_id: string; user_id: string; status?: 'going' | 'maybe' | 'not_going' }
        Update: { status?: 'going' | 'maybe' | 'not_going' }
      }
      louvores: {
        Row: Omit<Louvor, 'creator' | 'user_liked' | 'user_listened'>
        Insert: Partial<Omit<Louvor, 'id' | 'creator' | 'user_liked' | 'user_listened' | 'created_at'>> & { created_by: string; title: string }
        Update: Partial<Omit<Louvor, 'id' | 'creator' | 'user_liked' | 'user_listened'>>
      }
      louvor_interactions: {
        Row: { id: string; louvor_id: string; user_id: string; type: 'like' | 'listened'; created_at: string }
        Insert: { louvor_id: string; user_id: string; type: 'like' | 'listened' }
        Update: never
      }
      prayer_requests: {
        Row: Omit<PrayerRequest, 'author' | 'user_praying'>
        Insert: Partial<Omit<PrayerRequest, 'id' | 'author' | 'user_praying' | 'created_at' | 'updated_at'>> & { author_id: string; title: string }
        Update: Partial<Omit<PrayerRequest, 'id' | 'author' | 'user_praying'>>
      }
      prayer_interactions: {
        Row: { id: string; prayer_id: string; user_id: string; type: 'praying' | 'comment'; content: string | null; created_at: string }
        Insert: { prayer_id: string; user_id: string; type: 'praying' | 'comment'; content?: string }
        Update: never
      }
      social_projects: {
        Row: Omit<SocialProject, 'creator' | 'participants' | 'photos'>
        Insert: Partial<Omit<SocialProject, 'id' | 'creator' | 'participants' | 'photos' | 'created_at' | 'updated_at'>> & { created_by: string; title: string }
        Update: Partial<Omit<SocialProject, 'id' | 'creator' | 'participants' | 'photos'>>
      }
      project_participants: {
        Row: Omit<ProjectParticipant, 'user'>
        Insert: { project_id: string; user_id: string }
        Update: never
      }
      project_photos: {
        Row: ProjectPhoto
        Insert: { project_id: string; url: string; caption?: string }
        Update: { caption?: string }
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: { is_read?: boolean }
      }
      bible_highlights: {
        Row: BibleHighlight
        Insert: Omit<BibleHighlight, 'id' | 'created_at'>
        Update: { color?: string; note?: string }
      }
    }
    Views: Record<string, never>
    Functions: {
      validate_invite_token: {
        Args: { p_token: string }
        Returns: { valid: boolean; name?: string; message?: string }
      }
      link_pending_profile: {
        Args: { p_user_id: string; p_invite_token: string }
        Returns: { success: boolean; name?: string; error?: string }
      }
      decrement_palavra_count: {
        Args: { p_palavra_id: string; p_type: string }
        Returns: void
      }
      increment_palavra_count: {
        Args: { p_palavra_id: string; p_type: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
  }
}

export interface PendingProfile {
  id: string
  name: string
  invite_token: string
  role: 'admin' | 'leader' | 'member'
  is_linked: boolean
  linked_at: string | null
  linked_user_id: string | null
  created_at: string
}
