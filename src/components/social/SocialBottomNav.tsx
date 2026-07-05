'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Lightbulb,
  Package,
  Target,
  Users,
  BarChart3,
} from 'lucide-react'

export default function SocialBottomNav() {
  const pathname = usePathname()

  const showSocialNav = pathname.startsWith('/social')

  if (!showSocialNav) return null

  const tabs = [
    { href: '/social', label: 'Início', icon: Home },
    { href: '/social/ideias', label: 'Ideias', icon: Lightbulb },
    { href: '/social/projetos', label: 'Projetos', icon: Package },
    { href: '/social/necessidades', label: 'Metas', icon: Target },
    { href: '/social/participantes', label: 'Ajudar', icon: Users },
    { href: '/social/impacto', label: 'Impacto', icon: BarChart3 },
  ]

  const activeIndex = tabs.findIndex(({ href }) => {
  if (href === '/social') {
    return pathname === '/social'
  }

  return pathname === href || pathname.startsWith(href + '/')
})

  return (
    <div className="fixed left-0 right-0 bottom-0 z-50 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none">
      <nav
        className="
          pointer-events-auto relative mx-auto max-w-[430px] overflow-hidden
          rounded-[30px] border border-[#FF6B35]/20 bg-[#080808]/94
          backdrop-blur-xl
          shadow-[0_10px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]
          px-2 py-2 flex items-center justify-between
        "
      >
        {activeIndex >= 0 && (
          <span
            className="absolute top-2 bottom-2 w-[calc((100%-1rem)/6)] rounded-[24px] border border-[#FF6B35]/20 bg-[#E4572E]/25 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        )}

        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
  href === '/social'
    ? pathname === '/social'
    : pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex-1 h-14 rounded-[24px]
                flex flex-col items-center justify-center gap-1
                transition-all duration-300 active:scale-95
                ${active ? 'text-white' : 'text-white/38 hover:text-white/70'}
              `}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.6 : 1.8}
                className="relative z-10 transition-all duration-300"
              />

              <span
                className={`
                  relative z-10 text-[9px] font-bold transition-all duration-300
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
  )
}