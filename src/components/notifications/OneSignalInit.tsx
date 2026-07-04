'use client'

import { useEffect } from 'react'
import OneSignal from 'react-onesignal'

export default function OneSignalInit() {
  useEffect(() => {
    async function initOneSignal() {
      await OneSignal.init({
        appId: '85458890-7ca0-46f0-8c8b-7cc98328c64f',
        allowLocalhostAsSecureOrigin: true,
      })
    }

    initOneSignal()
  }, [])

  return null
}