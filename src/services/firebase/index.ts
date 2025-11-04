import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Carga y validación de variables de entorno (Expo SDK 49+ / 54)
// Nota: Las variables deben comenzar con "EXPO_PUBLIC_" para estar disponibles en tiempo de ejecución.
const raw = process.env.EXPO_PUBLIC_FIREBASE_CONFIG;
if (!raw) {
  throw new Error(
    '[Firebase] Falta EXPO_PUBLIC_FIREBASE_CONFIG. ' +
    'Copia el bloque completo desde Firebase Console → Configuración del proyecto → SDK snippet y pégalo en .env'
  );
}

let firebaseConfig;
try {
  firebaseConfig = JSON.parse(raw);
} catch (e) {
  throw new Error('[Firebase] EXPO_PUBLIC_FIREBASE_CONFIG no es un JSON válido. Asegúrate de copiar el bloque completo.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;