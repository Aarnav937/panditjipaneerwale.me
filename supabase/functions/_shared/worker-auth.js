// Queue headers contain only a short-lived signature, never the reusable worker secret.
export async function verifyWorkerRequest(timestamp, signature, secret, now = Date.now()) {
  if (!/^\d{10}$/.test(timestamp || '') || !/^[a-f0-9]{64}$/.test(signature || '') || !secret) return false;
  if (Math.abs(now / 1000 - Number(timestamp)) > 90) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const bytes = Uint8Array.from(signature.match(/../g), byte => parseInt(byte, 16));
  return crypto.subtle.verify('HMAC', key, bytes, encoder.encode('store-push:' + timestamp));
}
