'use client'

import { useState } from 'react'

export function ActionButton({ action }) {
  const [result, setResult] = useState(null)
  return (
    <div>
      <button onClick={async () => setResult(await action())}>Call action on /b (no forward)</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
