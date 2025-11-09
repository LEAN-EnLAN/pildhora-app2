import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import slices
import authReducer from './slices/authSlice';
import medicationsReducer from './slices/medicationsSlice';
import intakesReducer from './slices/intakesSlice';
import tasksReducer from './slices/tasksSlice';
import bleReducer from './slices/bleSlice';
import deviceReducer from './slices/deviceSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['medications', 'tasks'], // Persist these slices, not BLE/device real-time state
  // Auth state will be rehydrated but validated against Firebase on app start
  blacklist: ['auth'], // Don't persist auth state to avoid stale authentication
};

const rootReducer = combineReducers({
  auth: authReducer,
  medications: medicationsReducer,
  intakes: intakesReducer,
  tasks: tasksReducer,
  ble: bleReducer,
  device: deviceReducer,
});

// Create a root reducer that can reset state when needed
const createRootReducer = () => {
  const appReducer = rootReducer;
  
  return (state: any, action: any) => {
    // Clear all state on logout or when auth state is invalid
    if (action.type === 'auth/clearAuthState') {
      // Reset auth state completely
      state = {
        ...state,
        auth: {
          user: null,
          loading: false,
          initializing: false,
          error: null,
          isAuthenticated: false,
        }
      };
    }
    
    return appReducer(state, action);
  };
};

const persistedReducer = persistReducer(persistConfig, createRootReducer());

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        // Ignore all date/timestamp fields for serializable check
        ignoredPaths: [
          'auth.user.createdAt',
          'medications.medications.createdAt',
          'medications.medications.updatedAt',
          'intakes.intakes.scheduledTime',
          'intakes.intakes.takenAt',
          'tasks.tasks.createdAt',
          'tasks.tasks.dueDate',
          'device.devices.lastSeen',
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
