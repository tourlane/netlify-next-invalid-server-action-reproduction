import { noteInstance } from '@/lib/instance'

export const dynamic = 'force-dynamic'

export function GET(request) {
  const instance = noteInstance(request.headers.get('host'))
  return Response.json({
    requestUrl: request.url,
    host: request.headers.get('host'),
    xForwardedHost: request.headers.get('x-forwarded-host'),
    xForwardedProto: request.headers.get('x-forwarded-proto'),
    instance,
  })
}
