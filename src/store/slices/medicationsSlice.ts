import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Medication, ApiResponse } from '../../types';
import { db } from '../../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

interface MedicationsState {
  medications: Medication[];
  loading: boolean;
  error: string | null;
}

const initialState: MedicationsState = {
  medications: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchMedications = createAsyncThunk(
  'medications/fetchMedications',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, 'medications'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const medications: Medication[] = [];
      querySnapshot.forEach((doc) => {
        medications.push({ id: doc.id, ...doc.data() } as Medication);
      });
      return medications;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMedication = createAsyncThunk(
  'medications/addMedication',
  async (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'medications'), {
        ...medication,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: docRef.id, ...medication, createdAt: new Date(), updatedAt: new Date() };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMedication = createAsyncThunk(
  'medications/updateMedication',
  async ({ id, updates }: { id: string; updates: Partial<Medication> }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(db, 'medications', id), {
        ...updates,
        updatedAt: new Date(),
      });
      return { id, updates };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMedication = createAsyncThunk(
  'medications/deleteMedication',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'medications', id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const medicationsSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    setMedications: (state, action: PayloadAction<Medication[]>) => {
      state.medications = action.payload;
    },
    addMedicationLocal: (state, action: PayloadAction<Medication>) => {
      state.medications.unshift(action.payload);
    },
    updateMedicationLocal: (state, action: PayloadAction<{ id: string; updates: Partial<Medication> }>) => {
      const index = state.medications.findIndex(med => med.id === action.payload.id);
      if (index !== -1) {
        state.medications[index] = { ...state.medications[index], ...action.payload.updates };
      }
    },
    removeMedicationLocal: (state, action: PayloadAction<string>) => {
      state.medications = state.medications.filter(med => med.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedications.fulfilled, (state, action) => {
        state.loading = false;
        state.medications = action.payload;
      })
      .addCase(fetchMedications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.medications.unshift(action.payload);
      })
      .addCase(addMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedication.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        const index = state.medications.findIndex(med => med.id === id);
        if (index !== -1) {
          state.medications[index] = { ...state.medications[index], ...updates };
        }
      })
      .addCase(updateMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.medications = state.medications.filter(med => med.id !== action.payload);
      })
      .addCase(deleteMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setMedications,
  addMedicationLocal,
  updateMedicationLocal,
  removeMedicationLocal,
  clearError
} = medicationsSlice.actions;
export default medicationsSlice.reducer;