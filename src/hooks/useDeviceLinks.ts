import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { getDbInstance } from '../services/firebase';

interface DeviceLink {
  id: string;
  deviceId: string;
  userId: string;
  role: 'patient' | 'caregiver';
  status: 'active' | 'inactive';
  linkedAt: Date;
  linkedBy: string;
}

interface UseDeviceLinksOptions {
  deviceId?: string;
  enabled?: boolean;
}

interface UseDeviceLinksResult {
  deviceLinks: DeviceLink[];
  caregiverCount: number;
  hasCaregivers: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch device links from Firestore with real-time updates
 * 
 * This hook sets up a real-time listener for device link changes.
 * It automatically updates when caregivers connect or disconnect.
 * 
 * Features:
 * - Real-time updates via Firestore onSnapshot
 * - Counts active caregivers
 * - Error handling
 * - Loading states
 * - Automatic cleanup on unmount
 * 
 * @param options - Hook configuration
 * @returns Device links data, caregiver count, loading state, error, and refetch function
 */
export function useDeviceLinks({
  deviceId,
  enabled = true,
}: UseDeviceLinksOptions): UseDeviceLinksResult {
  const [deviceLinks, setDeviceLinks] = useState<DeviceLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshToggle, setRefreshToggle] = useState(false);

  /**
   * Set up Firestore listener for device links
   */
  useEffect(() => {
    if (!deviceId || !enabled) {
      setIsLoading(false);
      setDeviceLinks([]);
      setError(null);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    const setupListener = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const db = await getDbInstance();
        if (!db) {
          throw new Error('Firebase Firestore not initialized');
        }

        // Query for all active device links for this device
        const deviceLinksQuery = query(
          collection(db, 'deviceLinks'),
          where('deviceId', '==', deviceId),
          where('status', '==', 'active')
        );

        unsubscribe = onSnapshot(
          deviceLinksQuery,
          (snapshot: QuerySnapshot<DocumentData>) => {
            if (!mounted) return;

            const links: DeviceLink[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: data.id || doc.id,
                deviceId: data.deviceId,
                userId: data.userId,
                role: data.role,
                status: data.status,
                linkedAt: data.linkedAt?.toDate() || new Date(),
                linkedBy: data.linkedBy,
              };
            });

            setDeviceLinks(links);
            setIsLoading(false);
            setError(null);

            const caregivers = links.filter(link => link.role === 'caregiver');
            console.log('[useDeviceLinks] Device links updated:', {
              deviceId,
              totalLinks: links.length,
              caregiverCount: caregivers.length,
              links: links.map(l => ({ userId: l.userId, role: l.role })),
            });
          },
          (err) => {
            if (!mounted) return;

            console.error('[useDeviceLinks] Firestore listener error:', err);
            setError(err as Error);
            setIsLoading(false);
          }
        );
      } catch (err: any) {
        if (!mounted) return;

        console.error('[useDeviceLinks] Setup error:', err);
        setError(err);
        setIsLoading(false);
      }
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [deviceId, enabled, refreshToggle]);

  /**
   * Manual refetch function (triggers re-setup of listener)
   */
  const refetch = useCallback(() => {
    setRefreshToggle(prev => !prev);
  }, []);

  // Calculate derived values
  const caregiverCount = deviceLinks.filter(link => link.role === 'caregiver').length;
  const hasCaregivers = caregiverCount > 0;

  return {
    deviceLinks,
    caregiverCount,
    hasCaregivers,
    isLoading,
    error,
    refetch,
  };
}
