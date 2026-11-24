import { NextResponse } from 'next/server'
import { getRequestInfo } from './lib/requestInfo'

// Like the production proxy: the market comes from the host. Only the branch alias is a known market.
// For any other host (for example a deploy permalink), the proxy does not rewrite, like production.
const MARKET_HOSTS = {
  'skew--next-invalid-server-action-reproducti.netlify.app': 'de-DE',
  'next-invalid-server-action-reproducti.netlify.app': 'de-DE',
}

export function proxy(request) {
  const { pathname } = request.nextUrl
  const locale = MARKET_HOSTS[request.headers.get('host') ?? '']

  if (request.method === 'POST') {
    console.log('[repro:proxy]', JSON.stringify({ locale: locale ?? null, ...getRequestInfo(request.headers, request.url) }))
  }

  if (!locale) return NextResponse.next()

  const staticMatch = pathname.match(/^\/static-content\/([^/]+)\/?$/)
  if (staticMatch) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/content-pages/${staticMatch[1]}`
    return NextResponse.rewrite(url)
  }

  const dynamicMatch = pathname.match(/^\/dynamic-content\/([^/]+)\/?$/)
  if (dynamicMatch) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dynamic-content/${dynamicMatch[1]}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|_ipx|api|favicons|.*\\..*).*)'],
}
