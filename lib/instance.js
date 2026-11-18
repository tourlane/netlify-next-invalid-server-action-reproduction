// One record per Lambda instance. It keeps the host of the first request this instance served,
// because the Netlify adapter caches that host and Next.js uses it for Server Action forwarding.
const KEY = Symbol.for('repro.instance')

export function noteInstance(host) {
  globalThis[KEY] ??= {
    instanceId: Math.random().toString(36).slice(2, 10),
    startedAt: new Date().toISOString(),
    firstSeenHost: host,
  }
  return globalThis[KEY]
}
