import { NextResponse } from 'next/server'

// Close to the production proxy: it runs on almost every path, finds the market from the host,
// and rewrites a public content URL (with a trailing slash) to an internal locale route on the same host.
// The deploy permalink (`<deployId>--<site>`) acts as the second market.
function getLocale(host) {
  return /^[0-9a-f]{24}--/.test(host ?? '') ? 'fr-FR' : 'de-DE'
}

export function proxy(request) {
  const { pathname } = request.nextUrl
  const locale = getLocale(request.headers.get('host'))

  if (pathname === '/rewritten-a') return NextResponse.rewrite(new URL('/a', request.url))

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
