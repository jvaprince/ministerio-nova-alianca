'use client'

import OneSignal from 'react-onesignal'
import toast from 'react-hot-toast'

export default function EnablePushButton() {
  async function ativar() {
    try {
      await OneSignal.Notifications.requestPermission()
      await OneSignal.User.PushSubscription.optIn()

      toast.success('Notificações reativadas!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao ativar notificações.')
    }
  }

  return (
    <button
      onClick={ativar}
      className="w-full rounded-2xl border border-brand-300/20 bg-brand-500/10 px-4 py-3 text-sm font-bold text-brand-300"
    >
      🔔 Reativar notificações
    </button>
  )
}