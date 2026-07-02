-- ============================================================
-- MINISTÉRIO NOVA ALIANÇA — SEED DOS MEMBROS INICIAIS
-- Execute APÓS o 01_pending_profiles_and_link.sql
--
-- IMPORTANTE: Após executar, rode esta query para ver os tokens:
--   SELECT name, role, invite_token FROM pending_profiles ORDER BY name;
-- Envie o token de cada pessoa via WhatsApp para que ela use
-- no cadastro e seja vinculada ao perfil correto.
-- ============================================================

INSERT INTO pending_profiles (name, role) VALUES
  -- Líder (admin do ministério)
  ('João Victor',  'leader'),

  -- Membros
  ('Milena',       'member'),
  ('Matheus',      'member'),
  ('Nathalia',     'member'),
  ('Mirella',      'member'),
  ('Kelvin',       'member'),
  ('Klara',        'member'),
  ('Mariana',      'member'),
  ('Arthur',       'member'),
  ('Enzo',         'member'),
  ('Giovana',      'member')

ON CONFLICT DO NOTHING;


-- ============================================================
-- Após executar, rode para ver os tokens gerados:
-- ============================================================
-- SELECT
--   name,
--   role,
--   invite_token,
--   'https://seuapp.com/cadastro?convite=' || invite_token AS link_de_convite
-- FROM pending_profiles
-- ORDER BY name;
-- ============================================================
