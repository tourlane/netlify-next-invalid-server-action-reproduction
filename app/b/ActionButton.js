'use client'

import { useState } from 'react'

export function ActionButton({ action }) {
  const [result, setResult] = useState(null)

  async function run(changeUrlFirst) {
    // Next.js sends a Server Action to the router's current URL. Next.js syncs that URL with
    // window.history, so code that changes the URL (filters, steps, tracking) moves the POST
    // to another route. That route does not own the action, so Next.js forwards it.
    if (changeUrlFirst) window.history.replaceState(null, '', '/a')
    try {
      setResult({ ok: true, value: await action() })
    } catch (error) {
      setResult({ ok: false, error: String(error) })
    }
  }

  return (
    <div>
      <button id="call-here" onClick={() => run(false)}>
        Call action (no forward)
      </button>{' '}
      <button id="call-after-url-change" onClick={() => run(true)}>
        Change URL to /a, then call action (forward)
      </button>
      {result && <pre id="result">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
