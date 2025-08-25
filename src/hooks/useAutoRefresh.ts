import { useEffect, useCallback } from 'react';

interface UseAutoRefreshOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
}

export function useAutoRefresh(
  refreshFunction: () => void | Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const { interval = 30000, enabled = true } = options; // Default 30 seconds

  const refresh = useCallback(async () => {
    try {
      await refreshFunction();
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  }, [refreshFunction]);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(refresh, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [refresh, interval, enabled]);

  return { refresh };
}
