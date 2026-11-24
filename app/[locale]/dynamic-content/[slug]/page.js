import { headers } from 'next/headers'
import { noteInstance } from '@/lib/instance'
import { ForeignActionCaller } from '../../../a/ForeignActionCaller'

// Same as the static content page, but rendered per request.
export const dynamic = 'force-dynamic'

export default async function DynamicContentPage({ params }) {
  const { locale, slug } = await params
  const h = await headers()
  noteInstance(h.get('host'))
  return (
    <main>
      <h1>Dynamic content page</h1>
      <p>
        {locale} / {slug}
      </p>
      <ForeignActionCaller />
    </main>
  )
}
