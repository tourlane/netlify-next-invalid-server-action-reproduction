// The request data that shows how Netlify routed a request (Skew Protection, host, deploy).
export function getRequestInfo(headers, url) {
  return {
    deployId: process.env.DEPLOY_ID,
    url,
    host: headers.get('host'),
    xForwardedHost: headers.get('x-forwarded-host'),
    origin: headers.get('origin'),
    xDeploymentId: headers.get('x-deployment-id'),
    xActionForwarded: headers.get('x-action-forwarded'),
    nextAction: headers.get('next-action'),
    nfHeaders: Object.fromEntries([...headers.entries()].filter(([name]) => name.startsWith('x-nf-') && name !== 'x-nf-client-connection-ip')),
    cookieNames: (headers.get('cookie') ?? '').split(';').map((c) => c.split('=')[0].trim()).filter(Boolean),
  }
}
