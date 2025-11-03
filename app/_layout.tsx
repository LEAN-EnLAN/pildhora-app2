import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Pildhora' }} />
          <Stack.Screen name="patient/home" options={{ title: 'Patient Home' }} />
          <Stack.Screen name="caregiver/dashboard" options={{ title: 'Caregiver Dashboard' }} />
        </Stack>
      </PersistGate>
    </Provider>
  );
}