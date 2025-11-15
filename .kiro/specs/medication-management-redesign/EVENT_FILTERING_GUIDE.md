# Event Filtering and Search - User Guide

## Overview

The medication event registry now includes comprehensive filtering and search capabilities to help caregivers quickly find specific events.

## Features

### 1. Search by Medication Name

**Location**: Top of the event list

**How to Use**:
1. Tap the search bar
2. Type the medication name
3. Events are filtered in real-time as you type
4. Tap the X button to clear the search

**Example**: Type "aspirin" to see all events related to Aspirin

### 2. Filter by Patient

**Location**: First filter chip below search bar

**How to Use**:
1. Tap the "Todos los pacientes" chip
2. Select a patient from the modal
3. Only events from that patient will be shown
4. Tap again to change or clear

**Visual Indicator**: Chip turns blue when a patient is selected

### 3. Filter by Event Type

**Location**: Second filter chip

**How to Use**:
1. Tap the "Todos los eventos" chip
2. Choose from:
   - **Creados**: Medication creation events
   - **Actualizados**: Medication update events
   - **Eliminados**: Medication deletion events
3. Only events of that type will be shown

**Visual Indicator**: Chip turns blue when an event type is selected

### 4. Filter by Date Range

**Location**: Third filter chip

**How to Use**:
1. Tap the "Todo el tiempo" chip
2. Choose from preset ranges:
   - **Hoy**: Events from today only
   - **Últimos 7 días**: Events from the past week
   - **Este mes**: Events from the current month
   - **Todo el tiempo**: All events (no filter)

**Visual Indicator**: Chip turns blue when a date range is selected

### 5. Clear All Filters

**Location**: Red "Limpiar" button at the end of filter chips

**How to Use**:
1. Tap the "Limpiar" button
2. All filters are instantly cleared
3. Full event list is restored

**Visibility**: Only appears when at least one filter is active

## Combining Filters

You can use multiple filters together for precise results:

**Example 1**: Find all medications created by John today
- Set patient filter to "John"
- Set event type to "Creados"
- Set date range to "Hoy"

**Example 2**: Search for Aspirin updates this week
- Type "aspirin" in search
- Set event type to "Actualizados"
- Set date range to "Últimos 7 días"

## Filter Persistence

Your filter selections are automatically saved and will be restored when you:
- Close and reopen the app
- Navigate away and return to the events screen
- Restart the app

This makes it easy to maintain your preferred view of events.

## Tips and Best Practices

### For Daily Monitoring

1. Set date range to "Hoy" to see today's events
2. Leave other filters clear to see all patients
3. Use search when looking for specific medications

### For Patient Review

1. Select a specific patient
2. Set date range to "Este mes"
3. Review all their medication changes

### For Troubleshooting

1. Set event type to "Eliminados" to see deleted medications
2. Use date range to narrow down when issues occurred
3. Search for specific medication names

### For Compliance Checking

1. Set event type to "Actualizados"
2. Review what changes patients are making
3. Use patient filter to focus on specific individuals

## Performance Notes

- **Search**: Filters events already loaded (instant results)
- **Filters**: Query Firestore with optimized indexes (fast results)
- **Combinations**: Multiple filters work together efficiently
- **Persistence**: Filters saved locally (no network delay)

## Troubleshooting

### No Events Showing

**Possible Causes**:
1. Filters are too restrictive
2. No events match the criteria
3. Network connection issue

**Solutions**:
1. Tap "Limpiar" to clear all filters
2. Try broader date ranges
3. Check internet connection

### Search Not Working

**Possible Causes**:
1. Medication name spelled incorrectly
2. No events with that medication name

**Solutions**:
1. Check spelling
2. Try partial names (e.g., "asp" instead of "aspirin")
3. Clear search and use filters instead

### Filters Not Persisting

**Possible Causes**:
1. App storage cleared
2. App reinstalled

**Solutions**:
1. Reapply your preferred filters
2. They will be saved automatically

## Accessibility

The filtering system is fully accessible:

- **Screen Readers**: All controls have proper labels
- **Touch Targets**: All buttons meet minimum size requirements
- **Visual Indicators**: Clear visual feedback for active filters
- **Keyboard Navigation**: Full keyboard support (when available)

## Related Documentation

- [Event Registry UI Guide](./EVENT_REGISTRY_UI_GUIDE.md)
- [Task 15 Implementation](./TASK15_IMPLEMENTATION_SUMMARY.md)
- [Task 16 Implementation](./TASK16_IMPLEMENTATION_SUMMARY.md)
