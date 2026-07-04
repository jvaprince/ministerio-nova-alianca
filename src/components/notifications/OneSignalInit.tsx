'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function OneSignalInit() {
  useEffect(() => {
    async function initOneSignal() {
      const supabase = createSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      await OneSignal.init({
        appId: '85458890-7ca0-46f0-8c8b-7cc98328c64f',
        allowLocalhostAsSecureOrigin: true,
      })

      if (user?.id) {
        await OneSignal.login(user.id)
        await OneSignal.User.PushSubscription.optIn()
      }
    }

    initOneSignal()
  }, [])

  return null
}