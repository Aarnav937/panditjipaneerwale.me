import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyWorkerRequest } from '../../supabase/functions/_shared/worker-auth.js';
describe('private push worker authentication', () => {
  const timestamp = '1792663200';
  const secret = 'fixture-only-not-a-production-credential';
  const signature = createHmac('sha256', secret).update('store-push:' + timestamp).digest('hex');
  it('accepts a fresh signed request and rejects tampering', async () => {
    expect(await verifyWorkerRequest(timestamp, signature, secret, Number(timestamp) * 1000)).toBe(true);
    expect(await verifyWorkerRequest(timestamp, signature, 'wrong-secret', Number(timestamp) * 1000)).toBe(false);
    expect(await verifyWorkerRequest(timestamp, 'a'.repeat(64), secret, Number(timestamp) * 1000)).toBe(false);
  });
  it('rejects expired, future and malformed signatures', async () => {
    expect(await verifyWorkerRequest(timestamp, signature, secret, (Number(timestamp) + 91) * 1000)).toBe(false);
    expect(await verifyWorkerRequest(timestamp, signature, secret, (Number(timestamp) - 91) * 1000)).toBe(false);
    expect(await verifyWorkerRequest('', '', secret)).toBe(false);
  });
});
