'use client'

import { useState } from 'react'

// The browser sends the same request that Next.js sends for a Server Action:
// a POST to the current URL with the `Next-Action` header.
export function ForeignActionCaller() {
  const [actionId, setActionId] = useState('')
  const [result, setResult] = useState(null)

  async function call() {
    const response = await fetch(window.location.href, {
      method: 'POST',
      headers: {
        'Next-Action': actionId,
        Accept: 'text/x-component',
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: '[]',
    })
    setResult({ status: response.status, body: (await response.text()).slice(0, 500) })
  }

  return (
    <div>
      <label>
        Action ID from /b: <input id="action-id-input" value={actionId} onChange={(e) => setActionId(e.target.value)} size={50} />
      </label>{' '}
      <button id="call" onClick={call} disabled={!actionId}>
        Call action
      </button>
      {result && <pre id="result">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
