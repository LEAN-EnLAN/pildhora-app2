# Pildhora Pillbox App

A comprehensive smart pillbox management system with separate interfaces for elderly patients and healthcare caregivers.

## Features

### Patient App
- Simple medication reminders
- One-tap intake confirmation
- Pillbox connectivity status
- Accessible UI for elderly users

### Caregiver App
- Full medication management (CRUD)
- Real-time patient monitoring
- AI-powered adherence reports
- Task scheduling and tracking
- Multi-patient dashboard

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Redux Toolkit + Redux Persist
- **Backend**: Google Firebase (Auth, Firestore, Functions)
- **AI**: Google Vertex AI (Gemini)
- **Hardware**: BLE connectivity with ESP8266
- **UI**: React Native Elements + React Native Paper

## Getting Started

1. **Prerequisites**
   - Node.js 18+
   - Expo CLI
   - Android Studio (for Android) or Xcode (for iOS)

2. **Installation**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copia `.env.example` a `.env`
   - Rellena las variables de Firebase con los valores de tu proyecto:
     ```env
     EXPO_PUBLIC_FIREBASE_API_KEY=...
     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
     EXPO_PUBLIC_FIREBASE_APP_ID=...
     ```
   - Importante: las variables deben empezar con `EXPO_PUBLIC_` para que Expo las exponga en tiempo de ejecución (no usar secretos aquí).
   - Opciones para cargar el `.env`:
     - Simple: exporta las variables en tu terminal antes de iniciar Expo (PowerShell):
       ```powershell
       $env:EXPO_PUBLIC_FIREBASE_API_KEY="..."
       $env:EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
       $env:EXPO_PUBLIC_FIREBASE_PROJECT_ID="..."
       $env:EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
       $env:EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
       $env:EXPO_PUBLIC_FIREBASE_APP_ID="..."
       npm start
       ```
     - Conveniente: instala `dotenv-cli` y usa el archivo `.env` automáticamente (Windows/macOS/Linux):
       ```bash
       npm install --save-dev dotenv-cli
       ```
       Luego actualiza tus scripts a:
       ```json
       {
         "scripts": {
           "start": "dotenv -e .env -- expo start",
           "android": "dotenv -e .env -- expo start --android",
           "ios": "dotenv -e .env -- expo start --ios",
           "web": "dotenv -e .env -- expo start --web"
         }
       }
       ```
   - Añade también tus claves de Google AI si las usas.

4. **Development**
   ```bash
   npm start
   ```

5. **Building**
   ```bash
   npm run android  # or npm run ios
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API and hardware services
├── store/             # Redux state management
├── utils/             # Utilities and constants
├── types/             # TypeScript definitions
└── hooks/             # Custom React hooks
```

## Development Guidelines

- Use TypeScript for all new code
- Follow functional component patterns
- Implement proper error handling
- Write unit tests for business logic
- Use JSDoc for component documentation
- Maintain accessibility standards

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## License

MIT License