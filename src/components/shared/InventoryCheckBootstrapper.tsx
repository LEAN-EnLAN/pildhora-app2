import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { lowQuantityNotificationService } from '../../services/lowQuantityNotification';

/**
 * Component that bootstraps inventory checking on app startup and foreground
 * Runs daily checks for low inventory medications
 */
export const InventoryCheckBootstrapper: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const appState = useRef(AppState.currentState);
  const hasRunInitialCheck = useRef(false);

  // Run initial check on mount
  useEffect(() => {
    const runInitialCheck = async () => {
      if (!user?.id || hasRunInitialCheck.current) {
        return;
      }

      try {
        console.log('[InventoryCheckBootstrapper] Running initial inventory check');
        
        const shouldRun = await lowQuantityNotificationService.shouldRunDailyCheck();
        
        if (shouldRun) {
          await lowQuantityNotificationService.checkAllMedicationsForLowInventory(user.id);
          await lowQuantityNotificationService.markDailyCheckComplete();
          console.log('[InventoryCheckBootstrapper] Initial check complete');
        } else {
          console.log('[InventoryCheckBootstrapper] Daily check already run today');
        }
        
        hasRunInitialCheck.current = true;
      } catch (error) {
        console.error('[InventoryCheckBootstrapper] Error running initial check:', error);
      }
    };

    runInitialCheck();
  }, [user?.id]);

  // Listen for app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // App has come to the foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (!user?.id) {
          return;
        }

        try {
          console.log('[InventoryCheckBootstrapper] App foregrounded, checking inventory');
          
          const shouldRun = await lowQuantityNotificationService.shouldRunDailyCheck();
          
          if (shouldRun) {
            await lowQuantityNotificationService.checkAllMedicationsForLowInventory(user.id);
            await lowQuantityNotificationService.markDailyCheckComplete();
            console.log('[InventoryCheckBootstrapper] Foreground check complete');
          } else {
            console.log('[InventoryCheckBootstrapper] Daily check already run today');
          }
        } catch (error) {
          console.error('[InventoryCheckBootstrapper] Error running foreground check:', error);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user?.id]);

  // This component doesn't render anything
  return null;
};
