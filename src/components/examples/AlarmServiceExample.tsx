/**
 * AlarmServiceExample Component
 * 
 * This is an example component demonstrating how to use the AlarmService
 * in a React Native component. This file is for reference only and is not
 * used in the actual application.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { alarmService, AlarmConfig } from '../../services/alarmService';
import { medicationToAlarmConfigs, getNextAlarmTime } from '../../utils/alarmUtils';
import { Medication } from '../../types';

export const AlarmServiceExample: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const [alarmIds, setAlarmIds] = useState<string[]>([]);
  const [nextAlarm, setNextAlarm] = useState<Date | null>(null);

  // Example medication
  const exampleMedication: Medication = {
    id: 'med_example',
    name: 'Example Medication',
    emoji: '💊',
    times: ['08:00', '14:00', '20:00'],
    frequency: 'Daily',
    doseValue: '500',
    doseUnit: 'mg',
    quantityType: 'tablets',
    patientId: 'patient_123',
    caregiverId: 'caregiver_456',
    trackInventory: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  useEffect(() => {
    // Check permission status on mount
    checkPermissionStatus();
    
    // Calculate next alarm
    const next = getNextAlarmTime(exampleMedication);
    setNextAlarm(next);
  }, []);

  const checkPermissionStatus = async () => {
    const canSchedule = await alarmService.canScheduleAlarms();
    setPermissionStatus(canSchedule ? 'granted' : 'denied');
  };

  const handleRequestPermissions = async () => {
    try {
      const status = await alarmService.requestPermissions();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        Alert.alert('Éxito', 'Permisos de notificación concedidos');
      } else {
        Alert.alert(
          'Permisos Denegados',
          'No se pudieron obtener los permisos de notificación'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.userMessage || 'Error al solicitar permisos');
    }
  };

  const handleCreateAlarms = async () => {
    try {
      // Convert medication to alarm configs
      const configs = medicationToAlarmConfigs(exampleMedication);
      const createdIds: string[] = [];

      // Create alarms for each time
      for (const config of configs) {
        const result = await alarmService.createAlarm(config);
        
        if (result.success) {
          createdIds.push(result.alarmId);
          
          if (result.fallbackToInApp) {
            Alert.alert(
              'Notificación',
              'Se usarán notificaciones en la aplicación porque los permisos fueron denegados'
            );
          }
        }
      }

      setAlarmIds(createdIds);
      Alert.alert('Éxito', `Se crearon ${createdIds.length} alarmas`);
    } catch (error: any) {
      Alert.alert('Error', error.userMessage || 'Error al crear alarmas');
    }
  };

  const handleUpdateAlarms = async () => {
    try {
      // Update with new times
      const updatedMedication = {
        ...exampleMedication,
        times: ['09:00', '15:00', '21:00'], // New times
      };

      const configs = medicationToAlarmConfigs(updatedMedication);
      const updatedIds: string[] = [];

      // Delete old alarms
      await alarmService.deleteAlarm(exampleMedication.id);

      // Create new alarms
      for (const config of configs) {
        const result = await alarmService.createAlarm(config);
        if (result.success) {
          updatedIds.push(result.alarmId);
        }
      }

      setAlarmIds(updatedIds);
      Alert.alert('Éxito', 'Alarmas actualizadas');
    } catch (error: any) {
      Alert.alert('Error', error.userMessage || 'Error al actualizar alarmas');
    }
  };

  const handleDeleteAlarms = async () => {
    try {
      await alarmService.deleteAlarm(exampleMedication.id);
      setAlarmIds([]);
      Alert.alert('Éxito', 'Alarmas eliminadas');
    } catch (error: any) {
      Alert.alert('Error', error.userMessage || 'Error al eliminar alarmas');
    }
  };

  const handleViewScheduledNotifications = async () => {
    try {
      const scheduled = await alarmService.getAllScheduledNotifications();
      Alert.alert(
        'Notificaciones Programadas',
        `Total: ${scheduled.length}\n\n${scheduled.map(n => 
          `ID: ${n.identifier}\nTítulo: ${n.content.title}`
        ).join('\n\n')}`
      );
    } catch (error: any) {
      Alert.alert('Error', 'Error al obtener notificaciones programadas');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alarm Service Example</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permission Status</Text>
        <Text style={styles.status}>
          {permissionStatus === 'granted' ? '✅ Granted' : '❌ Denied/Undetermined'}
        </Text>
        <Button title="Request Permissions" onPress={handleRequestPermissions} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Management</Text>
        <Text style={styles.info}>
          Medication: {exampleMedication.emoji} {exampleMedication.name}
        </Text>
        <Text style={styles.info}>
          Times: {exampleMedication.times.join(', ')}
        </Text>
        <Text style={styles.info}>
          Frequency: {exampleMedication.frequency}
        </Text>
        {nextAlarm && (
          <Text style={styles.info}>
            Next Alarm: {nextAlarm.toLocaleString()}
          </Text>
        )}
        <Text style={styles.info}>
          Active Alarms: {alarmIds.length}
        </Text>
        
        <View style={styles.buttonGroup}>
          <Button title="Create Alarms" onPress={handleCreateAlarms} />
          <Button title="Update Alarms" onPress={handleUpdateAlarms} />
          <Button title="Delete Alarms" onPress={handleDeleteAlarms} color="red" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug</Text>
        <Button 
          title="View Scheduled Notifications" 
          onPress={handleViewScheduledNotifications} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.note}>
          Note: This is an example component for demonstration purposes.
          In the actual app, alarms are managed automatically through Redux
          when medications are created, updated, or deleted.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  buttonGroup: {
    marginTop: 10,
    gap: 10,
  },
  note: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default AlarmServiceExample;
