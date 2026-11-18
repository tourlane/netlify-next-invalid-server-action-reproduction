import { headers } from 'next/headers'
import { pingAction } from '../actions'
import { noteInstance } from '@/lib/instance'
import { ActionButton } from './ActionButton'

export default async function PageB() {
  const h = await headers()
  noteInstance(h.get('host'))
  return (
    <main>
      <h1>/b</h1>
      <p>
        Action ID: <code id="action-id" data-action-id={pingAction.$$id}>{pingAction.$$id}</code>
      </p>
      <ActionButton action={pingAction} />
    </main>
  )
}
