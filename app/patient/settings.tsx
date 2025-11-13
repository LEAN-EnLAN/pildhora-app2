import React, { useEffect, useState } from 'react'
import { View, Text, Switch, StyleSheet, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Container, Card, Button, PHTextField } from '../../src/components/ui'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../src/store'
import { setNotificationsEnabled, setNotificationHierarchy, setNotificationPermissionStatus, addModality, removeModality } from '../../src/store/slices/preferencesSlice'
import { savePreferencesToBackend, savePermissionsToBackend } from '../../src/store/slices/preferencesSlice'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { ensurePushTokensRegistered } from '../../src/services/notifications/push'
 

export default function PatientSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((s: RootState) => s.auth)
  const prefs = useSelector((s: RootState) => s.preferences)
  const uid = user?.id || ''

  const [notifStatus, setNotifStatus] = useState<'granted'|'denied'|'undetermined'>('undetermined')
  const [newModality, setNewModality] = useState('')
  const appVersion = Constants?.manifest2?.version || Constants?.expoConfig?.version || '0.0.0'

  useEffect(() => {
    let mounted = true
    Notifications.getPermissionsAsync().then(r => {
      if (!mounted) return
      const status = r.status as 'granted'|'denied'|'undetermined'
      setNotifStatus(status)
      dispatch(setNotificationPermissionStatus(status))
    })
    return () => { mounted = false }
  }, [dispatch])

  const handleToggleNotifications = (enabled: boolean) => {
    dispatch(setNotificationsEnabled(enabled))
    if (uid) dispatch(savePreferencesToBackend(uid))
  }

  const handleRequestNotifications = async () => {
    const res = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true }
    } as any)
    const status = res.status as 'granted'|'denied'|'undetermined'
    setNotifStatus(status)
    dispatch(setNotificationPermissionStatus(status))
    if (status === 'granted' && uid) {
      await ensurePushTokensRegistered(uid)
      await dispatch(savePermissionsToBackend(uid))
    }
  }

  const setHierarchyPreset = (preset: 'default'|'medicationFirst'|'generalLast') => {
    const map: Record<string, string[]> = {
      default: ['urgent','medication','general'],
      medicationFirst: ['medication','urgent','general'],
      generalLast: ['urgent','general','medication'],
    }
    dispatch(setNotificationHierarchy(map[preset]))
    if (uid) dispatch(savePreferencesToBackend(uid))
  }

  const setModalities = (type: 'urgent'|'medication'|'general', enabled: boolean) => {
    const current = prefs.notifications.hierarchy
    const list = current.filter(x => x !== type)
    const next = enabled ? [type, ...list] : list
    dispatch(setNotificationHierarchy(next))
    if (uid) dispatch(savePreferencesToBackend(uid))
  }

  const addNewModality = async () => {
    const name = newModality.trim().toLowerCase()
    if (!name) return
    dispatch(addModality(name))
    setNewModality('')
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync(name, {
          name,
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        })
      } catch {}
    }
    if (uid) dispatch(savePreferencesToBackend(uid))
  }

  const removeExistingModality = async (name: string) => {
    dispatch(removeModality(name))
    if (uid) dispatch(savePreferencesToBackend(uid))
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={styles.container}>
      <Container style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configuraciones</Text>
          <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
        </View>

        <View style={styles.sectionPadding}>
          <Card>
            <View style={styles.profileRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{user?.name || 'Paciente'}</Text>
                <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              </View>
              <Button variant="secondary" size="sm" onPress={() => {}}>
                Editar perfil
              </Button>
            </View>
          </Card>
        </View>

        

        <View style={styles.sectionPadding}>
          <Card>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Estado permisos</Text>
              <Text style={styles.rowValue}>{notifStatus}</Text>
            </View>
            <View style={styles.actionsRow}>
              <Button variant="primary" size="sm" onPress={handleRequestNotifications} style={styles.actionButtonCompact}>Solicitar permiso</Button>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Habilitar notificaciones</Text>
              <Switch value={prefs.notifications.enabled} onValueChange={handleToggleNotifications} />
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Prioridad</Text>
              <Text style={styles.rowValue}>{prefs.notifications.hierarchy.join(' > ')}</Text>
            </View>
            <View style={styles.actionsRow}>
              <Button variant="secondary" size="sm" onPress={() => setHierarchyPreset('default')} style={styles.actionButtonCompact}>Predeterminado</Button>
              <Button variant="secondary" size="sm" onPress={() => setHierarchyPreset('medicationFirst')} style={styles.actionButtonCompact}>Medicación primero</Button>
              <Button variant="secondary" size="sm" onPress={() => setHierarchyPreset('generalLast')} style={styles.actionButtonCompact}>General al final</Button>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Modalidades</Text>
              <View style={styles.modalitiesGroup}>
                <View style={styles.modalityItem}>
                  <Text style={styles.modalityLabel}>Urgente</Text>
                  <Switch value={prefs.notifications.hierarchy.includes('urgent')} onValueChange={(v) => setModalities('urgent', v)} />
                </View>
                <View style={styles.modalityItem}>
                  <Text style={styles.modalityLabel}>Medicación</Text>
                  <Switch value={prefs.notifications.hierarchy.includes('medication')} onValueChange={(v) => setModalities('medication', v)} />
                </View>
                <View style={styles.modalityItem}>
                  <Text style={styles.modalityLabel}>General</Text>
                  <Switch value={prefs.notifications.hierarchy.includes('general')} onValueChange={(v) => setModalities('general', v)} />
                </View>
              </View>
            </View>
            <View style={styles.rowColumn}>
              <Text style={styles.rowLabel}>Agregar modalidad</Text>
              <View style={styles.addRow}>
                <PHTextField value={newModality} placeholder="p.ej. recordatorios" onChangeText={setNewModality} style={styles.addInput} />
                <Button variant="primary" size="md" onPress={addNewModality}>Agregar</Button>
              </View>
              <View style={styles.chipsContainer}>
                {prefs.notifications.hierarchy.map((m) => (
                  <View key={m} style={styles.chip}>
                    <Text style={styles.chipText}>{m}</Text>
                    <Button variant="secondary" size="sm" onPress={() => removeExistingModality(m)} style={styles.chipButton}>✕</Button>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.sectionPadding}>
          <Card>
            <Text style={styles.sectionTitle}>Dispositivo</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Sistema</Text>
              <Text style={styles.rowValue}>{Platform.OS}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Versión app</Text>
              <Text style={styles.rowValue}>{appVersion}</Text>
            </View>
          </Card>
        </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  scrollContent: { paddingBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280' },
  sectionPadding: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  profileEmail: { color: '#4B5563', flexShrink: 1, flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 16, color: '#111827', flex: 1, paddingRight: 8 },
  rowValue: { color: '#4B5563', flexShrink: 1, textAlign: 'right' },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
  rowActionButton: { marginLeft: 8 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', paddingTop: 4 },
  actionButtonCompact: { marginLeft: 8, marginBottom: 8, paddingHorizontal: 8 },
  modalitiesGroup: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' },
  modalityItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  modalityLabel: { color: '#111827', marginRight: 6 },
  rowColumn: { paddingVertical: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addInput: { flex: 1 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipText: { color: '#111827', marginRight: 6 },
  chipButton: { paddingHorizontal: 8, paddingVertical: 4 },
})
