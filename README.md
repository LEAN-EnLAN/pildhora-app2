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
│   ├── ui/             # Core design system components
│   ├── screens/        # Screen-specific components
│   └── shared/         # Shared composite components
├── theme/              # Design tokens and styling
├── services/           # API and hardware services
├── store/              # Redux state management
├── utils/              # Utilities and constants
├── types/              # TypeScript definitions
└── hooks/              # Custom React hooks

app/                    # Expo Router screens
├── caregiver/          # Caregiver-specific screens
├── patient/            # Patient-specific screens
├── auth/               # Authentication screens
└── device/             # Device management screens

docs/                   # Documentation
├── DESIGN_SYSTEM.md    # Design system guide
├── COMPONENT_DOCUMENTATION.md  # Component API docs
├── MIGRATION_GUIDE.md  # Migration instructions
└── ...                 # Additional documentation
```

## Design System

The application uses a comprehensive design system with reusable components and design tokens for consistent styling across all screens.

### Core Components

- **Button**: Versatile button with variants (primary, secondary, danger, ghost, outline)
- **Card**: Container component with elevation and variants
- **Input**: Unified text input with validation and error handling
- **Modal**: Dialog component with animations and configurable sizes
- **Chip**: Compact component for tags and selections
- **ColorPicker**: Intuitive color picker with presets
- **LoadingSpinner**: Loading indicator with size variants
- **ErrorMessage**: Error display with retry options
- **SuccessMessage**: Success feedback with auto-dismiss

### Design Tokens

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/theme/tokens';

// Use tokens for consistent styling
<View style={{
  padding: spacing.lg,
  backgroundColor: colors.surface,
  borderRadius: borderRadius.md,
  ...shadows.md,
}}>
```

### Documentation

**Quick Start**: See [UI Refactor Documentation Index](./docs/UI_REFACTOR_INDEX.md) for complete documentation overview.

**Key Documents**:
- [Design System Guide](./docs/DESIGN_SYSTEM.md) - Complete design system documentation
- [Component Documentation](./docs/COMPONENT_DOCUMENTATION.md) - Detailed component API reference
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Guide for migrating to new components
- [Storybook Guide](./docs/STORYBOOK_GUIDE.md) - Component development and testing
- [Accessibility Compliance](./docs/ACCESSIBILITY_COMPLIANCE.md) - Accessibility guidelines
- [Performance Optimizations](./docs/PERFORMANCE_OPTIMIZATIONS.md) - Performance best practices

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