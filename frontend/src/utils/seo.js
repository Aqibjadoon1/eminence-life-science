/**
 * SEO helpers — canonical URL construction for react-helmet-async.
 *
 * Canonicals are built from the live origin so they stay correct on any
 * deployed domain. For pages whose URL carries filter/sort/search query
 * params (shop), pass the canonical path WITHOUT the params so filtered
 * views consolidate on the unfiltered page (no duplicate content).
 */
export function canonicalUrl(path) {
  return `${window.location.origin}${path}`;
}
