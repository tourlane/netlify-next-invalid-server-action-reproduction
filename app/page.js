export default function Home() {
  return (
    <main>
      <h1>Server Action forwarding repro</h1>
      <ul>
        <li><a href="/b">/b</a>: owns the action. Shows its ID.</li>
        <li><a href="/a">/a</a>: calls the action of /b. Next.js forwards the call.</li>
        <li><a href="/rewritten-a">/rewritten-a</a>: same as /a, but reached through a proxy rewrite.</li>
        <li><a href="/debug">/debug</a>: shows request.url, host headers and the instance record.</li>
      </ul>
      <p>See README.md for the test steps.</p>
    </main>
  )
}
