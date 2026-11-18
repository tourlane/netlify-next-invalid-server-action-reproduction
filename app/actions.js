'use server'

import { headers } from 'next/headers'
import { noteInstance } from '@/lib/instance'

// Only app/b/page.js imports this file. So the action is only in the worker of /b.
// A call to this action on /a makes Next.js forward the call to /b.
export async function pingAction() {
  const h = await headers()
  const info = {
    host: h.get('host'),
    xForwardedHost: h.get('x-forwarded-host'),
    origin: h.get('origin'),
    xActionForwarded: h.get('x-action-forwarded'),
    instance: noteInstance(h.get('host')),
  }
  console.log('[repro] pingAction ran', JSON.stringify(info))
  return info
}
