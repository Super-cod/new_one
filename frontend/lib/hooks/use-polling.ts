import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions {
  interval?: number;
  maxAttempts?: number;
  enabled?: boolean;
}

interface PollingState<T> {
  data: T | null;
  isPolling: boolean;
  error: string | null;
  attemptCount: number;
}

export function usePolling<T>(
  pollFunction: () => Promise<T>,
  shouldStopPolling: (data: T | null) => boolean,
  options: UsePollingOptions = {}
) {
  const {
    interval = 2000,
    maxAttempts = 30,
    enabled = true
  } = options;

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    isPolling: false,
    error: null,
    attemptCount: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const stopPolling = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isPolling: false }));
  }, []);

  const startPolling = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    setState(prev => ({ ...prev, isPolling: true, error: null }));

    const poll = async () => {
      if (!mountedRef.current) return;

      try {
        const data = await pollFunction();
        
        if (!mountedRef.current) return;

        setState(prev => ({ 
          ...prev, 
          data, 
          attemptCount: prev.attemptCount + 1,
          error: null 
        }));

        if (shouldStopPolling(data)) {
          stopPolling();
          return;
        }

        if (state.attemptCount >= maxAttempts) {
          setState(prev => ({ 
            ...prev, 
            isPolling: false,
            error: 'Polling timeout: Maximum attempts reached' 
          }));
          return;
        }

        if (mountedRef.current) {
          timeoutRef.current = setTimeout(poll, interval);
        }
      } catch (error) {
        if (!mountedRef.current) return;

        const errorMessage = error instanceof Error ? error.message : 'Polling failed';
        setState(prev => ({ 
          ...prev, 
          isPolling: false,
          error: errorMessage 
        }));
      }
    };

    poll();
  }, [enabled, pollFunction, shouldStopPolling, interval, maxAttempts, state.attemptCount, stopPolling]);

  const resetPolling = useCallback(() => {
    stopPolling();
    setState({
      data: null,
      isPolling: false,
      error: null,
      attemptCount: 0,
    });
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    ...state,
    startPolling,
    stopPolling,
    resetPolling,
  };
}
