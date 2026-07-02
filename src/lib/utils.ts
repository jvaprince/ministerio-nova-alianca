import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDateShort(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatRelativeTime(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function formatTime(time: string) {
  if (!time) return ''
  const [h, m] = time.split(':')
  return `${h}:${m}`
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const POST_TYPE_LABELS: Record<string, string> = {
  post: 'Publicação',
  testimony: 'Testemunho',
  announcement: 'Aviso',
  worship_banner: 'Banner de Culto',
  palavra_do_dia: 'Palavra do Dia'
}

export const POST_TYPE_COLORS: Record<string, string> = {
  post: 'bg-blue-500/20 text-blue-400',
  testimony: 'bg-yellow-500/20 text-yellow-400',
  announcement: 'bg-red-500/20 text-red-400',
  worship_banner: 'bg-purple-500/20 text-purple-400',
  palavra_do_dia: 'bg-green-500/20 text-green-400'
}

export const PRAYER_CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  familia: { label: 'Família', emoji: '🏠', color: 'bg-orange-500/20 text-orange-400' },
  trabalho: { label: 'Trabalho', emoji: '💼', color: 'bg-blue-500/20 text-blue-400' },
  saude: { label: 'Saúde', emoji: '🏥', color: 'bg-green-500/20 text-green-400' },
  estudos: { label: 'Estudos', emoji: '📚', color: 'bg-purple-500/20 text-purple-400' },
  relacionamento: { label: 'Relacionamento', emoji: '❤️', color: 'bg-pink-500/20 text-pink-400' },
  ministerio: { label: 'Ministério', emoji: '⛪', color: 'bg-yellow-500/20 text-yellow-400' },
  general: { label: 'Geral', emoji: '🙏', color: 'bg-gray-500/20 text-gray-400' }
}

export const EVENT_TYPES: Record<string, { label: string; emoji: string; color: string }> = {
  culto: { label: 'Culto', emoji: '⛪', color: 'bg-blue-500/20 text-blue-300' },
  vigilia: { label: 'Vigília', emoji: '🕯️', color: 'bg-purple-500/20 text-purple-300' },
  evangelismo: { label: 'Evangelismo', emoji: '📢', color: 'bg-orange-500/20 text-orange-300' },
  social: { label: 'Projeto Social', emoji: '🤝', color: 'bg-green-500/20 text-green-300' },
  louvor: { label: 'Louvor', emoji: '🎵', color: 'bg-yellow-500/20 text-yellow-300' },
  general: { label: 'Geral', emoji: '📅', color: 'bg-gray-500/20 text-gray-300' }
}

// Generate automatic scale for the next N days
export function generateScale(members: string[], startDate: Date, days: number) {
  const scale: { userId: string; date: string }[] = []
  const membersCopy = [...members]

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const memberIndex = i % membersCopy.length
    scale.push({
      userId: membersCopy[memberIndex],
      date: format(date, 'yyyy-MM-dd')
    })
  }

  return scale
}

// Get YouTube embed URL
export function getYouTubeEmbedUrl(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null
}

export function getYouTubeThumbnail(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    : null
}
