import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'
import { getDbInstance } from '../../services/firebase'
import { doc, setDoc } from 'firebase/firestore'

type PermissionStatus = 'granted' | 'denied' | 'undetermined'

interface PreferencesState {
  language: 'es' | 'en'
  theme: 'light' | 'dark'
  notifications: {
    enabled: boolean
    hierarchy: string[]
  }
  permissions: {
    notifications: PermissionStatus
    location: PermissionStatus
    bluetooth: 'on' | 'off' | 'undetermined'
  }
  saving: boolean
  error: string | null
}

const initialState: PreferencesState = {
  language: 'es',
  theme: 'light',
  notifications: { enabled: true, hierarchy: ['urgent', 'medication', 'general'] },
  permissions: { notifications: 'undetermined', location: 'undetermined', bluetooth: 'undetermined' },
  saving: false,
  error: null,
}

export const savePreferencesToBackend = createAsyncThunk(
  'preferences/savePreferencesToBackend',
  async (uid: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const db = await getDbInstance()
      const data = state.preferences
      await setDoc(doc(db, 'users', uid, 'private', 'preferences'), {
        language: data.language,
        theme: data.theme,
        notifications: data.notifications,
      }, { merge: true })
      return true
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

export const savePermissionsToBackend = createAsyncThunk(
  'preferences/savePermissionsToBackend',
  async (uid: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const db = await getDbInstance()
      const data = state.preferences.permissions
      await setDoc(doc(db, 'users', uid, 'private', 'permissions'), data, { merge: true })
      return true
    } catch (e: any) {
      return rejectWithValue(e.message)
    }
  }
)

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'es' | 'en'>) => {
      state.language = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notifications.enabled = action.payload
    },
    setNotificationHierarchy: (state, action: PayloadAction<string[]>) => {
      state.notifications.hierarchy = action.payload
    },
    setNotificationPermissionStatus: (state, action: PayloadAction<PermissionStatus>) => {
      state.permissions.notifications = action.payload
    },
    setLocationPermissionStatus: (state, action: PayloadAction<PermissionStatus>) => {
      state.permissions.location = action.payload
    },
    setBluetoothStatus: (state, action: PayloadAction<'on' | 'off' | 'undetermined'>) => {
      state.permissions.bluetooth = action.payload
    },
    addModality: (state, action: PayloadAction<string>) => {
      const name = action.payload.trim().toLowerCase()
      if (!name) return
      if (!state.notifications.hierarchy.includes(name)) {
        state.notifications.hierarchy = [...state.notifications.hierarchy, name]
      }
    },
    removeModality: (state, action: PayloadAction<string>) => {
      const name = action.payload.trim().toLowerCase()
      state.notifications.hierarchy = state.notifications.hierarchy.filter(m => m !== name)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(savePreferencesToBackend.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(savePreferencesToBackend.fulfilled, (state) => {
        state.saving = false
      })
      .addCase(savePreferencesToBackend.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
      .addCase(savePermissionsToBackend.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(savePermissionsToBackend.fulfilled, (state) => {
        state.saving = false
      })
      .addCase(savePermissionsToBackend.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload as string
      })
  }
})

export const {
  setLanguage,
  setTheme,
  setNotificationsEnabled,
  setNotificationHierarchy,
  setNotificationPermissionStatus,
  setLocationPermissionStatus,
  setBluetoothStatus,
} = preferencesSlice.actions

export default preferencesSlice.reducer
