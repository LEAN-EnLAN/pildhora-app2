import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';

export default function RootLayout() {
  return (
<<<<<<< HEAD
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="patient/home" />
          <Stack.Screen name="caregiver/dashboard" />
        </Stack>
      </PersistGate>
    </Provider>
=======
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Login' }} />
    </Stack>
>>>>>>> ef8fc0a98d49f3ca238dc513c889b943f62dc482
  );
}