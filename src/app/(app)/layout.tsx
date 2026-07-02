import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, role')
    .eq('id', user.id)
    .single()

  return (
  <ThemeProvider>
    <div className="min-h-screen bg-app text-app">
      <main className="pb-20">
        {children}
      </main>

      <BottomNav
        role={profile?.role ?? 'member'}
        username={profile?.username ?? null}
      />
    </div>
  </ThemeProvider>
)
}
