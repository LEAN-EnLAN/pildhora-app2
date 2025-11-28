import { useEffect, useState, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { getRdbInstance } from '../services/firebase';

interface UseTopoStatusResult {
  isTopoActive: boolean;
  wasTopoActive: boolean; // To track transitions
  isLoading: boolean;
  error: Error | null;
}

export function useTopoStatus(deviceId?: string): UseTopoStatusResult {
  const [isTopoActive, setIsTopoActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const previousTopoRef = useRef<boolean>(false);
  const [wasTopoActive, setWasTopoActive] = useState(false);

  useEffect(() => {
    if (!deviceId) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      try {
        const rdb = await getRdbInstance();
        if (!rdb) return;

        const topoRef = ref(rdb, `devices/${deviceId}/commands/topo`);

        unsubscribe = onValue(topoRef, (snapshot) => {
          const value = snapshot.val();
          const isActive = value === true;
          
          // Track transition from true -> false
          if (previousTopoRef.current && !isActive) {
            setWasTopoActive(true);
            // Reset wasTopoActive after a short delay to allow animation to play
            setTimeout(() => setWasTopoActive(false), 5000);
          }
          
          previousTopoRef.current = isActive;
          setIsTopoActive(isActive);
          setIsLoading(false);
        }, (err) => {
          console.error('Error listening to topo status:', err);
          setError(err);
          setIsLoading(false);
        });

      } catch (err: any) {
        setError(err);
        setIsLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [deviceId]);

  return { isTopoActive, wasTopoActive, isLoading, error };
}
