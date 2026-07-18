import { createHash } from 'node:crypto'

type ClaimActionOptions = {
  supabase: any
  userId: string
  action: string
  payload: unknown
  ttlSeconds?: number
}

export async function claimAction({
  supabase,
  userId,
  action,
  payload,
  ttlSeconds = 10,
}: ClaimActionOptions): Promise<boolean> {
  const payloadHash = createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')

  const key = `${userId}:${action}:${payloadHash}`

  const { data, error } = await supabase.rpc('claim_action_key', {
    p_key: key,
    p_ttl_seconds: ttlSeconds,
  })

  if (error) {
    console.error('ERRO NA PROTEÇÃO CONTRA DUPLICAÇÃO:', error)
    throw new Error('Não foi possível processar esta ação.')
  }

  return data === true
}