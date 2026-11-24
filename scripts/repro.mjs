// Usage: node scripts/repro.mjs <hostA> <hostB> [rounds]
// Example: node scripts/repro.mjs my-site.netlify.app 1234abcd--my-site.netlify.app 5
//
// 1. A request to host A warms a Lambda instance. The adapter caches host A as its hostname.
// 2. A Server Action call on host B is sent to a route that does not own the action.
//    Next.js forwards it to the cached host (A). Origin is B, Host is A, so the CSRF check fails.
const [hostA, hostB, roundsArg = '5'] = process.argv.slice(2)
if (!hostA || !hostB) {
  console.error('Usage: node scripts/repro.mjs <hostA> <hostB> [rounds]')
  process.exit(1)
}
const rounds = Number(roundsArg)
const TIMEOUT_MS = 20_000
const baseUrl = (host) => (host.startsWith("localhost") ? `http://${host}` : `https://${host}`)

const get = (host, path) => fetch(`${baseUrl(host)}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })

async function callAction(host, path, actionId) {
  const response = await fetch(`${baseUrl(host)}${path}`, {
    method: 'POST',
    headers: {
      'Next-Action': actionId,
      Origin: `${baseUrl(host)}`,
      Accept: 'text/x-component',
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    body: '[]',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const body = await response.text()
  const resultLine = body.split('\n').find((line) => line.startsWith('1:'))
  let result
  try {
    result = resultLine ? JSON.parse(resultLine.slice(2)) : undefined
  } catch {}
  // A failed forward still returns 200. The action result line then holds an error (`1:E{...}`).
  const actionFailed = response.status >= 400 || !resultLine || resultLine.startsWith('1:E')
  return {
    ok: !actionFailed,
    status: response.status,
    ranOnHost: result?.host,
    ranOnInstance: result?.instance?.instanceId,
    error: actionFailed ? body.split('\n').slice(1).join(' ').slice(0, 80) : undefined,
  }
}

const warm = await (await get(hostA, '/debug')).json()
console.log(`Warm-up on ${hostA}/debug:`, JSON.stringify(warm, null, 2))

const pageB = await (await get(hostB, '/b')).text()
const actionId = pageB.match(/data-action-id="([^"]+)"/)?.[1]
if (!actionId) throw new Error('Could not read the action ID from /b')
console.log(`Action ID: ${actionId}\n`)

const rows = []
for (let round = 1; round <= rounds; round++) {
  await get(hostA, '/debug')
  for (const path of ['/b', '/a', '/rewritten-a']) {
    const result = await callAction(hostB, path, actionId)
    const debugB = await (await get(hostB, '/debug')).json()
    rows.push({
      round,
      call: `POST ${hostB}${path}`,
      ...result,
      instanceFirstSeenHost: debugB.instance.firstSeenHost,
    })
  }
}
console.table(rows)

const failed = rows.filter((row) => !row.ok)
console.log(
  failed.length
    ? `REPRODUCED: ${failed.length}/${rows.length} calls failed (${[...new Set(failed.map((r) => r.call))].join(', ')}).`
    : `NOT REPRODUCED: all ${rows.length} calls succeeded.`,
)
