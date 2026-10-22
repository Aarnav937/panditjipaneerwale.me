import { useEffect, useState } from 'react';
import { getTodaySeed } from './discounts';
export function nextStoreMidnight(now = new Date()) {
  const date = getTodaySeed(now);
  const midnight = Date.parse(`${date}T00:00:00+04:00`) + 86400000;
  return Math.max(250, midnight - now.getTime() + 250);
}
export function useStoreDay() {
  const [day, setDay] = useState(() => getTodaySeed());
  useEffect(() => {
    let timer;
    const refresh = () => {
      clearTimeout(timer); setDay(getTodaySeed());
      timer = setTimeout(refresh, nextStoreMidnight());
    };
    refresh();
    const wake = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', wake);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', wake); };
  }, []);
  return day;
}
