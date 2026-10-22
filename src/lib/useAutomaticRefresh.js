import { useEffect } from 'react';
// Refresh only while the panel is mounted, and catch up after a sleeping phone wakes.
export function useAutomaticRefresh(refresh) {
  useEffect(() => {
    refresh();
    const update = () => { if (document.visibilityState === 'visible') refresh(true); };
    const timer = setInterval(update, 30000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, [refresh]);
}
