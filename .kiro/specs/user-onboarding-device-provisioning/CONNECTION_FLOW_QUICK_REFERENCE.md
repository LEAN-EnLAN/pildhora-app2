# Connection Flow Quick Reference

## Overview

Quick reference guide for the caregiver device connection flow implementation.

## Files

### Main Implementation
- `app/caregiver/device-connection.tsx` - Code entry screen
- `app/caregiver/device-connection-confirm.tsx` - Confirmation & success screen

### Services Used
- `src/services/connectionCode.ts` - Code validation and usage
- `src/services/deviceLinking.ts` - Device link creation
- `src/services/onboarding.ts` - Onboarding completion

## User Flow

```
1. Enter Code → 2. Validate → 3. Confirm → 4. Connect → 5. Success → 6. Dashboard
```

## Key Functions

### Code Entry Screen

```typescript
// Validate code format (6-8 alphanumeric)
const validateCodeFormat = (value: string): boolean => {
  if (!value) return true;
  const upperValue = value.toUpperCase();
  if (upperValue.length < 6 || upperValue.length > 8) return false;
  if (!/^[A-Z0-9]+$/.test(upperValue)) return false;
  return true;
};

// Handle code validation and navigation
const handleValidateCode = async () => {
  const codeData = await validateCode(code);
  router.push({
    pathname: '/caregiver/device-connection-confirm',
    params: { code, patientId, patientName, deviceId }
  });
};
```

### Confirmation Screen

```typescript
// Handle connection establishment
const handleConnect = async () => {
  // 1. Use connection code (creates deviceLink)
  await useCode(params.code, user.id);
  
  // 2. Complete caregiver onboarding
  await completeOnboarding(user.id);
  
  // 3. Show success state
  setConnectionSuccess(true);
};

// Navigate to dashboard
const handleNavigateToDashboard = () => {
  router.replace('/caregiver/dashboard');
};
```

## Error Handling

### Common Errors

| Error Code | User Message | Retryable |
|------------|--------------|-----------|
| `CODE_NOT_FOUND` | Código no encontrado | No |
| `CODE_EXPIRED` | Este código ha expirado | No |
| `CODE_ALREADY_USED` | Este código ya ha sido utilizado | No |
| `INVALID_CODE_FORMAT` | El código solo puede contener letras y números | No |
| `SERVICE_UNAVAILABLE` | El servicio no está disponible | Yes |
| `TIMEOUT` | La operación tardó demasiado tiempo | Yes |

### Error Display

```typescript
{connectionError && (
  <Card style={styles.errorCard}>
    <View style={styles.errorHeader}>
      <Ionicons name="alert-circle" size={24} color={colors.error[500]} />
      <Text style={styles.errorTitle}>Error de Conexión</Text>
    </View>
    <Text style={styles.errorMessage}>{connectionError}</Text>
  </Card>
)}
```

## State Management

### Code Entry State

```typescript
const [code, setCode] = useState('');
const [isValidating, setIsValidating] = useState(false);
const [validationError, setValidationError] = useState<string | null>(null);
const [formatError, setFormatError] = useState<string | null>(null);
```

### Confirmation State

```typescript
const [isConnecting, setIsConnecting] = useState(false);
const [connectionError, setConnectionError] = useState<string | null>(null);
const [connectionSuccess, setConnectionSuccess] = useState(false);
```

## Navigation

### Route Parameters

```typescript
// From code entry to confirmation
router.push({
  pathname: '/caregiver/device-connection-confirm',
  params: {
    code: string,
    patientId: string,
    patientName: string,
    deviceId: string
  }
});

// From success to dashboard
router.replace('/caregiver/dashboard');
```

## Validation Rules

### Code Format
- Length: 6-8 characters
- Characters: A-Z, 0-9 (uppercase only)
- No spaces or special characters
- Real-time validation on input

### Code Validation
- Must exist in Firestore
- Must not be expired
- Must not be already used
- Must belong to a valid patient

## UI Components

### Input Field

```typescript
<Input
  label="Código"
  placeholder="Ej: ABC123"
  value={code}
  onChangeText={handleCodeChange}
  error={formatError || validationError}
  autoCapitalize="characters"
  maxLength={8}
  leftIcon={<Ionicons name="key-outline" />}
  rightIcon={isValid ? <Ionicons name="checkmark-circle" /> : null}
/>
```

### Action Buttons

```typescript
// Cancel button
<Button
  variant="outline"
  onPress={handleCancel}
  disabled={isConnecting}
>
  Cancelar
</Button>

// Connect button
<Button
  variant="primary"
  onPress={handleConnect}
  disabled={isConnecting}
  loading={isConnecting}
>
  {isConnecting ? 'Conectando...' : 'Conectar'}
</Button>
```

## Accessibility

### Labels

```typescript
accessibilityLabel="Código de conexión"
accessibilityHint="Ingresa el código de 6 a 8 caracteres proporcionado por el paciente"
```

### Screen Reader Support
- All interactive elements have labels
- All buttons have hints
- Icons marked with `accessible={false}`
- Proper heading hierarchy

## Testing Checklist

### Manual Tests
- [ ] Enter valid code → navigates to confirmation
- [ ] Enter invalid code → shows error
- [ ] Enter expired code → shows expiration message
- [ ] Enter used code → shows used message
- [ ] Cancel connection → returns to previous screen
- [ ] Confirm connection → creates link and shows success
- [ ] Navigate to dashboard → routes correctly

### Integration Tests
- [ ] deviceLink document created
- [ ] RTDB mapping updated
- [ ] Connection code marked as used
- [ ] Onboarding marked as complete

## Common Issues

### Issue: Code validation fails
**Solution:** Check network connection, verify code format

### Issue: Connection fails
**Solution:** Check authentication, verify user permissions

### Issue: Navigation doesn't work
**Solution:** Verify route parameters, check router configuration

### Issue: Success screen doesn't show
**Solution:** Check `connectionSuccess` state, verify conditional rendering

## Performance Tips

1. **Debounce validation** - Don't validate on every keystroke
2. **Cache code data** - Store validated code data in state
3. **Optimize re-renders** - Use `useCallback` for handlers
4. **Lazy load success** - Conditionally render success screen

## Security Notes

1. **Code validation** - Always validate server-side
2. **User verification** - Check authenticated user matches
3. **Code usage** - Mark as used immediately
4. **Audit logging** - Track all connection attempts

## Related Documentation

- [Task 9 Completion Summary](./TASK9_COMPLETION_SUMMARY.md)
- [Connection Flow Visual Guide](./CONNECTION_FLOW_VISUAL_GUIDE.md)
- [Requirements Document](./requirements.md)
- [Design Document](./design.md)

## Support

For issues or questions:
1. Check error messages in console
2. Verify Firebase configuration
3. Review security rules
4. Check network connectivity
5. Consult design document

## Version History

- **v1.0.0** - Initial implementation (Task 9)
  - Code entry screen
  - Confirmation screen
  - Success screen
  - Error handling
  - Navigation flow
