import { supabase } from './supabase';

export const isPushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
async function callPush(body) {
  if (!supabase) throw new Error('Notifications are temporarily unavailable.');
  const { data, error } = await supabase.functions.invoke('push-subscription', { body });
  if (error || data?.error) throw new Error(data?.error || 'Could not save notification settings. Please retry.');
  return data;
}
export async function initializePushNotifications() {
  if (!isPushSupported()) throw new Error('This browser does not support notifications. On iPhone, add the store to your Home Screen first.');
  if (!supabase) throw new Error('Notifications are temporarily unavailable.');
  // Called only by an explicit button click, never during page load.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission is blocked. You can enable it in this browser’s site settings.');
  const config = await callPush({ op: 'config' });
  if (!config?.publicKey) throw new Error('Notification delivery is not ready.');
  const registration = await navigator.serviceWorker.register('/sw.js');
  let timer;
  let active;
  try {
    active = await Promise.race([navigator.serviceWorker.ready || Promise.resolve(registration), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('The notification service took too long. Please retry.')), 12000); })]);
  } finally { clearTimeout(timer); }
  let subscription = await active.pushManager.getSubscription();
  const created = !subscription;
  if (!subscription) subscription = await active.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(config.publicKey) });
  try {
    const result = await callPush({ op: 'subscribe', subscription: subscription.toJSON() });
    if (!result?.success) throw new Error('Could not save notification settings.');
  } catch (error) {
    if (created) await subscription.unsubscribe();
    throw error;
  }
  return true;
}
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration('/');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return true;
  const result = await callPush({ op: 'unsubscribe', subscription: subscription.toJSON() });
  if (!result?.success) throw new Error('Could not disable notifications. Please retry.');
  await subscription.unsubscribe();
  return true;
}
function urlBase64ToUint8Array(value) {
  const raw = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, character => character.charCodeAt(0));
}
