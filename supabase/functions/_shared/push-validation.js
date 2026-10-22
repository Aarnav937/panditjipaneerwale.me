export function isPushEndpoint(value) {
  try {
    const u = new URL(value);
    return typeof value === 'string' && value.length <= 2048 && u.protocol === 'https:' && !u.username && !u.password && !u.port && !u.hash &&
      (u.hostname === 'fcm.googleapis.com' || u.hostname === 'updates.push.services.mozilla.com' || u.hostname === 'web.push.apple.com' || u.hostname.endsWith('.notify.windows.com'));
  } catch { return false; }
}
export function isPushSubscription(value) {
  if (!value || !isPushEndpoint(value.endpoint)) return false;
  try {
    const decode = key => atob(key.replace(/-/g, '+').replace(/_/g, '/'));
    if (!/^[A-Za-z0-9_-]{87}$/.test(value.keys?.p256dh) || !/^[A-Za-z0-9_-]{22}$/.test(value.keys?.auth)) return false;
    const key = decode(value.keys.p256dh), auth = decode(value.keys.auth);
    return key.length === 65 && key.charCodeAt(0) === 4 && auth.length === 16;
  } catch { return false; }
}
