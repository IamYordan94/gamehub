// api/subscribe.js — newsletter signup receiver (Brevo or Resend).
// Vercel Edge function, dormant-safe: returns 503 "not-configured" until
// BREVO_API_KEY+BREVO_LIST_ID or RESEND_API_KEY+RESEND_AUDIENCE_ID are set.
// The front-end form only renders when VITE_NEWSLETTER_ENABLED=true, so users
// never see a dead form.

export const config = { runtime: 'edge' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export default async function handler(request) {
  if (request.method !== 'POST') return json({ ok: false, error: 'method-not-allowed' }, 405);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'bad-json' }, 400);
  }

  // Honeypot: real users never fill a field named "company".
  if (String((payload && payload.company) || '').trim()) return json({ ok: true, spam: true });

  const email = String((payload && payload.email) || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ ok: false, error: 'invalid-email' }, 400);

  const brevoKey = process.env.BREVO_API_KEY;
  const brevoList = process.env.BREVO_LIST_ID;
  const resendKey = process.env.RESEND_API_KEY;
  const resendAudience = process.env.RESEND_AUDIENCE_ID;

  try {
    if (brevoKey && brevoList) {
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json', accept: 'application/json' },
        // updateEnabled=true → re-subscribing an existing contact is a no-op, not a 400.
        body: JSON.stringify({ email, listIds: [Number(brevoList)], updateEnabled: true }),
      });
      if (!res.ok) {
        const detail = await res.text();
        return json({ ok: false, error: 'provider', provider: 'brevo', status: res.status, detail: detail.slice(0, 200) }, 502);
      }
      return json({ ok: true, provider: 'brevo' });
    }

    if (resendKey && resendAudience) {
      const res = await fetch(`https://api.resend.com/audiences/${resendAudience}/contacts`, {
        method: 'POST',
        headers: { authorization: `Bearer ${resendKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ email, unsubscribed: false }),
      });
      if (!res.ok) {
        const detail = await res.text();
        return json({ ok: false, error: 'provider', provider: 'resend', status: res.status, detail: detail.slice(0, 200) }, 502);
      }
      return json({ ok: true, provider: 'resend' });
    }

    return json({ ok: false, error: 'not-configured' }, 503);
  } catch {
    return json({ ok: false, error: 'network' }, 502);
  }
}
