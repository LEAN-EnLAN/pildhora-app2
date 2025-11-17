# Onboarding Service Flow Diagram

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OnboardingService                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │  needsOnboarding   │  │  getOnboardingStep │            │
│  │                    │  │                    │            │
│  │  Check if user     │  │  Get current step  │            │
│  │  needs setup       │  │  or null           │            │
│  └────────────────────┘  └────────────────────┘            │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────┐            │
│  │ updateOnboarding   │  │ completeOnboarding │            │
│  │ Step               │  │                    │            │
│  │                    │  │  Mark as complete  │            │
│  │  Track progress    │  │  and redirect      │            │
│  └────────────────────┘  └────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Firestore                        │
├─────────────────────────────────────────────────────────────┤
│  users/{userId}                                              │
│  ├─ onboardingComplete: boolean                             │
│  ├─ onboardingStep: string                                  │
│  ├─ deviceId: string (patients)                             │
│  └─ patients: string[] (caregivers)                         │
└─────────────────────────────────────────────────────────────┘
```

## Method Flow: needsOnboarding()

```
┌─────────────────┐
│  needsOnboarding│
│  (userId, role) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate userId │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Firestore   │
│ instance        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch user doc  │
│ with retry      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check if        │
│ onboarding      │
│ Complete?       │
└────┬────────┬───┘
     │        │
    Yes       No
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│ Return  │ │ Check role   │
│ false   │ │              │
└─────────┘ └──────┬───────┘
                   │
         ┌─────────┴─────────┐
         │                   │
      Patient            Caregiver
         │                   │
         ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ Has deviceId?   │ │ Has patients?   │
└────┬────────┬───┘ └────┬────────┬───┘
     │        │          │        │
    Yes       No        Yes       No
     │        │          │        │
     ▼        ▼          ▼        ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Return  │ │ Return  │ │ Return  │ │ Return  │
│ false   │ │ true    │ │ false   │ │ true    │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## Method Flow: getOnboardingStep()

```
┌─────────────────┐
│getOnboardingStep│
│    (userId)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate userId │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Firestore   │
│ instance        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch user doc  │
│ with retry      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check if        │
│ onboarding      │
│ Complete?       │
└────┬────────┬───┘
     │        │
    Yes       No
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│ Return  │ │ Return       │
│ null    │ │ onboarding   │
│         │ │ Step value   │
└─────────┘ └──────────────┘
```

## Method Flow: updateOnboardingStep()

```
┌─────────────────┐
│updateOnboarding │
│Step(userId,step)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate userId │
│ & step          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate auth   │
│ (current user)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check userId    │
│ matches current │
│ user?           │
└────┬────────┬───┘
     │        │
    Yes       No
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│Continue │ │ Throw        │
│         │ │ USER_ID_     │
│         │ │ MISMATCH     │
└────┬────┘ └──────────────┘
     │
     ▼
┌─────────────────┐
│ Get Firestore   │
│ instance        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update user doc │
│ with retry:     │
│ - onboardingStep│
│ - updatedAt     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success         │
└─────────────────┘
```

## Method Flow: completeOnboarding()

```
┌─────────────────┐
│completeOnboarding│
│    (userId)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate userId │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate auth   │
│ (current user)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check userId    │
│ matches current │
│ user?           │
└────┬────────┬───┘
     │        │
    Yes       No
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│Continue │ │ Throw        │
│         │ │ USER_ID_     │
│         │ │ MISMATCH     │
└────┬────┘ └──────────────┘
     │
     ▼
┌─────────────────┐
│ Get Firestore   │
│ instance        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update user doc │
│ with retry:     │
│ - onboarding    │
│   Complete=true │
│ - onboarding    │
│   Step=complete │
│ - updatedAt     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success         │
└─────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│ Any method call │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Try operation   │
└────┬────────┬───┘
     │        │
  Success   Error
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│ Return  │ │ Is           │
│ result  │ │ OnboardingError?│
└─────────┘ └────┬────────┬┘
                 │        │
                Yes       No
                 │        │
                 ▼        ▼
            ┌─────────┐ ┌──────────────┐
            │ Throw   │ │ Check error  │
            │ as-is   │ │ code         │
            └─────────┘ └──────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Retryable              Non-retryable
                    │                     │
                    ▼                     ▼
            ┌──────────────┐      ┌──────────────┐
            │ Retry with   │      │ Convert to   │
            │ exponential  │      │ Onboarding   │
            │ backoff      │      │ Error        │
            │ (max 3)      │      │              │
            └──────┬───────┘      └──────┬───────┘
                   │                     │
                   └──────────┬──────────┘
                              │
                              ▼
                    ┌──────────────┐
                    │ Throw error  │
                    │ with user    │
                    │ message      │
                    └──────────────┘
```

## Integration with Authentication Flow

```
┌─────────────────┐
│ User signs up   │
│ or logs in      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ authSlice       │
│ creates/loads   │
│ user with       │
│ onboarding      │
│ fields          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Call            │
│ needsOnboarding │
│ (userId, role)  │
└────┬────────┬───┘
     │        │
   true      false
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│ Route to│ │ Route to     │
│ wizard  │ │ home/        │
│         │ │ dashboard    │
└─────────┘ └──────────────┘
```

## Wizard Integration Pattern

```
┌─────────────────┐
│ Wizard starts   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Call            │
│ getOnboarding   │
│ Step()          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Resume from     │
│ last step or    │
│ start fresh     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User completes  │
│ a step          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Call            │
│ updateOnboarding│
│ Step(step)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Continue to     │
│ next step       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ All steps done? │
└────┬────────┬───┘
     │        │
    Yes       No
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│ Call    │ │ Loop back    │
│ complete│ │ to next step │
│ Onboard │ │              │
│ ing()   │ │              │
└────┬────┘ └──────────────┘
     │
     ▼
┌─────────────────┐
│ Route to home/  │
│ dashboard       │
└─────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         User Document                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Initial State (after signup):                              │
│  {                                                           │
│    onboardingComplete: false,                               │
│    onboardingStep: 'device_provisioning' | 'device_connection'│
│    deviceId: undefined (patients)                           │
│    patients: [] (caregivers)                                │
│  }                                                           │
│                                                              │
│  During Onboarding:                                         │
│  {                                                           │
│    onboardingComplete: false,                               │
│    onboardingStep: 'device_provisioning' | 'device_connection'│
│    deviceId: undefined → 'device-123' (patients)            │
│    patients: [] → ['patient-1'] (caregivers)                │
│  }                                                           │
│                                                              │
│  After Completion:                                          │
│  {                                                           │
│    onboardingComplete: true,                                │
│    onboardingStep: 'complete',                              │
│    deviceId: 'device-123' (patients)                        │
│    patients: ['patient-1', 'patient-2'] (caregivers)        │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## State Transitions

```
Patient Flow:
┌─────────────────┐
│ onboarding      │
│ Complete: false │
│ deviceId: null  │
└────────┬────────┘
         │
         │ needsOnboarding() → true
         │
         ▼
┌─────────────────┐
│ Device          │
│ Provisioning    │
│ Wizard          │
└────────┬────────┘
         │
         │ Device linked
         │
         ▼
┌─────────────────┐
│ onboarding      │
│ Complete: false │
│ deviceId: 'xxx' │
└────────┬────────┘
         │
         │ completeOnboarding()
         │
         ▼
┌─────────────────┐
│ onboarding      │
│ Complete: true  │
│ deviceId: 'xxx' │
└─────────────────┘

Caregiver Flow:
┌─────────────────┐
│ onboarding      │
│ Complete: false │
│ patients: []    │
└────────┬────────┘
         │
         │ needsOnboarding() → true
         │
         ▼
┌─────────────────┐
│ Device          │
│ Connection      │
│ Interface       │
└────────┬────────┘
         │
         │ Patient linked
         │
         ▼
┌─────────────────┐
│ onboarding      │
│ Complete: false │
│ patients: ['x'] │
└────────┬────────┘
         │
         │ completeOnboarding()
         │
         ▼
┌─────────────────┐
│ onboarding      │
│ Complete: true  │
│ patients: ['x'] │
└─────────────────┘
```
