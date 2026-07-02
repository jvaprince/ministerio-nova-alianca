# INSTALAÇÃO — Ministério Nova Aliança

## 1. Dependências
```bash
npm install
```

## 2. Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha:
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Banco de dados (Supabase Dashboard → SQL Editor)
Execute na ordem:
1. `supabase/01_schema.sql`
2. `supabase/02_pending_profiles.sql`
3. `supabase/03_seed_membros.sql`
4. `supabase/04_palavra_functions.sql`

## 4. Configurar Supabase Auth
- Authentication → URL Configuration → Site URL: `http://localhost:3000`
- Adicionar Redirect URL: `http://localhost:3000/auth/callback`

## 5. Tokens de convite
Após rodar o seed, execute no SQL Editor:
```sql
SELECT name, invite_token,
  'http://localhost:3000/cadastro?convite=' || invite_token AS link
FROM pending_profiles ORDER BY name;
```
Envie o link via WhatsApp para cada membro.

## 6. Rodar
```bash
npm run dev
```

## Fluxo de autenticação
- `/login` → email + senha
- `/cadastro?convite=TOKEN` → link do WhatsApp → cadastro vinculado ao perfil
- `/recuperar-senha` → email de reset
- `/auth/callback` → handler OAuth e confirmação de email

## Permissões por role
| Role   | Pode fazer                                        |
|--------|---------------------------------------------------|
| admin  | Tudo, incluindo escala, membros e admin            |
| leader | Criar/editar Palavra do Dia, ver escala            |
| member | Ler conteúdo, interagir (like, oração, comentário) |
