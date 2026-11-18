export const metadata = { title: 'Server Action forwarding repro' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>{children}</body>
    </html>
  )
}
