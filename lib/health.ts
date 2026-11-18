/**
 * Is a project's demo actually up?
 *
 * Runs on the server only: the home page is prerendered and re-rendered every
 * `HEALTH_REVALIDATE` seconds (see app/page.tsx), so visitors never call the
 * demo domains themselves and a burst of traffic costs one check per window.
 *
 * "Up" means the demo answered with a 2xx after redirects. It says the site
 * serves a page, not that every feature behind it works.
 */

/** Seconds between re-checks. Also the page's `revalidate`. */
export const HEALTH_REVALIDATE = 300;

// Generous on purpose: the check runs in the background when the page is
// re-rendered, so visitors never wait for it, and DevToolBox AI answers in ~7s.
const TIMEOUT_MS = 12000;

async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'portfolio-health-check' },
      next: { revalidate: HEALTH_REVALIDATE },
    });
    // We only need the status line; do not download the page.
    await res.body?.cancel();
    return res.ok;
  } catch {
    return false;
  }
}

/** One retry, so a single dropped request does not flip a card to "offline". */
export async function isUp(url: string): Promise<boolean> {
  return (await probe(url)) || (await probe(url));
}

/** Checks all URLs in parallel; the result maps each URL to up (true) or down. */
export async function checkAll(urls: string[]): Promise<Record<string, boolean>> {
  const results = await Promise.all(urls.map(isUp));
  return Object.fromEntries(urls.map((u, i) => [u, results[i]]));
}
