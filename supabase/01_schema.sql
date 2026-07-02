-- ============================================================
-- MINISTÉRIO NOVA ALIANÇA — DATABASE SCHEMA COMPLETO
-- Compatível com as interfaces TypeScript (index.ts / index.dois.ts)
-- ============================================================

-- ------------------------------------
-- EXTENSÕES
-- ------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca textual nos versículos/posts


-- ============================================================
-- TABELA: profiles
-- Interface: Profile { id, name, username, avatar_url, bio,
--   favorite_verse, favorite_verse_ref, role, joined_at,
--   created_at, updated_at }
-- ============================================================
CREATE TABLE profiles (
  id              UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name            TEXT        NOT NULL,
  username        TEXT        UNIQUE,
  avatar_url      TEXT,
  bio             TEXT,
  favorite_verse  TEXT,
  favorite_verse_ref TEXT,
  role            TEXT        NOT NULL DEFAULT 'member'
                  CHECK (role IN ('admin', 'leader', 'member')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role     ON profiles(role);


-- ============================================================
-- TABELA: posts
-- Interface: Post { id, author_id, content, media_url,
--   media_type, post_type, is_approved, likes_count,
--   comments_count, created_at, updated_at }
-- ============================================================
CREATE TABLE posts (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT,
  media_url      TEXT,
  media_type     TEXT        CHECK (media_type IN ('image', 'video', 'audio') OR media_type IS NULL),
  post_type      TEXT        NOT NULL DEFAULT 'post'
                 CHECK (post_type IN ('post', 'testimony', 'announcement', 'worship_banner', 'palavra_do_dia')),
  is_approved    BOOLEAN     NOT NULL DEFAULT TRUE,
  likes_count    INTEGER     NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER     NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id  ON posts(author_id);
CREATE INDEX idx_posts_post_type  ON posts(post_type);
CREATE INDEX idx_posts_is_approved ON posts(is_approved);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);


-- ============================================================
-- TABELA: post_likes
-- ============================================================
CREATE TABLE post_likes (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id  ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id  ON post_likes(user_id);


-- ============================================================
-- TABELA: post_comments
-- Interface: PostComment { id, post_id, author_id, content, created_at }
-- ============================================================
CREATE TABLE post_comments (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post_id   ON post_comments(post_id);
CREATE INDEX idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX idx_post_comments_created_at ON post_comments(created_at DESC);


-- ============================================================
-- TABELA: palavra_do_dia
-- Interface: PalavraDodia { id, responsible_id, scheduled_date,
--   verse, verse_ref, verse_book, verse_chapter, verse_number,
--   reflection, video_url, audio_url, is_published,
--   devotional_count, praying_count, created_at, updated_at }
-- ============================================================
CREATE TABLE palavra_do_dia (
  id               UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  responsible_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_date   DATE        NOT NULL UNIQUE,
  verse            TEXT,
  verse_ref        TEXT,
  verse_book       TEXT,
  verse_chapter    INTEGER     CHECK (verse_chapter > 0),
  verse_number     INTEGER     CHECK (verse_number > 0),
  reflection       TEXT,
  video_url        TEXT,
  audio_url        TEXT,
  is_published     BOOLEAN     NOT NULL DEFAULT FALSE,
  devotional_count INTEGER     NOT NULL DEFAULT 0 CHECK (devotional_count >= 0),
  praying_count    INTEGER     NOT NULL DEFAULT 0 CHECK (praying_count >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_palavra_scheduled_date   ON palavra_do_dia(scheduled_date DESC);
CREATE INDEX idx_palavra_responsible_id   ON palavra_do_dia(responsible_id);
CREATE INDEX idx_palavra_is_published     ON palavra_do_dia(is_published);


-- ============================================================
-- TABELA: palavra_interactions
-- type: 'devotional' | 'praying' | 'like'
-- ============================================================
CREATE TABLE palavra_interactions (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  palavra_id UUID        NOT NULL REFERENCES palavra_do_dia(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('devotional', 'praying', 'like')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (palavra_id, user_id, type)
);

CREATE INDEX idx_palavra_interactions_palavra_id ON palavra_interactions(palavra_id);
CREATE INDEX idx_palavra_interactions_user_id    ON palavra_interactions(user_id);


-- ============================================================
-- TABELA: palavra_scale
-- Interface: PalavraScale { id, user_id, scheduled_date,
--   notified, created_at }
-- ============================================================
CREATE TABLE palavra_scale (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_date DATE        NOT NULL UNIQUE,
  notified       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_palavra_scale_user_id        ON palavra_scale(user_id);
CREATE INDEX idx_palavra_scale_scheduled_date ON palavra_scale(scheduled_date);


-- ============================================================
-- TABELA: events
-- Interface: Event { id, created_by, title, description,
--   event_date, event_time, location, event_type,
--   cover_url, created_at }
-- ============================================================
CREATE TABLE events (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  event_date  DATE        NOT NULL,
  event_time  TIME,
  location    TEXT,
  event_type  TEXT        NOT NULL DEFAULT 'general'
              CHECK (event_type IN ('culto', 'vigilia', 'evangelismo', 'social', 'general', 'louvor')),
  cover_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_event_date ON events(event_date DESC);
CREATE INDEX idx_events_event_type ON events(event_type);


-- ============================================================
-- TABELA: event_participants
-- Interface: EventParticipant { id, event_id, user_id,
--   status, created_at }
-- ============================================================
CREATE TABLE event_participants (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status     TEXT        NOT NULL DEFAULT 'going'
             CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id  ON event_participants(user_id);


-- ============================================================
-- TABELA: louvores
-- Interface: Louvor { id, created_by, title, artist,
--   youtube_url, lyrics, culto_date, likes_count,
--   listened_count, created_at }
-- ============================================================
CREATE TABLE louvores (
  id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title          TEXT        NOT NULL,
  artist         TEXT,
  youtube_url    TEXT,
  lyrics         TEXT,
  culto_date     DATE,
  likes_count    INTEGER     NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  listened_count INTEGER     NOT NULL DEFAULT 0 CHECK (listened_count >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_louvores_created_by ON louvores(created_by);
CREATE INDEX idx_louvores_culto_date ON louvores(culto_date DESC);
CREATE INDEX idx_louvores_title      ON louvores USING gin (title gin_trgm_ops);


-- ============================================================
-- TABELA: louvor_interactions
-- type: 'like' | 'listened'
-- ============================================================
CREATE TABLE louvor_interactions (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  louvor_id  UUID        NOT NULL REFERENCES louvores(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('like', 'listened')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (louvor_id, user_id, type)
);

CREATE INDEX idx_louvor_interactions_louvor_id ON louvor_interactions(louvor_id);
CREATE INDEX idx_louvor_interactions_user_id   ON louvor_interactions(user_id);


-- ============================================================
-- TABELA: prayer_requests
-- Interface: PrayerRequest { id, author_id, title, description,
--   category, is_answered, is_anonymous, praying_count,
--   created_at, updated_at }
-- ============================================================
CREATE TABLE prayer_requests (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  description  TEXT,
  category     TEXT        NOT NULL DEFAULT 'general'
               CHECK (category IN ('familia', 'trabalho', 'saude', 'estudos', 'relacionamento', 'ministerio', 'general')),
  is_answered  BOOLEAN     NOT NULL DEFAULT FALSE,
  is_anonymous BOOLEAN     NOT NULL DEFAULT FALSE,
  praying_count INTEGER    NOT NULL DEFAULT 0 CHECK (praying_count >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prayer_requests_author_id   ON prayer_requests(author_id);
CREATE INDEX idx_prayer_requests_category    ON prayer_requests(category);
CREATE INDEX idx_prayer_requests_is_answered ON prayer_requests(is_answered);
CREATE INDEX idx_prayer_requests_created_at  ON prayer_requests(created_at DESC);


-- ============================================================
-- TABELA: prayer_interactions
-- type: 'praying' | 'comment'
-- ============================================================
CREATE TABLE prayer_interactions (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  prayer_id  UUID        NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('praying', 'comment')),
  content    TEXT,        -- obrigatório quando type = 'comment'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prayer_id, user_id, type)
);

CREATE INDEX idx_prayer_interactions_prayer_id ON prayer_interactions(prayer_id);
CREATE INDEX idx_prayer_interactions_user_id   ON prayer_interactions(user_id);

-- Garante que comentários tenham conteúdo
ALTER TABLE prayer_interactions
  ADD CONSTRAINT chk_comment_has_content
  CHECK (type != 'comment' OR (content IS NOT NULL AND content <> ''));


-- ============================================================
-- TABELA: social_projects
-- Interface: SocialProject { id, created_by, title, description,
--   project_date, status, cover_url, final_report,
--   participants_count, created_at, updated_at }
-- ============================================================
CREATE TABLE social_projects (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  description       TEXT,
  project_date      DATE,
  status            TEXT        NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned', 'active', 'completed')),
  cover_url         TEXT,
  final_report      TEXT,
  participants_count INTEGER    NOT NULL DEFAULT 0 CHECK (participants_count >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_projects_created_by   ON social_projects(created_by);
CREATE INDEX idx_social_projects_status       ON social_projects(status);
CREATE INDEX idx_social_projects_project_date ON social_projects(project_date DESC);


-- ============================================================
-- TABELA: project_participants
-- Interface: ProjectParticipant { id, project_id, user_id, created_at }
-- ============================================================
CREATE TABLE project_participants (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID        NOT NULL REFERENCES social_projects(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE INDEX idx_project_participants_project_id ON project_participants(project_id);
CREATE INDEX idx_project_participants_user_id    ON project_participants(user_id);


-- ============================================================
-- TABELA: project_photos
-- Interface: ProjectPhoto { id, project_id, url, caption, created_at }
-- ============================================================
CREATE TABLE project_photos (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID        NOT NULL REFERENCES social_projects(id) ON DELETE CASCADE,
  url        TEXT        NOT NULL,
  caption    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);


-- ============================================================
-- TABELA: notifications
-- Interface: Notification { id, user_id, type, title,
--   message, link, is_read, created_at }
-- ============================================================
CREATE TABLE notifications (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  message    TEXT,
  link       TEXT,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_is_read    ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);


-- ============================================================
-- TABELA: bible_highlights
-- Interface: BibleHighlight { id, user_id, book, chapter,
--   verse, verse_text, color, note, created_at }
-- ============================================================
CREATE TABLE bible_highlights (
  id         UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book       TEXT        NOT NULL,
  chapter    INTEGER     NOT NULL CHECK (chapter > 0),
  verse      INTEGER     NOT NULL CHECK (verse > 0),
  verse_text TEXT        NOT NULL,
  color      TEXT        NOT NULL DEFAULT 'yellow'
             CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'purple', 'orange')),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bible_highlights_user_id       ON bible_highlights(user_id);
CREATE INDEX idx_bible_highlights_book_chapter  ON bible_highlights(user_id, book, chapter);
-- Impede duplicação do mesmo versículo com a mesma cor por usuário
CREATE UNIQUE INDEX idx_bible_highlights_unique ON bible_highlights(user_id, book, chapter, verse);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE palavra_do_dia     ENABLE ROW LEVEL SECURITY;
ALTER TABLE palavra_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE palavra_scale      ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE louvores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE louvor_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_highlights   ENABLE ROW LEVEL SECURITY;


-- ---- profiles ----
CREATE POLICY "profiles: leitura autenticados"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles: inserção própria"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: atualização própria"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);


-- ---- posts ----
CREATE POLICY "posts: leitura autenticados"
  ON posts FOR SELECT TO authenticated USING (true);

CREATE POLICY "posts: criação própria"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts: atualização própria"
  ON posts FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "posts: remoção própria"
  ON posts FOR DELETE TO authenticated
  USING (auth.uid() = author_id);


-- ---- post_likes ----
CREATE POLICY "post_likes: leitura autenticados"
  ON post_likes FOR SELECT TO authenticated USING (true);

CREATE POLICY "post_likes: inserção própria"
  ON post_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_likes: remoção própria"
  ON post_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ---- post_comments ----
CREATE POLICY "post_comments: leitura autenticados"
  ON post_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "post_comments: criação própria"
  ON post_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "post_comments: remoção própria"
  ON post_comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id);


-- ---- palavra_do_dia ----
CREATE POLICY "palavra_do_dia: leitura autenticados"
  ON palavra_do_dia FOR SELECT TO authenticated USING (true);

CREATE POLICY "palavra_do_dia: criação própria"
  ON palavra_do_dia FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = responsible_id);

CREATE POLICY "palavra_do_dia: atualização própria"
  ON palavra_do_dia FOR UPDATE TO authenticated
  USING (auth.uid() = responsible_id);

CREATE POLICY "palavra_do_dia: remoção própria"
  ON palavra_do_dia FOR DELETE TO authenticated
  USING (auth.uid() = responsible_id);


-- ---- palavra_interactions ----
CREATE POLICY "palavra_interactions: leitura autenticados"
  ON palavra_interactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "palavra_interactions: gerenciar próprias"
  ON palavra_interactions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---- palavra_scale ----
CREATE POLICY "palavra_scale: leitura autenticados"
  ON palavra_scale FOR SELECT TO authenticated USING (true);

CREATE POLICY "palavra_scale: gerenciar própria"
  ON palavra_scale FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---- events ----
CREATE POLICY "events: leitura autenticados"
  ON events FOR SELECT TO authenticated USING (true);

CREATE POLICY "events: criação própria"
  ON events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "events: atualização própria"
  ON events FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "events: remoção própria"
  ON events FOR DELETE TO authenticated
  USING (auth.uid() = created_by);


-- ---- event_participants ----
CREATE POLICY "event_participants: leitura autenticados"
  ON event_participants FOR SELECT TO authenticated USING (true);

CREATE POLICY "event_participants: gerenciar própria"
  ON event_participants FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---- louvores ----
CREATE POLICY "louvores: leitura autenticados"
  ON louvores FOR SELECT TO authenticated USING (true);

CREATE POLICY "louvores: criação própria"
  ON louvores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "louvores: atualização própria"
  ON louvores FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "louvores: remoção própria"
  ON louvores FOR DELETE TO authenticated
  USING (auth.uid() = created_by);


-- ---- louvor_interactions ----
CREATE POLICY "louvor_interactions: leitura autenticados"
  ON louvor_interactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "louvor_interactions: gerenciar próprias"
  ON louvor_interactions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---- prayer_requests ----
CREATE POLICY "prayer_requests: leitura autenticados"
  ON prayer_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "prayer_requests: criação própria"
  ON prayer_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "prayer_requests: atualização própria"
  ON prayer_requests FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "prayer_requests: remoção própria"
  ON prayer_requests FOR DELETE TO authenticated
  USING (auth.uid() = author_id);


-- ---- prayer_interactions ----
CREATE POLICY "prayer_interactions: leitura autenticados"
  ON prayer_interactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "prayer_interactions: gerenciar próprias"
  ON prayer_interactions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---- social_projects ----
CREATE POLICY "social_projects: leitura autenticados"
  ON social_projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "social_projects: criação própria"
  ON social_projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "social_projects: atualização própria"
  ON social_projects FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);


-- ---- project_participants ----
CREATE POLICY "project_participants: leitura autenticados"
  ON project_participants FOR SELECT TO authenticated USING (true);

CREATE POLICY "project_participants: gerenciar própria"
  ON project_participants FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ---- project_photos ----
CREATE POLICY "project_photos: leitura autenticados"
  ON project_photos FOR SELECT TO authenticated USING (true);

CREATE POLICY "project_photos: inserção por criador do projeto"
  ON project_photos FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_projects
      WHERE id = project_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "project_photos: remoção por criador do projeto"
  ON project_photos FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM social_projects
      WHERE id = project_id AND created_by = auth.uid()
    )
  );


-- ---- notifications ----
CREATE POLICY "notifications: leitura própria"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications: atualização própria (marcar lida)"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);


-- ---- bible_highlights ----
CREATE POLICY "bible_highlights: leitura própria"
  ON bible_highlights FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "bible_highlights: gerenciar próprias"
  ON bible_highlights FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- FUNÇÕES AUXILIARES
-- ============================================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_palavra_do_dia_updated_at
  BEFORE UPDATE ON palavra_do_dia
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_prayer_requests_updated_at
  BEFORE UPDATE ON prayer_requests
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_social_projects_updated_at
  BEFORE UPDATE ON social_projects
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ============================================================
-- TRIGGER: criação automática de profile ao registrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    split_part(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();


-- ============================================================
-- TRIGGERS: contadores de likes/comments em posts
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION fn_update_post_likes_count();

-- --

CREATE OR REPLACE FUNCTION fn_update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION fn_update_post_comments_count();


-- ============================================================
-- TRIGGERS: contadores em palavra_do_dia
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_palavra_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'devotional' THEN
      UPDATE palavra_do_dia SET devotional_count = devotional_count + 1 WHERE id = NEW.palavra_id;
    ELSIF NEW.type = 'praying' THEN
      UPDATE palavra_do_dia SET praying_count = praying_count + 1 WHERE id = NEW.palavra_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'devotional' THEN
      UPDATE palavra_do_dia SET devotional_count = GREATEST(devotional_count - 1, 0) WHERE id = OLD.palavra_id;
    ELSIF OLD.type = 'praying' THEN
      UPDATE palavra_do_dia SET praying_count = GREATEST(praying_count - 1, 0) WHERE id = OLD.palavra_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_palavra_interaction_counts
  AFTER INSERT OR DELETE ON palavra_interactions
  FOR EACH ROW EXECUTE FUNCTION fn_update_palavra_counts();


-- ============================================================
-- TRIGGERS: contadores em louvores
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_louvor_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'like' THEN
      UPDATE louvores SET likes_count = likes_count + 1 WHERE id = NEW.louvor_id;
    ELSIF NEW.type = 'listened' THEN
      UPDATE louvores SET listened_count = listened_count + 1 WHERE id = NEW.louvor_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'like' THEN
      UPDATE louvores SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.louvor_id;
    ELSIF OLD.type = 'listened' THEN
      UPDATE louvores SET listened_count = GREATEST(listened_count - 1, 0) WHERE id = OLD.louvor_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_louvor_counts
  AFTER INSERT OR DELETE ON louvor_interactions
  FOR EACH ROW EXECUTE FUNCTION fn_update_louvor_counts();


-- ============================================================
-- TRIGGERS: contadores em prayer_requests
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_prayer_praying_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.type = 'praying' THEN
    UPDATE prayer_requests SET praying_count = praying_count + 1 WHERE id = NEW.prayer_id;
  ELSIF TG_OP = 'DELETE' AND OLD.type = 'praying' THEN
    UPDATE prayer_requests SET praying_count = GREATEST(praying_count - 1, 0) WHERE id = OLD.prayer_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prayer_praying_count
  AFTER INSERT OR DELETE ON prayer_interactions
  FOR EACH ROW EXECUTE FUNCTION fn_update_prayer_praying_count();


-- ============================================================
-- TRIGGERS: participants_count em social_projects
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_project_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE social_projects SET participants_count = participants_count + 1 WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE social_projects SET participants_count = GREATEST(participants_count - 1, 0) WHERE id = OLD.project_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_project_participants_count
  AFTER INSERT OR DELETE ON project_participants
  FOR EACH ROW EXECUTE FUNCTION fn_update_project_participants_count();


-- ============================================================
-- STORAGE BUCKETS
-- Execute no Supabase Storage (via Dashboard ou API)
-- ============================================================

-- Bucket: avatars (fotos de perfil)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: posts (imagens/vídeos de posts)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts', 'posts', true,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: palavra-audios (áudios da palavra do dia)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'palavra-audios', 'palavra-audios', true,
  52428800, -- 50 MB
  ARRAY['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: project-covers (capas de projetos sociais)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-covers', 'project-covers', true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: project-photos (fotos de projetos sociais)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos', 'project-photos', true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket: event-covers (capas de eventos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-covers', 'event-covers', true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;


-- ---- Storage Policies ----

-- avatars: qualquer autenticado pode ler; usuário só acessa sua própria pasta
CREATE POLICY "avatars: leitura pública"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: upload próprio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars: atualização própria"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars: remoção própria"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- posts: leitura pública; upload por autenticados
CREATE POLICY "posts storage: leitura pública"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'posts');

CREATE POLICY "posts storage: upload autenticado"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "posts storage: remoção própria"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- palavra-audios: leitura pública; upload por autenticados
CREATE POLICY "palavra-audios: leitura pública"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'palavra-audios');

CREATE POLICY "palavra-audios: upload autenticado"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'palavra-audios' AND (storage.foldername(name))[1] = auth.uid()::text);

-- project-covers: leitura pública; upload por autenticados
CREATE POLICY "project-covers: leitura pública"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'project-covers');

CREATE POLICY "project-covers: upload autenticado"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- project-photos: leitura pública; upload por autenticados
CREATE POLICY "project-photos: leitura pública"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'project-photos');

CREATE POLICY "project-photos: upload autenticado"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- event-covers: leitura pública; upload por autenticados
CREATE POLICY "event-covers: leitura pública"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'event-covers');

CREATE POLICY "event-covers: upload autenticado"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
