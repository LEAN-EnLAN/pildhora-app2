# Internationalization Quick Reference

## Quick Start

### Import and Use

```typescript
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return <Text>{t('wizard.title')}</Text>;
}
```

### With Variables

```typescript
const { t } = useTranslation();

const message = t('wizard.progressLabel', {
  current: 1,
  total: 6,
  step: 'Welcome'
});
// => "Step 1 of 6: Welcome"
```

### Language Switching

```typescript
const { language, setLanguage } = useTranslation();

// Switch to English
setLanguage('en');

// Current language
console.log(language); // => "en"
```

## Common Translation Keys

### Navigation
```typescript
t('common.next')      // "Next" / "Siguiente"
t('common.back')      // "Back" / "Atrás"
t('common.cancel')    // "Cancel" / "Cancelar"
t('common.continue')  // "Continue" / "Continuar"
t('common.complete')  // "Complete" / "Completar"
```

### Actions
```typescript
t('common.save')      // "Save" / "Guardar"
t('common.edit')      // "Edit" / "Editar"
t('common.retry')     // "Retry" / "Reintentar"
```

### States
```typescript
t('common.loading')    // "Loading..." / "Cargando..."
t('common.saving')     // "Saving..." / "Guardando..."
t('common.testing')    // "Testing..." / "Probando..."
t('common.validating') // "Validating..." / "Validando..."
```

## Wizard Keys

### Wizard Title
```typescript
t('wizard.title')  // "Setup Device" / "Configurar Dispositivo"
```

### Step Labels
```typescript
t('wizard.steps.welcome')      // "Welcome" / "Bienvenida"
t('wizard.steps.deviceId')     // "Device ID" / "ID del Dispositivo"
t('wizard.steps.verification') // "Verification" / "Verificación"
t('wizard.steps.wifi')         // "WiFi" / "WiFi"
t('wizard.steps.preferences')  // "Preferences" / "Preferencias"
t('wizard.steps.completion')   // "Completed" / "Completado"
```

### Progress Label
```typescript
t('wizard.progressLabel', { current: 1, total: 6, step: 'Welcome' })
// => "Step 1 of 6: Welcome" / "Paso 1 de 6: Bienvenida"
```

## Step-Specific Keys

### Welcome Step
```typescript
t('welcomeStep.title')     // "Welcome!" / "¡Bienvenido!"
t('welcomeStep.subtitle')  // "Let's set up..." / "Configuremos..."
t('welcomeStep.whatWeDo')  // "What will we do?" / "¿Qué haremos?"
```

### Device ID Step
```typescript
t('deviceIdStep.title')              // "Device ID" / "ID del Dispositivo"
t('deviceIdStep.label')              // "Device ID" / "ID del Dispositivo"
t('deviceIdStep.placeholder')        // "Ex: DEVICE-12345" / "Ej: DEVICE-12345"
t('deviceIdStep.validation.required') // "Device ID is required" / "El ID del dispositivo es requerido"
```

### WiFi Config Step
```typescript
t('wifiConfigStep.title')          // "WiFi Configuration" / "Configuración WiFi"
t('wifiConfigStep.ssidLabel')      // "WiFi Network Name (SSID)" / "Nombre de la red WiFi (SSID)"
t('wifiConfigStep.passwordLabel')  // "WiFi Password" / "Contraseña WiFi"
t('wifiConfigStep.buttons.save')   // "Save Configuration" / "Guardar Configuración"
```

### Preferences Step
```typescript
t('preferencesStep.title')                    // "Device Preferences" / "Preferencias del Dispositivo"
t('preferencesStep.alarmMode.title')          // "Alarm Mode" / "Modo de Alarma"
t('preferencesStep.alarmMode.options.sound')  // "Sound" / "Sonido"
t('preferencesStep.alarmMode.options.both')   // "Both" / "Ambos"
t('preferencesStep.ledIntensity.title')       // "LED Intensity" / "Intensidad del LED"
```

### Completion Step
```typescript
t('completionStep.title')                // "Setup Complete!" / "¡Configuración Completada!"
t('completionStep.summary.title')        // "Configuration Summary" / "Resumen de Configuración"
t('completionStep.nextSteps.title')      // "Next Steps" / "Próximos Pasos"
t('completionStep.button')               // "Go to Home" / "Ir al Inicio"
```

## Error Messages

### Device Errors
```typescript
t('deviceErrors.DEVICE_NOT_FOUND.title')    // "Device Not Found" / "Dispositivo No Encontrado"
t('deviceErrors.DEVICE_NOT_FOUND.message')  // Error message
t('deviceErrors.DEVICE_NOT_FOUND.action')   // Suggested action
t('deviceErrors.DEVICE_NOT_FOUND.steps')    // Array of troubleshooting steps
```

### Connection Errors
```typescript
t('connectionErrors.CODE_EXPIRED.title')    // "Code Expired" / "Código Expirado"
t('connectionErrors.CODE_EXPIRED.message')  // Error message
t('connectionErrors.CODE_EXPIRED.action')   // Suggested action
```

### Error Codes
```typescript
// Device provisioning errors
DEVICE_NOT_FOUND
DEVICE_ALREADY_CLAIMED
INVALID_DEVICE_ID
WIFI_CONFIG_FAILED
DEVICE_OFFLINE
PERMISSION_DENIED

// Connection code errors
CODE_NOT_FOUND
CODE_EXPIRED
CODE_ALREADY_USED
INVALID_CODE_FORMAT
DEVICE_NOT_FOUND
```

## Hooks

### useTranslation (Full)
```typescript
const {
  t,                    // Translation function
  tArray,               // Array translation
  language,             // Current language
  setLanguage,          // Change language
  availableLanguages,   // ['es', 'en']
  getLanguageName,      // Get display name
  hasKey,               // Check if key exists
} = useTranslation();
```

### useT (Lightweight)
```typescript
const t = useT();
const title = t('wizard.title');
```

### useLanguage (Language Only)
```typescript
const {
  language,
  setLanguage,
  availableLanguages,
  getLanguageName,
} = useLanguage();
```

## Template Interpolation

### Single Variable
```typescript
t('preferencesStep.ledIntensity.value', { intensity: 75 })
// => "75%"
```

### Multiple Variables
```typescript
t('wizard.progressLabel', {
  current: 1,
  total: 6,
  step: 'Welcome'
})
// => "Step 1 of 6: Welcome"
```

### In Arrays
```typescript
const steps = [
  t('welcomeStep.steps.deviceId.title'),
  t('welcomeStep.steps.verification.title'),
  t('welcomeStep.steps.wifi.title'),
];
```

## Language Codes

- `es` - Spanish (Español) - Default
- `en` - English

## Best Practices

### 1. Always Use Translation Keys
```typescript
// ❌ Bad
<Text>Siguiente</Text>

// ✅ Good
<Text>{t('common.next')}</Text>
```

### 2. Use Variables for Dynamic Content
```typescript
// ❌ Bad
<Text>{`Paso ${step} de ${total}`}</Text>

// ✅ Good
<Text>{t('wizard.progressLabel', { current: step, total })}</Text>
```

### 3. Destructure Only What You Need
```typescript
// ❌ Bad (if you only need t)
const { t, language, setLanguage, availableLanguages } = useTranslation();

// ✅ Good
const { t } = useTranslation();
```

### 4. Use Lightweight Hook When Possible
```typescript
// ❌ Bad (if you don't need language switching)
const { t } = useTranslation();

// ✅ Good
const t = useT();
```

### 5. Check Key Existence for Dynamic Keys
```typescript
const { t, hasKey } = useTranslation();

const errorKey = `deviceErrors.${errorCode}.title`;
if (hasKey(errorKey)) {
  return t(errorKey);
}
return t('deviceErrors.UNKNOWN.title');
```

## Common Patterns

### Button Labels
```typescript
<Button onPress={handleNext}>
  {t('common.next')}
</Button>
```

### Form Labels
```typescript
<Input
  label={t('deviceIdStep.label')}
  placeholder={t('deviceIdStep.placeholder')}
/>
```

### Error Display
```typescript
{error && (
  <Text>{t(`deviceErrors.${errorCode}.message`)}</Text>
)}
```

### Conditional Text
```typescript
<Text>
  {isLoading ? t('common.loading') : t('common.save')}
</Text>
```

### Accessibility Labels
```typescript
<Button
  accessibilityLabel={t('wizard.navigation.nextStep', { step: nextStepLabel })}
>
  {t('common.next')}
</Button>
```

## File Locations

- **Translations**: `src/i18n/translations/`
  - `es.ts` - Spanish
  - `en.ts` - English
- **Service**: `src/i18n/index.ts`
- **Hooks**: `src/hooks/useTranslation.ts`
- **Tests**: `test-internationalization.js`

## Adding New Translations

1. Add key to both `es.ts` and `en.ts`
2. Use nested structure for organization
3. Use template variables for dynamic content
4. Test with `node test-internationalization.js`

Example:
```typescript
// es.ts
export const es = {
  myFeature: {
    title: 'Mi Título',
    message: 'Hola {{name}}',
  },
};

// en.ts
export const en = {
  myFeature: {
    title: 'My Title',
    message: 'Hello {{name}}',
  },
};

// Usage
t('myFeature.title')
t('myFeature.message', { name: 'John' })
```

## Troubleshooting

### Key Not Found
```typescript
// Check if key exists
if (!hasKey('myKey')) {
  console.warn('Translation key not found');
}
```

### Missing Variable
```typescript
// Variables are optional - missing ones show as {{varName}}
t('wizard.progressLabel', { current: 1 })
// => "Step 1 of {{total}}: {{step}}"
```

### Wrong Language
```typescript
// Check current language
console.log(getCurrentLanguage());

// Force language for specific translation
t('wizard.title', undefined, 'en')
```

## Performance Tips

1. Use `useT()` for components that don't need language switching
2. Memoize translation calls in expensive renders
3. Avoid translating in loops - translate once and reuse
4. Use `tArray()` for translating multiple keys at once

## Support

For issues or questions:
- Check documentation: `TASK19_I18N_IMPLEMENTATION.md`
- Run tests: `node test-internationalization.js`
- Review translation files: `src/i18n/translations/`
