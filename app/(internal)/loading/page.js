import { headers } from 'next/headers'
import { pingAction } from '../../actions'
import { noteInstance } from '@/lib/instance'

export const dynamic = 'force-dynamic'

// Like the production `/loading` route: a top-level route outside the locale tree.
// It is the only route that imports the action, so Next.js forwards calls from other routes here.
export default async function LoadingPage() {
  const h = await headers()
  noteInstance(h.get('host'))
  return (
    <main>
      <h1>/loading</h1>
      <p>
        Action ID: <code id="action-id" data-action-id={pingAction.$$id}>{pingAction.$$id}</code>
      </p>
    </main>
  )
}
