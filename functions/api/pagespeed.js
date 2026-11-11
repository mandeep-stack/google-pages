// Cloudflare Pages Function: GET /api/pagespeed?url=https://example.com
// Runs the Google PageSpeed Insights check server-side so the API key stays secret.
// Needs one environment variable on this Pages project: PAGESPEED_API_KEY

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: JSON_HEADERS });
}

export async function onRequestGet({ request, env }) {
  const reqUrl = new URL(request.url);

  // Light abuse guard: only answer calls that come from this site's own pages.
  const referer = request.headers.get('Referer');
  if (referer) {
    try {
      if (new URL(referer).host !== reqUrl.host) return json({ error: 'Not allowed.' }, 403);
    } catch (e) {
      return json({ error: 'Not allowed.' }, 403);
    }
  }

  const target = reqUrl.searchParams.get('url');
  if (!target) return json({ error: 'Missing url parameter' }, 400);
  if (!/^https?:\/\//i.test(target) || target.length > 500) {
    return json({ error: 'url must start with http:// or https://' }, 400);
  }
  if (!env.PAGESPEED_API_KEY) {
    return json({ error: 'Server is not configured (missing PAGESPEED_API_KEY).' }, 500);
  }

  const apiUrl =
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed' +
    '?url=' + encodeURIComponent(target) +
    '&strategy=mobile' +
    '&key=' + encodeURIComponent(env.PAGESPEED_API_KEY);

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.error) return json({ error: data.error.message || 'PageSpeed API error' }, 502);
    return json(data, 200);
  } catch (err) {
    return json({ error: 'Could not reach PageSpeed API.' }, 502);
  }
}
