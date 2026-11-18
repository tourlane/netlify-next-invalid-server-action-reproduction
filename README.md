# Netlify + Next.js: Server Action forwarding uses the wrong host

Minimal reproduction for a bug in `@netlify/plugin-nextjs` 5.16.3 with `next` 16.4.5.

## The bug

One Netlify site serves several hostnames. A page calls a Server Action that its own route does not import. Next.js forwards the call to a route that has the action. The forward URL uses `initURL`. For requests without a proxy rewrite, the adapter does not set `initURL` per request. Next.js then uses the hostname that the adapter gave to `getMockedRequestHandler`. That is the hostname of the **first request the Lambda instance served**, and it does not change.

So a call on host B can be forwarded to host A. The forwarded request keeps `Origin: B`. On host A, the Next.js CSRF check sees `Origin ≠ Host` and returns 500 "Invalid Server Actions request".

## The app

| Path           | What it does                                                                     |
| -------------- | -------------------------------------------------------------------------------- |
| `/b`           | Imports `pingAction` (`app/actions.js`). Shows the action ID.                    |
| `/a`           | Does not import the action. A call of the action here is forwarded to `/b`.      |
| `/rewritten-a` | Proxy rewrite to `/a`. The adapter locks `initURL` for rewrites.                 |
| `/debug`       | Returns `request.url`, the host headers and the first host this instance served. |

`pingAction` returns the `host`, `x-forwarded-host`, `origin` and `x-action-forwarded` it sees.

## Test

Use two hostnames of the same deploy, for example the site URL and the deploy permalink:

```sh
node scripts/repro.mjs <site>.netlify.app <deployId>--<site>.netlify.app 5
```

Use a new deploy, so that the Lambda instances are cold. The script warms host A, then calls the action on host B on `/b` (control, no forward), `/a` (forward) and `/rewritten-a` (forward after a rewrite).

## Variants

- `main`: no changes.
- `variant/patched-adapter`: `pnpm patch` that always calls `lockInitURL` with the current request URL.

`experimental.trustHostHeader` is not a workaround: Next.js 16.4.5 removes the key from `next.config` (the build output has `trustHostHeader: false`). Only Vercel turns it on.
