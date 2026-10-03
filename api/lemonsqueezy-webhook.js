// api/lemonsqueezy-webhook.js — Lemon Squeezy → Yodoku+ entitlement receiver.
// Vercel Edge function. Verifies the X-Signature header (HMAC-SHA256 over the RAW
// body, keyed with LS_WEBHOOK_SECRET). Persists to Supabase `entitlements` when
// SUPABASE_URL + SUPABASE_SERVICE_KEY are set; until then it validates + logs and
// returns 200 with { persisted:false }. Tested locally: scripts test in scratch
// (valid signature → 200, tampered signature → 401).

export const config = { runtime: 'edge' };

const textEncoder = new TextEncoder();

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** HMAC-SHA256(secret, bodyText) as lowercase hex. */
export async function signBody(secret, bodyText) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(bodyText));
  return toHex(sig);
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function persistEntitlement(record) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/rest/v1/entitlements`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(record),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function recordFor(eventName, payload) {
  const attrs = (payload && payload.data && payload.data.attributes) || {};
  const email = attrs.user_email || attrs.email || null;
  if (!email) return null;
  const subId = (payload.data && payload.data.id) || null;
  const plan = attrs.variant_name || attrs.product_name || null;
  const now = new Date().toISOString();
  if (
    eventName === 'subscription_created' ||
    eventName === 'subscription_updated' ||
    eventName === 'subscription_resumed'
  ) {
    return { email, status: attrs.status || 'active', plan, ls_subscription_id: subId, updated_at: now };
  }
  if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
    return { email, status: 'inactive', plan, ls_subscription_id: subId, updated_at: now };
  }
  return null;
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method-not-allowed' }), { status: 405 });
  }

  const secret = process.env.LS_WEBHOOK_SECRET || '';
  if (!secret) {
    return new Response(JSON.stringify({ ok: false, error: 'not-configured' }), { status: 503 });
  }

  const signature = request.headers.get('x-signature') || '';
  const raw = await request.text();

  const expected = await signBody(secret, raw);
  if (!safeEqual(expected, signature)) {
    return new Response(JSON.stringify({ ok: false, error: 'bad-signature' }), { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad-json' }), { status: 400 });
  }

  const eventName = (payload.meta && payload.meta.event_name) || 'unknown';
  const record = recordFor(eventName, payload);
  const persisted = record ? await persistEntitlement(record) : false;

  return new Response(JSON.stringify({ ok: true, event: eventName, persisted }), { status: 200 });
}
