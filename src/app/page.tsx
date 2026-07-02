import { redirect } from 'next/navigation'

// Rota raiz — redireciona para /inicio
// O middleware cuida da autenticação: se não estiver logado, redireciona para /login
export default function RootPage() {
  redirect('/inicio')
}
