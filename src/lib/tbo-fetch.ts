import "server-only";

/**
 * tboFetch — the ONE fetch every TBO call must go through.
 *
 * TBO production credentials are IP-whitelisted, but Vercel functions have no
 * fixed egress IP. When `TBO_PROXY_URL` is set (http://user:pass@host:port —
 * our static-IP forward proxy; see reference/hotel-cert/static-ip-proxy/),
 * requests are routed through it via an undici ProxyAgent so TBO always sees
 * the whitelisted IP. Unset (dev/staging) → plain direct fetch, identical
 * behavior to before.
 */
import { ProxyAgent } from "undici";

let agent: ProxyAgent | null | undefined;

function dispatcher(): ProxyAgent | undefined {
  if (agent === undefined) {
    const url = process.env.TBO_PROXY_URL?.trim();
    agent = url ? new ProxyAgent(url) : null;
  }
  return agent ?? undefined;
}

export function tboFetch(url: string, init: RequestInit): Promise<Response> {
  const d = dispatcher();
  // `dispatcher` is undici's extension to RequestInit — Next's nodejs runtime
  // fetch passes it through, but the DOM lib types don't know it.
  return d ? fetch(url, { ...init, dispatcher: d } as RequestInit) : fetch(url, init);
}
