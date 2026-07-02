import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({
  href,
}: {
  href: string
}) {
  return (
    <Link
      href={href}
      className="
        group
        inline-flex
        items-center
        justify-center
        w-11
        h-11
        rounded-full
        border
        border-app
        bg-app-card
        backdrop-blur-xl
        text-brand-400
        shadow-[0_0_24px_rgba(59,130,246,0.10),inset_0_1px_0_rgba(255,255,255,0.08)]
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-[0_0_32px_rgba(59,130,246,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]
        active:scale-95
      "
    >
      <ArrowLeft
        size={18}
        className="
          transition-all
          duration-300
          group-hover:-translate-x-0.5
        "
      />
    </Link>
  )
}