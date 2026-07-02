'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  responderEvento,
  removerRespostaEvento,
} from '@/lib/agenda/rsvp-actions'

type Member = {
  id: string
  name: string | null
  username: string | null
  avatar_url: string | null
}

type Rsvp = {
  user_id: string
  status: 'going' | 'not_going'
  user?: Member | null
}

function MemberRow({ member }: { member: Member }) {
  return (
    <Link
      href={`/perfil/${member.username}`}
      className="flex items-center gap-3 py-2"
    >
      <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.08] overflow-hidden">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name ?? 'Membro'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold">
            {(member.name ?? 'M').slice(0, 1)}
          </div>
        )}
      </div>

      <div>
        <p className="text-[13px] font-semibold text-white">
          {member.name ?? 'Membro'}
        </p>
        {member.username && (
          <p className="text-[11px] text-white/35">@{member.username}</p>
        )}
      </div>
    </Link>
  )
}

export default function EventRsvpButtons({
  eventId,
  currentStatus,
  goingCount,
  notGoingCount,
  rsvps,
  members,
}: {
  eventId: string
  currentStatus?: 'going' | 'not_going' | null
  goingCount: number
  notGoingCount: number
  rsvps: Rsvp[]
  members: Member[]
}) {
  const [showList, setShowList] = useState(false)

  const goingMembers = rsvps
    .filter((rsvp) => rsvp.status === 'going')
    .map((rsvp) => rsvp.user)
    .filter(Boolean) as Member[]

  const notGoingMembers = rsvps
    .filter((rsvp) => rsvp.status === 'not_going')
    .map((rsvp) => rsvp.user)
    .filter(Boolean) as Member[]

  const answeredUserIds = new Set(rsvps.map((rsvp) => rsvp.user_id))

  const pendingMembers = members.filter(
    (member) => !answeredUserIds.has(member.id)
  )

  async function handleGoing() {
    if (currentStatus === 'going') {
      await removerRespostaEvento(eventId)
      return
    }

    await responderEvento(eventId, 'going')
  }

  async function handleNotGoing() {
    if (currentStatus === 'not_going') {
      await removerRespostaEvento(eventId)
      return
    }

    await responderEvento(eventId, 'not_going')
  }

  return (
    <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
      <p className="text-[11px] font-bold tracking-widest uppercase text-white/35 mb-3">
        Sua presença
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoing}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition-all active:scale-[0.98] ${
            currentStatus === 'going'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-white/[0.04] border-white/[0.08] text-white/55'
          }`}
        >
          <Check size={16} />
          Vou
        </button>

        <button
          type="button"
          onClick={handleNotGoing}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition-all active:scale-[0.98] ${
            currentStatus === 'not_going'
              ? 'bg-red-500/15 border-red-500/30 text-red-400'
              : 'bg-white/[0.04] border-white/[0.08] text-white/55'
          }`}
        >
          <X size={16} />
          Não vou
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 text-[12px] text-white/35">
        <span>{goingCount} vão</span>
        <span>{notGoingCount} não vão</span>
        <span>{pendingMembers.length} pendentes</span>
      </div>

      <button
        type="button"
        onClick={() => setShowList(!showList)}
        className="w-full mt-3 flex items-center justify-center gap-1 text-[12px] font-semibold text-brand-400"
      >
        {showList ? 'Ocultar lista' : 'Ver lista'}
        {showList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showList && (
        <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-400/80 mb-1">
              Vão
            </p>

            {goingMembers.length > 0 ? (
              goingMembers.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))
            ) : (
              <p className="text-[12px] text-white/30">
                Ninguém confirmou ainda.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-red-400/80 mb-1">
              Não vão
            </p>

            {notGoingMembers.length > 0 ? (
              notGoingMembers.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))
            ) : (
              <p className="text-[12px] text-white/30">
                Ninguém respondeu “não vou”.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-white/35 mb-1">
              Ainda não responderam
            </p>

            {pendingMembers.length > 0 ? (
              pendingMembers.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))
            ) : (
              <p className="text-[12px] text-white/30">
                Todos já responderam.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}