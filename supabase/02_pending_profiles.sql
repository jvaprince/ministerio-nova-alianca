-- ============================================================
-- MINISTÉRIO NOVA ALIANÇA — SISTEMA DE PENDING PROFILES
-- Permite criar perfis dos membros antes do cadastro
-- e vinculá-los automaticamente quando o usuário se registra.
-- ============================================================

-- ============================================================
-- TABELA: pending_profiles
-- Armazena perfis "aguardando vinculação" com um invite_token
-- único por membro. Não referencia auth.users (propositalmente).
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_profiles (
  id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT        NOT NULL,
  -- O token de convite é enviado para o membro via WhatsApp/link.
  -- Quando ele se cadastra, informa o token e a vinculação ocorre.
  invite_token  TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  role          TEXT        NOT NULL DEFAULT 'member'
                CHECK (role IN ('admin', 'leader', 'member')),
  is_linked     BOOLEAN     NOT NULL DEFAULT FALSE,
  linked_at     TIMESTAMPTZ,
  linked_user_id UUID,      -- preenchido após vinculação (referência soft)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para buscar token rapidamente no cadastro
CREATE INDEX idx_pending_profiles_invite_token ON pending_profiles(invite_token);
CREATE INDEX idx_pending_profiles_is_linked    ON pending_profiles(is_linked);

-- RLS: apenas autenticados podem ler seus próprios (após link)
-- Admins podem ver todos
ALTER TABLE pending_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pending: admin lê todos"
  ON pending_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "pending: leitura pelo token (anon)"
  ON pending_profiles FOR SELECT TO anon
  USING (true); -- necessário para validar token no cadastro antes de autenticar


-- ============================================================
-- FUNÇÃO: link_pending_profile
-- Chamada APÓS o usuário se cadastrar, passando o invite_token.
-- Cria o registro em profiles com os dados do pending_profile.
-- ============================================================
CREATE OR REPLACE FUNCTION link_pending_profile(
  p_user_id     UUID,
  p_invite_token TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_pending   pending_profiles%ROWTYPE;
  v_profile   profiles%ROWTYPE;
BEGIN
  -- Buscar o pending profile pelo token
  SELECT * INTO v_pending
  FROM pending_profiles
  WHERE invite_token = p_invite_token
    AND is_linked = FALSE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Token de convite inválido ou já utilizado.'
    );
  END IF;

  -- Verificar se o usuário já tem perfil
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  IF FOUND THEN
    -- Já tem perfil: atualizar nome e role do pending
    UPDATE profiles
    SET
      name       = v_pending.name,
      role       = v_pending.role,
      updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    -- Criar novo perfil baseado no pending
    INSERT INTO profiles (id, name, username, role)
    VALUES (
      p_user_id,
      v_pending.name,
      lower(regexp_replace(v_pending.name, '\s+', '.', 'g')), -- ex: "João Victor" → "joão.victor"
      v_pending.role
    );
  END IF;

  -- Marcar pending como vinculado
  UPDATE pending_profiles
  SET
    is_linked      = TRUE,
    linked_at      = NOW(),
    linked_user_id = p_user_id
  WHERE id = v_pending.id;

  RETURN jsonb_build_object(
    'success', true,
    'name',    v_pending.name,
    'role',    v_pending.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- TRIGGER: auto-cria profile sem token
-- Quando o usuário se cadastra SEM token de convite,
-- cria um perfil genérico com os dados do email/metadata.
-- A função link_pending_profile sobrescreve se necessário.
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_username TEXT;
BEGIN
  -- Tentar pegar nome dos metadados do OAuth (Google, etc)
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Username baseado no email
  v_username := lower(split_part(NEW.email, '@', 1));

  -- Inserir apenas se não existir (pode já ter sido criado via link_pending_profile)
  INSERT INTO profiles (id, name, username, role)
  VALUES (NEW.id, v_name, v_username, 'member')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger (substitui o existente do schema.sql original)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- FUNÇÃO: validate_invite_token (para o frontend verificar
-- o token antes de submeter o formulário de cadastro)
-- ============================================================
CREATE OR REPLACE FUNCTION validate_invite_token(p_token TEXT)
RETURNS JSONB AS $$
DECLARE
  v_pending pending_profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_pending
  FROM pending_profiles
  WHERE invite_token = p_token
    AND is_linked = FALSE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Token inválido ou já utilizado.');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'name',  v_pending.name,
    'role',  v_pending.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
