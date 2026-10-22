import { describe, it, expect } from 'vitest';
import { isPushEndpoint, isPushSubscription } from '../../supabase/functions/_shared/push-validation.js';
describe('push destination and subscription validation', () => {
  it('accepts only HTTPS vendor push endpoints', () => {
    for (const url of ['https://fcm.googleapis.com/fcm/send/token', 'https://updates.push.services.mozilla.com/wpush/v2/token', 'https://web.push.apple.com/token']) expect(isPushEndpoint(url)).toBe(true);
    for (const url of ['http://fcm.googleapis.com/a', 'https://127.0.0.1/a', 'https://fcm.googleapis.com.evil.test/a', 'https://user:pass@fcm.googleapis.com/a', 'https://fcm.googleapis.com:444/a', 'https://example.com/a']) expect(isPushEndpoint(url)).toBe(false);
  });
  it('requires a 65-byte uncompressed public key and 16-byte auth secret', () => {
    const key = btoa(String.fromCharCode(4) + 'a'.repeat(64)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const auth = btoa('a'.repeat(16)).replace(/=/g, '');
    const valid = { endpoint: 'https://fcm.googleapis.com/fcm/send/token', keys: { p256dh: key, auth } };
    expect(isPushSubscription(valid)).toBe(true);
    expect(isPushSubscription({ ...valid, keys: { p256dh: key, auth: 'bad' } })).toBe(false);
    expect(isPushSubscription(null)).toBe(false);
  });
});
