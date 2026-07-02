-- ============================================================
-- MINISTÉRIO NOVA ALIANÇA — FUNÇÕES DE CONTADOR: PALAVRA DO DIA
-- Execute no Supabase SQL Editor
-- ============================================================

-- Incrementar contador genérico (devotional_count ou praying_count)
CREATE OR REPLACE FUNCTION increment_palavra_count(p_id UUID, p_field TEXT)
RETURNS VOID AS $$
BEGIN
  IF p_field = 'devotional_count' THEN
    UPDATE palavra_do_dia SET devotional_count = devotional_count + 1 WHERE id = p_id;
  ELSIF p_field = 'praying_count' THEN
    UPDATE palavra_do_dia SET praying_count = praying_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrementar (nunca abaixo de 0)
CREATE OR REPLACE FUNCTION decrement_palavra_count(p_id UUID, p_field TEXT)
RETURNS VOID AS $$
BEGIN
  IF p_field = 'devotional_count' THEN
    UPDATE palavra_do_dia SET devotional_count = GREATEST(devotional_count - 1, 0) WHERE id = p_id;
  ELSIF p_field = 'praying_count' THEN
    UPDATE palavra_do_dia SET praying_count = GREATEST(praying_count - 1, 0) WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ÍNDICE adicional para buscar palavra por data rápido
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_palavra_date_published
  ON palavra_do_dia(scheduled_date, is_published);

-- ============================================================
-- POLÍTICA RLS: responsável pode editar sua própria palavra
-- ============================================================
-- Apagar policies antigas se existirem
DROP POLICY IF EXISTS "Responsável edita sua palavra" ON palavra_do_dia;
DROP POLICY IF EXISTS "Admin e líder criam palavra" ON palavra_do_dia;

-- Recriar policies
CREATE POLICY "Responsável edita sua palavra"
  ON palavra_do_dia FOR UPDATE TO authenticated
  USING (auth.uid() = responsible_id);

CREATE POLICY "Admin e líder criam palavra"
  ON palavra_do_dia FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'leader')
    )
  );