import type { Metadata } from 'next'
import { Bell, CheckCheck } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { marcarTodasComoLidas } from '@/lib/notifications/actions'
import BackButton from '@/components/ui/BackButton'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Notificações — Ministério Nova Aliança',
}

function PremiumCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-brand-300/15 bg-white/[0.04] shadow-[0_0_24px_rgba(59,130,246,0.07),0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/45 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
      {children}
    </div>
  )
}

function getNotificationGroup(date: string) {
  const notificationDate = new Date(date)
  const now = new Date()

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - 6)

  if (notificationDate >= startOfToday) return 'Hoje'
  if (notificationDate >= startOfYesterday) return 'Ontem'
  if (notificationDate >= startOfWeek) return 'Esta semana'

  return 'Antigas'
}

function groupNotifications(notifications: any[]) {
  const groups: Record<string, any[]> = {
    Hoje: [],
    Ontem: [],
    'Esta semana': [],
    Antigas: [],
  }

  notifications.forEach((notification) => {
    const group = getNotificationGroup(notification.created_at)
    groups[group].push(notification)
  })

  return Object.entries(groups).filter(([, items]) => items.length > 0)
}

export default async function NotificacoesPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const groupedNotifications = groupNotifications(notifications ?? [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] pb-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute top-[430px] -right-24 h-80 w-80 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="px-4 pt-10 pb-5 flex items-start justify-between gap-4">
          <div>
            <BackButton href="/inicio" />

            <div className="mt-4">
              <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35">
                Central
              </p>

              <h1 className="text-[26px] font-black text-white tracking-tight mt-1">
                Notificações
              </h1>
            </div>
          </div>

          {notifications && notifications.length > 0 && (
            <form action={marcarTodasComoLidas}>
              <button
                type="submit"
                className="
                  w-11 h-11 rounded-full
                  border border-brand-300/20
                  bg-brand-500/15
                  backdrop-blur-xl
                  flex items-center justify-center
                  text-brand-300
                  shadow-[0_0_24px_rgba(59,130,246,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]
                  transition-all duration-300
                  active:scale-95
                "
              >
                <CheckCheck size={18} />
              </button>
            </form>
          )}
        </div>

        <div className="px-4">
          {!notifications || notifications.length === 0 ? (
            <PremiumCard className="p-8 text-center">
              <div className="relative w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
                <Bell size={24} className="text-white/30" />
              </div>

              <p className="relative text-white/60 text-sm font-semibold">
                Nenhuma notificação.
              </p>

              <p className="relative text-white/30 text-xs mt-1">
                Quando algo acontecer, aparecerá aqui.
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-7">
              {groupedNotifications.map(([groupName, items]) => (
                <section key={groupName}>
                  <p className="text-[11px] font-black tracking-[0.24em] uppercase text-white/35 mb-3">
                    {groupName}
                  </p>

                  <div className="space-y-3">
                    {items.map((notification: any) => (
                      <Link
                        key={notification.id}
                        href={notification.href ?? '#'}
                        className="block transition-all duration-300 active:scale-[0.985]"
                      >
                        <PremiumCard
                          className={`p-4 ${
                            !notification.read_at
                              ? 'border-brand-400/25 shadow-[0_0_30px_rgba(59,130,246,0.12),0_20px_60px_rgba(0,0,0,0.28)]'
                              : ''
                          }`}
                        >
                          {!notification.read_at && (
                            <div className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-brand-400 shadow-[0_0_12px_rgba(59,130,246,0.7)]" />
                          )}

                          <p className="relative text-[15px] font-bold text-white pr-5">
                            {notification.title}
                          </p>

                          {notification.message && (
                            <p className="relative text-[13px] text-white/60 mt-2 leading-relaxed">
                              {notification.message}
                            </p>
                          )}

                          <p className="relative text-[11px] text-white/30 mt-3">
                            {new Date(notification.created_at).toLocaleString('pt-BR')}
                          </p>
                        </PremiumCard>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}