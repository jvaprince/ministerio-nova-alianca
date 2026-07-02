# SQL — Ordem de execução no Supabase

Execute no Dashboard → SQL Editor nesta ordem:

1. `01_schema.sql`         — Schema completo (tabelas, RLS, funções, triggers, storage)
2. `02_pending_profiles.sql` — Sistema de convites (pending_profiles + link_pending_profile)
3. `03_seed_membros.sql`   — Inserir os membros iniciais
4. `04_palavra_functions.sql` — Funções auxiliares da Palavra do Dia

Após o passo 3, rode esta query para obter os tokens de convite:
```sql
SELECT name, role, invite_token,
  'https://seuapp.com/cadastro?convite=' || invite_token AS link_convite
FROM pending_profiles ORDER BY name;
```

## Arquivos descartados (não usar)
- `schema.sql` (versão antiga/incompleta) — substituído por `01_schema.sql`
- `supabase.ts` (cliente legado com auth-helpers) — substituído por `src/lib/supabase/`
