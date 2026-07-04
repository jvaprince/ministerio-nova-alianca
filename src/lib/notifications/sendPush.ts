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

  console.log('ONESIGNAL ENV:', {
    hasAppId: !!appId,
    hasApiKey: !!apiKey,
    userId,
  })

  if (!appId || !apiKey) return

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://ministerio-nova-alianca.vercel.app'

  const url = href ? `${baseUrl}${href}` : baseUrl

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      include_external_user_ids: [userId],
      channel_for_external_user_ids: 'push',
      headings: { en: title, pt: title },
      contents: { en: message ?? title, pt: message ?? title },
      web_url: url,
    }),
  })

  const text = await response.text()

  console.log('ONESIGNAL RESPONSE:', {
    status: response.status,
    ok: response.ok,
    text,
  })
}