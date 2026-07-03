'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Newspaper, BookOpen, Calendar, User } from 'lucide-react'

export default function BottomNav({
  role,
  username,
}: {
  role: string
  username?: string | null
}) {
  const pathname = usePathname()

  const showBottomNav =
  pathname === '/inicio' ||
  pathname === '/feed' ||
  pathname === '/biblia' ||
  pathname === '/agenda' ||
  pathname === '/perfil' ||
  /^\/perfil\/[^/]+$/.test(pathname)

if (!showBottomNav) return null

  const tabs = [
    { href: '/inicio', label: 'Início', icon: Home },
    { href: '/feed', label: 'Feed', icon: Newspaper },
    { href: '/biblia', label: BookOpen ? 'Bíblia' : 'Bíblia', icon: BookOpen },
    { href: '/agenda', label: 'Agenda', icon: Calendar },
    {
      href: username ? `/perfil/${username}` : '/perfil',
      label: 'Perfil',
      icon: User,
    },
  ]

  const activeIndex = tabs.findIndex(({ href }) => {
    return (
      pathname === href ||
      pathname.startsWith(href + '/') ||
      (href.startsWith('/perfil') && pathname.startsWith('/perfil'))
    )
  })

  return (
    <div className="bottom-nav fixed left-0 right-0 bottom-0 z-50 px-4 pb-4 pt-3 pointer-events-none">
      <div className="pointer-events-auto relative mx-auto max-w-[430px] rounded-[34px]">
        <div className="absolute inset-0 rounded-[34px] bg-black/45 blur-2xl" />

        <nav
          className="
            relative overflow-hidden rounded-[34px] border border-brand-300/20 bg-[#050816]/78
            backdrop-blur-2xl
            shadow-[0_0_35px_rgba(59,130,246,0.14),0_18px_45px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)]
            px-2 py-2 flex items-center justify-between
            pb-[calc(0.5rem+env(safe-area-inset-bottom))]
          "
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-brand-500/15 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-brand-400/10 blur-2xl" />

          {activeIndex >= 0 && (
            <span
              className="absolute top-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] w-[calc((100%-1rem)/5)] rounded-[26px] border border-brand-300/20 bg-brand-500/18 shadow-[0_0_22px_rgba(59,130,246,0.16),inset_0_1px_0_rgba(255,255,255,0.10)] transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          )}

          {tabs.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              pathname.startsWith(href + '/') ||
              (href.startsWith('/perfil') && pathname.startsWith('/perfil'))

            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative flex-1 h-14 rounded-[26px]
                  flex flex-col items-center justify-center gap-1
                  transition-all duration-300 active:scale-95
                  ${active ? 'text-white' : 'text-white/38 hover:text-white/70'}
                `}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.6 : 1.8}
                  className="relative z-10 transition-all duration-300"
                />

                <span
                  className={`
                    relative z-10 text-[10px] font-bold transition-all duration-300
                    ${active ? 'text-white' : 'text-white/45'}
                  `}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}