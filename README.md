# Netlify + Next.js: Server Action forwarding uses the wrong host

Minimal reproduction for a bug in `@netlify/plugin-nextjs` 5.16.3 with `next` 16.4.5.

## The bug

One Netlify site serves several hostnames. A page calls a Server Action that its own route does not import. Next.js forwards the call to a route that has the action. The forward URL uses `initURL`. For requests without a proxy rewrite, the adapter does not set `initURL` per request. Next.js then uses the hostname that the adapter gave to `getMockedRequestHandler`. That is the hostname of the **first request the Lambda instance served**, and it does not change.

So a call on host B can be forwarded to host A. The forwarded request keeps `Origin: B`. On host A, the Next.js CSRF check sees `Origin ≠ Host` and returns 500 "Invalid Server Actions request".

## The app

| Path           | What it does                                                                     |
| -------------- | -------------------------------------------------------------------------------- |
| `/b`           | Imports `pingAction` (`app/actions.js`). Shows the action ID. The second button changes the URL to `/a` with `history.replaceState` and then calls the action. This forwards the call without a manual action ID. |
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

## Results (2026-11-18)

Both deploys were warm. The Lambda instance had first served host A. Then 4 rounds of calls on host B:

| Call on host B                           | Unpatched (`main`) | Patched (`variant/patched-adapter`) |
| ---------------------------------------- | ------------------ | ----------------------------------- |
| `/b` (owns the action, no forward)       | 4/4 OK             | 4/4 OK                              |
| `/a` (forward)                           | **0/4 OK**         | 4/4 OK                              |
| `/rewritten-a` (forward after a rewrite) | 4/4 OK             | 4/4 OK                              |

Function log of a failed call (unpatched):

```
`x-forwarded-host` header with value `next-invalid-server-action-reproducti.netlify.app` does not match `origin` header with value `6afdbd60efc77d2886445027--next-invalid-server-action-reproducti.netlify.app` from a forwarded Server Actions request. Aborting the action.
⨯ Error: Invalid Server Actions request.
```

The outer response is `200`. The action result holds the error (`1:E{"digest":"2548910437"}`), and the browser throws React error #441.

`GET /debug` shows the cause without a Server Action. On an instance that first served host A, a request on host B gives:

- unpatched: `request.url` has host A (the cached hostname)
- patched: `request.url` has host B
