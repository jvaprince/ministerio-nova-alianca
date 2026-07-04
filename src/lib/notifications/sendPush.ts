export async function sendPushToUser({
  userId,
  title,
  message,
  href,
}: {
  userId: string
  title: string
  message?: string | null
  href?: string | null
}) {
  const appId = process.env.ONESIGNAL_APP_ID
  const apiKey = process.env.ONESIGNAL_API_KEY

  if (!appId || !apiKey) {
    console.log('OneSignal env ausente')
    return
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://ministerio-nova-alianca.vercel.app'

  const url = href ? `${baseUrl}${href}` : baseUrl

  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      target_channel: 'push',
      include_aliases: {
        external_id: [userId],
      },
      headings: {
        pt: title,
        en: title,
      },
      contents: {
        pt: message ?? title,
        en: message ?? title,
      },
      url,
      web_url: url,
    }),
  })

  const result = await response.json().catch(() => null)

  console.log('ONESIGNAL PUSH RESULT:', {
    ok: response.ok,
    status: response.status,
    userId,
    result,
  })

  if (!response.ok) {
    console.error('Erro ao enviar push OneSignal:', result)
  }
}