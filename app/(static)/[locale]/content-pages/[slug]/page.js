import { ForeignActionCaller } from '../../../../a/ForeignActionCaller'

// Like a production content page: a static page under a locale segment, reached only through the proxy rewrite.
// It does not import the action.
export const dynamicParams = true
export const revalidate = 3600

export function generateStaticParams() {
  return [
    { locale: 'de-DE', slug: 'peru' },
    { locale: 'fr-FR', slug: 'peru' },
  ]
}

export default async function StaticContentPage({ params }) {
  const { locale, slug } = await params
  return (
    <main>
      <h1>Static content page</h1>
      <p>
        {locale} / {slug}
      </p>
      <ForeignActionCaller />
    </main>
  )
}
