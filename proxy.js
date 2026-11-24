import { NextResponse } from 'next/server'

// Our production app uses a proxy that rewrites many paths. The adapter treats rewritten requests in a different way
// (it locks `initURL` to the public URL). This rewrite lets us test that path too.
export function proxy(request) {
  return NextResponse.rewrite(new URL('/a', request.url))
}

export const config = { matcher: ['/rewritten-a'] }
