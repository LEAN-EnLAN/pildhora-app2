import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { AppDispatch, RootState } from '../../src/store';
import { logout } from '../../src/store/slices/authSlice';
import { startDeviceListener, stopDeviceListener } from '../../src/store/slices/deviceSlice';
import { useCollectionSWR } from '../../src/hooks/useCollectionSWR';
import {
  getDbInstance,
  waitForFirebaseInitialization,
  isFirebaseReady,
  getInitializationError,
  reinitializeFirebase
} from '../../src/services/firebase';
import DoseRing from '../../src/components/DoseRing';
import { Patient, PatientWithDevice, Task, DoseSegment, IntakeRecord, IntakeStatus } from '../../src/types';

// Static default data for immediate rendering
const STATIC_PATIENTS: Patient[] = [
  {
    id: 'patient-1',
    name: 'John Doe',
    email: 'john@example.com',
    caregiverId: 'caregiver-1',
    createdAt: new Date(),
    adherence: 85,
    lastTaken: '2 hours ago'
  },
  {
    id: 'patient-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    caregiverId: 'caregiver-1',
    createdAt: new Date(),
    adherence: 92,
    lastTaken: '30 minutes ago'
  },
];

const STATIC_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Refill prescription',
    description: 'Contact pharmacy for refill',
    patientId: 'patient-1',
    caregiverId: 'caregiver-1',
    completed: false,
    dueDate: new Date(Date.now() + 86400000), // Tomorrow
    createdAt: new Date()
  },
  {
    id: 'task-2',
    title: 'Schedule doctor visit',
    description: 'Annual checkup appointment',
    patientId: 'patient-2',
    caregiverId: 'caregiver-1',
    completed: true,
    dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
    createdAt: new Date()
  },
];

// Generate mock dose segments for demonstration
const generateMockDoseSegments = (adherence: number): DoseSegment[] => {
  const segments: DoseSegment[] = [];
  const hoursPerDose = 24 / 4; // 4 doses per day

  for (let i = 0; i < 4; i++) {
    const startHour = i * hoursPerDose;
    const endHour = (i + 1) * hoursPerDose;

    // Determine status based on adherence percentage
    let status: DoseSegment['status'] = 'PENDING';
    if (Math.random() * 100 < adherence) {
      status = 'DOSE_TAKEN';
    } else if (Math.random() > 0.5) {
      status = 'DOSE_MISSED';
    }

    segments.push({ startHour, endHour, status });
  }

  return segments;
};



export default function CaregiverDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { state: deviceState, listening } = useSelector((state: RootState) => state.device);
  const [refreshing, setRefreshing] = useState(false);
  const [patientsWithDevices, setPatientsWithDevices] = useState<PatientWithDevice[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithDevice | null>(null);
  const [patientIntakes, setPatientIntakes] = useState<IntakeRecord[]>([]);

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Cuidador');

  // State for queries and initialization
  const [patientsQuery, setPatientsQuery] = useState<any>(null);
  const [tasksQuery, setTasksQuery] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize Firebase and create queries with improved error handling
  useEffect(() => {
    const initializeQueries = async () => {
      try {
        console.log('[CaregiverDashboard] Starting Firebase initialization...');
        setInitializationError(null);
        
        // Wait for Firebase initialization with timeout
        const initPromise = waitForFirebaseInitialization();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase initialization timeout')), 10000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        console.log('[CaregiverDashboard] Firebase initialized successfully');
        
        const db = await getDbInstance();
        if (!db) {
          throw new Error('Database instance not available after initialization');
        }
        
        if (user) {
          console.log('[CaregiverDashboard] Creating queries for user:', user.id);
          
          // Use the user's Firebase UID for queries
          const patientsQ = query(
            collection(db, 'users'),
            where('role', '==', 'patient'),
            where('caregiverId', '==', user.id),
            orderBy('createdAt', 'desc')
          );
          console.log('[CaregiverDashboard] Patients query created');
          setPatientsQuery(patientsQ);
          
          const tasksQ = query(
            collection(db, 'tasks'),
            where('caregiverId', '==', user.id),
            orderBy('dueDate', 'asc')
          );
          console.log('[CaregiverDashboard] Tasks query created');
          setTasksQuery(tasksQ);
        } else {
          console.warn('[CaregiverDashboard] No user available for query creation');
        }
        
        setIsInitialized(true);
      } catch (error: any) {
        console.error('[CaregiverDashboard] Error initializing queries:', error);
        setInitializationError(error);
        setIsInitialized(true); // Set to true even on error to avoid infinite loading
      }
    };

    initializeQueries();
  }, [user, retryCount]);

  // Function to retry initialization
  const handleRetryInitialization = async () => {
    console.log('[CaregiverDashboard] Retrying Firebase initialization...');
    setRetryCount(prev => prev + 1);
    setIsInitialized(false);
    setInitializationError(null);
    
    try {
      await reinitializeFirebase();
    } catch (error) {
      console.error('[CaregiverDashboard] Error during reinitialization:', error);
    }
  };

  const {
    data: patients = [],
    source: patientsSource,
    isLoading: patientsLoading,
    error: patientsError
  } = useCollectionSWR<Patient>({
    cacheKey: `patients:${user?.id}`,
    query: isInitialized && !initializationError ? patientsQuery : null,
    initialData: STATIC_PATIENTS,
  });

  // Log patients query results
  useEffect(() => {
    console.log('[CaregiverDashboard] Patients query state:', {
      isLoading: patientsLoading,
      error: patientsError,
      dataCount: patients.length,
      source: patientsSource,
      isInitialized,
      hasInitializationError: !!initializationError
    });
    if (patientsError) {
      console.error('[CaregiverDashboard] Patients query error details:', patientsError);
    }
  }, [patientsLoading, patientsError, patients.length, patientsSource, isInitialized, initializationError]);

  const {
    data: tasks = [],
    source: tasksSource,
    isLoading: tasksLoading,
    error: tasksError
  } = useCollectionSWR<Task>({
    cacheKey: `tasks:${user?.id}`,
    query: isInitialized && !initializationError ? tasksQuery : null,
    initialData: STATIC_TASKS,
  });

  // Log tasks query results
  useEffect(() => {
    console.log('[CaregiverDashboard] Tasks query state:', {
      isLoading: tasksLoading,
      error: tasksError,
      dataCount: tasks.length,
      source: tasksSource,
      isInitialized,
      hasInitializationError: !!initializationError
    });
    if (tasksError) {
      console.error('[CaregiverDashboard] Tasks query error details:', tasksError);
    }
  }, [tasksLoading, tasksError, tasks.length, tasksSource, isInitialized, initializationError]);

  // Fetch patient intakes when a patient is selected
  useEffect(() => {
    if (selectedPatient && isInitialized) {
      const fetchPatientIntakes = async () => {
        try {
          const db = await getDbInstance();
          const intakesQuery = query(
            collection(db, 'intakeRecords'),
            where('patientId', '==', selectedPatient.id),
            orderBy('scheduledTime', 'desc'),
            orderBy('scheduledTime', 'desc')
          );
          
          // For now, use mock data for intakes
          const mockIntakes: IntakeRecord[] = [
            {
              id: 'intake-1',
              medicationName: 'Aspirin',
              dosage: '100mg',
              scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              status: IntakeStatus.TAKEN,
              patientId: selectedPatient.id,
              takenAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
              id: 'intake-2', 
              medicationName: 'Vitamin D',
              dosage: '1000IU',
              scheduledTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
              status: IntakeStatus.TAKEN,
              patientId: selectedPatient.id,
              takenAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            }
          ];
          setPatientIntakes(mockIntakes);
        } catch (error) {
          console.error('Error fetching patient intakes:', error);
        }
      };

      fetchPatientIntakes();
    }
  }, [selectedPatient, isInitialized]);

  // Combine patients with device states and dose segments
  useEffect(() => {
    const enhancedPatients = patients.map((patient: Patient) => {
      // Generate mock dose segments based on adherence
      const doseSegments = generateMockDoseSegments(patient.adherence || 0);

      return {
        ...patient,
        deviceState: patient.deviceId ? deviceState : undefined,
        doseSegments,
      } as PatientWithDevice;
    });

    setPatientsWithDevices(enhancedPatients);
    
    // Auto-select first patient if none selected
    if (enhancedPatients.length > 0 && !selectedPatient) {
      setSelectedPatient(enhancedPatients[0]);
    }
  }, [patients, deviceState]);

  // Start device listener for the first patient with a device
  useEffect(() => {
    const firstPatientWithDevice = patients.find(p => p.deviceId);
    if (firstPatientWithDevice?.deviceId && !listening) {
      dispatch(startDeviceListener(firstPatientWithDevice.deviceId));
    }

    return () => {
      if (listening) {
        dispatch(stopDeviceListener());
      }
    };
  }, [patients, dispatch, listening]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // If there's an initialization error, retry initialization
    if (initializationError) {
      await handleRetryInitialization();
    }
    
    // The SWR hook will automatically refresh on remount or query change
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleEmergency = () => {
    setModalVisible(true);
  };

  const callEmergency = (number: string) => {
    try {
      Linking.openURL(`tel:${number}`);
    } catch (e) {
      // noop; on web this may not work
    }
    setModalVisible(false);
  };

  const handlePatientSelect = (patient: PatientWithDevice) => {
    setSelectedPatient(patient);
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("default", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("default", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };



  // Show initialization error with retry option
  if (initializationError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
          <View>
            <Text className="text-2xl font-extrabold text-gray-900">PILDHORA</Text>
            <Text className="text-sm text-gray-500">Hola, {displayName}</Text>
          </View>
          <TouchableOpacity className="px-3 py-2 rounded-lg bg-gray-400 items-center justify-center" onPress={async () => {
            await dispatch(logout());
            router.replace('/');
          }}>
            <Text className="text-white font-bold text-center">Salir</Text>
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <View className="bg-red-100 border border-red-200 rounded-2xl p-4">
            <Text className="text-red-800 text-center font-semibold mb-2">
              Error de inicialización de Firebase
            </Text>
            <Text className="text-red-700 text-center text-sm mb-4">
              {initializationError.message || 'No se pudo conectar con los servicios de Firebase'}
            </Text>
            <TouchableOpacity
              className="bg-blue-600 rounded-lg p-3 items-center"
              onPress={handleRetryInitialization}
            >
              <Text className="text-white font-semibold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if both patients and tasks failed to load
  if (patientsError && tasksError) {
    const isIndexError = patientsError?.message?.includes('requires an index') || tasksError?.message?.includes('requires an index');
    
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
          <View>
            <Text className="text-2xl font-extrabold text-gray-900">PILDHORA</Text>
            <Text className="text-sm text-gray-500">Hola, {displayName}</Text>
          </View>
          <TouchableOpacity className="px-3 py-2 rounded-lg bg-gray-400 items-center justify-center" onPress={async () => {
            await dispatch(logout());
            router.replace('/');
          }}>
            <Text className="text-white font-bold text-center">Salir</Text>
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <View className="bg-orange-100 border border-orange-200 rounded-2xl p-4">
            <Text className="text-orange-800 text-center font-semibold mb-2">
              {isIndexError ? 'Configuración en progreso' : 'Error al cargar datos'}
            </Text>
            <Text className="text-orange-700 text-center text-sm mb-4">
              {isIndexError 
                ? 'Los índices de la base de datos se están configurando. Esto puede tardar unos minutos. Por favor, intenta nuevamente en breve.'
                : (patientsError?.message || tasksError?.message || 'Verifica tu conexión e intenta nuevamente.')
              }
            </Text>
            <TouchableOpacity
              className="bg-blue-600 rounded-lg p-3 items-center"
              onPress={handleRefresh}
            >
              <Text className="text-white font-semibold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
        <View>
          <Text className="text-2xl font-extrabold text-gray-900">PILDHORA</Text>
          <Text className="text-sm text-gray-500">Hola, {displayName}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          {/* Emergency icon-only button */}
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-red-500 items-center justify-center shadow-sm"
            onPress={handleEmergency}
            accessibilityLabel="Emergencia"
            accessibilityHint="Toca para ver opciones de emergencia"
          >
            <Ionicons name="alert" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center shadow-sm"
            onPress={async () => {
              await dispatch(logout());
              router.replace('/auth/signup');
            }}
            accessibilityLabel="Salir"
            accessibilityHint="Cerrar sesión y volver al registro"
          >
            <Ionicons name="log-out" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Modal */}
      {Platform.OS !== 'ios' && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <View className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
              <View className="p-6">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Emergencia</Text>
                <Text className="text-gray-600 mb-6 text-center">Selecciona una opción:</Text>
                <View className="gap-3">
                  <TouchableOpacity
                    className="bg-red-600 rounded-xl px-4 py-4 items-center shadow-sm active:bg-red-700"
                    onPress={() => callEmergency('911')}
                  >
                    <Text className="text-white font-bold text-lg">Llamar 911</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-orange-500 rounded-xl px-4 py-4 items-center shadow-sm active:bg-orange-600"
                    onPress={() => callEmergency('112')}
                  >
                    <Text className="text-white font-bold text-lg">Llamar 112</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-xl px-4 py-4 items-center active:bg-gray-200"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-gray-800 font-semibold text-lg">Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Patient Selector */}
        {patientsWithDevices.length > 0 && (
          <View className="px-4 py-3 bg-white border-b border-gray-200">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
              {patientsWithDevices.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  className={`px-4 py-2 rounded-full ${
                    selectedPatient?.id === patient.id
                      ? 'bg-blue-600'
                      : 'bg-gray-200 border border-gray-300'
                  }`}
                  onPress={() => handlePatientSelect(patient)}
                >
                  <Text
                    className={`font-semibold ${
                      selectedPatient?.id === patient.id ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {patient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedPatient ? (
          <>
            {/* Patient Status Card */}
            <View className="p-4">
              <View className="bg-white rounded-2xl p-4">
                <Text className="text-lg font-bold mb-2">Estado de {selectedPatient.name}</Text>
                <View className="items-center justify-center">
                  <DoseRing 
                    size={220} 
                    strokeWidth={18} 
                    segments={selectedPatient.doseSegments || []} 
                    accessibilityLabel={`Anillo de dosis de ${selectedPatient.name}`} 
                  />
                </View>
                {selectedPatient.deviceState && (
                  <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-200">
                    <Text className="text-sm text-gray-600">
                      Batería: {selectedPatient.deviceState.battery_level}%
                    </Text>
                    <Text className={`text-sm font-medium ${
                      selectedPatient.deviceState.is_online ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedPatient.deviceState.is_online ? 'En línea' : 'Desconectado'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Patient History */}
            <View className="px-4">
              <View className="bg-white rounded-2xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="time" size={22} color="#1C1C1E" />
                    <View>
                      <Text className="text-lg font-bold">Historial de {selectedPatient.name}</Text>
                      <Text className="text-gray-600">Dosis y eventos anteriores</Text>
                    </View>
                  </View>
                </View>
                
                {patientIntakes.length === 0 ? (
                  <View className="flex-1 justify-center items-center py-20">
                    <Ionicons name="time-outline" size={48} color="#9CA3AF" />
                    <Text className="text-gray-500 mt-4 text-center">
                      No hay registros en el historial
                    </Text>
                  </View>
                ) : (
                  <View className="mt-4">
                    {patientIntakes.map((record) => (
                      <View
                        key={record.id}
                        className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                      >
                        <View className="flex-row items-center">
                          {/* Status indicator */}
                          <View
                            className={`w-1 h-12 rounded-full mr-3 ${
                              record.status === IntakeStatus.TAKEN
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          
                          {/* Medication info */}
                          <View className="flex-1">
                            <Text className="font-semibold text-gray-900 text-base">
                              {record.medicationName}
                            </Text>
                            <Text className="text-gray-600 text-sm">
                              {record.dosage}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                              {formatTime(record.scheduledTime)}
                            </Text>
                          </View>
                          
                          {/* Status badge */}
                          <View
                            className={`px-3 py-1 rounded-full flex-row items-center ${
                              record.status === IntakeStatus.TAKEN
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            <Ionicons
                              name={record.status === IntakeStatus.TAKEN ? "checkmark-circle" : "close-circle"}
                              size={16}
                              color={record.status === IntakeStatus.TAKEN ? "#10B981" : "#EF4444"}
                            />
                            <Text
                              className={`ml-1 text-sm font-medium ${
                                record.status === IntakeStatus.TAKEN ? "text-green-700" : "text-red-700"
                              }`}
                            >
                              {record.status === IntakeStatus.TAKEN ? "Tomado" : "Olvidado"}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Taken time if available */}
                        {record.takenAt && (
                          <Text className="text-gray-500 text-xs mt-2 ml-4">
                            Tomado a las {formatTime(record.takenAt)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          /* No Patients State */
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-600 mt-4 text-center">
              No hay pacientes asignados a tu cuenta
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              Los pacientes aparecerán aquí cuando se te asignen
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
