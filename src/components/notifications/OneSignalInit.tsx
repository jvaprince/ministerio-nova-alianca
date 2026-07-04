'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function OneSignalInit() {
  useEffect(() => {
    async function init() {
      await OneSignal.init({
        appId: '85458890-7ca0-46f0-8c8b-7cc98328c64f',
        allowLocalhostAsSecureOrigin: true,
      })

      const supabase = createSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) return

      await OneSignal.login(user.id)

      const permission = OneSignal.Notifications.permission

      if (permission) {
        await OneSignal.User.PushSubscription.optIn()
      } else {
        await OneSignal.Notifications.requestPermission()
        await OneSignal.User.PushSubscription.optIn()
      }

      console.log('ONESIGNAL CLIENT STATUS:', {
        userId: user.id,
        permission: OneSignal.Notifications.permission,
        subscriptionId: OneSignal.User.PushSubscription.id,
        optedIn: OneSignal.User.PushSubscription.optedIn,
      })
    }

    init()
  }, [])

  return null
}