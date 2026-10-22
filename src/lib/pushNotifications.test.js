import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializePushNotifications } from './pushNotifications';
const mocks=vi.hoisted(()=>({invoke:vi.fn(),subscribe:vi.fn(),unsubscribe:vi.fn()}));
vi.mock('./supabase',()=>({supabase:{functions:{invoke:mocks.invoke}}}));
describe('explicit browser push opt-in',()=>{
  beforeEach(()=>{
    vi.stubGlobal('Notification',{permission:'default',requestPermission:vi.fn().mockResolvedValue('granted')});
    vi.stubGlobal('PushManager',function(){});
    const subscription={toJSON:()=>({endpoint:'https://fcm.googleapis.com/fcm/send/test',keys:{p256dh:'A'.repeat(87),auth:'A'.repeat(22)}}),unsubscribe:mocks.unsubscribe.mockResolvedValue(true)};
    mocks.subscribe.mockResolvedValue(subscription);
    Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{register:vi.fn().mockResolvedValue({pushManager:{getSubscription:vi.fn().mockResolvedValue(null),subscribe:mocks.subscribe}})}});
    mocks.invoke.mockImplementation(async(_name,{body})=>body.op==='config'?{data:{publicKey:'A'.repeat(87)},error:null}:{data:{success:true},error:null});
  });
  it('registers the real endpoint and keys through the server before claiming success',async()=>{
    expect(await initializePushNotifications()).toBe(true);
    expect(mocks.invoke).toHaveBeenCalledWith('push-subscription',expect.objectContaining({body:expect.objectContaining({op:'subscribe',subscription:expect.objectContaining({endpoint:expect.stringContaining('fcm.googleapis.com')})})}));
  });
  it('does not contact the server after notification permission is denied',async()=>{
    mocks.invoke.mockClear(); Notification.requestPermission.mockResolvedValue('denied');
    await expect(initializePushNotifications()).rejects.toThrow(/permission|blocked/i);
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it('rolls back a new local subscription if saving it fails',async()=>{
    mocks.invoke.mockImplementation(async(_name,{body})=>body.op==='config'?{data:{publicKey:'A'.repeat(87)},error:null}:{data:null,error:{message:'Unavailable'}});
    await expect(initializePushNotifications()).rejects.toThrow();
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });
});
