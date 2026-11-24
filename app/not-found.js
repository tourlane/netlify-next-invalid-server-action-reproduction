import { headers } from 'next/headers'
import { getRequestInfo } from '@/lib/requestInfo'

// Production gets a 404 for a skew-pinned content request, because the proxy finds no market for the permalink host.
export default async function NotFound() {
  const h = await headers()
  const info = getRequestInfo(h, null)
  console.log('[repro:not-found]', JSON.stringify(info))
  return (
    <main>
      <h1>404</h1>
      <pre id="not-found-info">{JSON.stringify(info, null, 2)}</pre>
    </main>
  )
}
