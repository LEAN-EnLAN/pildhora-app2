# Patient Home Screen - Hook Error Fix

## Issue

The patient home screen was throwing a React hooks error:
```
ERROR [Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.]
```

## Root Cause

The issue was caused by improper initialization of an Animated.Value:

```typescript
// ❌ WRONG - Creates new instance on every render
const scrollY = new Animated.Value(0);
```

This violated React's rules because:
1. It wasn't wrapped in a hook
2. It would create a new instance on every render
3. It could cause inconsistent hook ordering

## Solution

Wrapped the Animated.Value in `useRef` to ensure it's only created once:

```typescript
// ✅ CORRECT - Creates once and persists
const scrollY = React.useRef(new Animated.Value(0)).current;
```

## Why This Works

- `useRef` creates a mutable ref object that persists for the lifetime of the component
- The `.current` property holds the Animated.Value
- This ensures the same Animated.Value instance is used across all renders
- Follows React's rules of hooks

## Alternative Solutions

Other valid approaches would have been:

### Option 1: useMemo
```typescript
const scrollY = useMemo(() => new Animated.Value(0), []);
```

### Option 2: useState (less common for Animated.Value)
```typescript
const [scrollY] = useState(() => new Animated.Value(0));
```

## Best Practice

For Animated.Value instances in React Native:
- Always use `useRef` for animated values that don't trigger re-renders
- Use `useState` only if the animated value needs to trigger component updates
- Never create Animated.Value directly in the component body

## Testing

After the fix:
- ✅ No hook errors
- ✅ Component renders correctly
- ✅ Scroll animations work as expected
- ✅ All functionality preserved

## Related Files

- `app/patient/home.tsx` - Fixed file
- Other screens using Animated.Value should follow the same pattern

## Prevention

To prevent similar issues:
1. Always wrap stateful values in appropriate hooks
2. Use ESLint rule `react-hooks/rules-of-hooks`
3. Review any direct object instantiation in component body
4. Test components thoroughly after refactoring

