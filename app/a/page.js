import { headers } from 'next/headers'
import { noteInstance } from '@/lib/instance'
import { ForeignActionCaller } from './ForeignActionCaller'

// This page does not import app/actions.js. So the action is not in the worker of /a.
export default async function PageA() {
  const h = await headers()
  const instance = noteInstance(h.get('host'))
  return (
    <main>
      <h1>/a</h1>
      <p>This page calls the action of /b with a raw Server Action request.</p>
      <pre>{JSON.stringify({ host: h.get('host'), instance }, null, 2)}</pre>
      <ForeignActionCaller />
    </main>
  )
}
