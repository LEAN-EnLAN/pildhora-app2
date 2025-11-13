import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Card } from '../../../src/components/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getAuthInstance, getRdbInstance } from '../../../src/services/firebase'
import { ref, get } from 'firebase/database'
import { linkDeviceToUser } from '../../../src/services/deviceLinking'

export default function ProvisionConfirm() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const deviceId = String(params.deviceId || '')
  const [status, setStatus] = useState('Waiting for device...')
  const [ready, setReady] = useState(false)
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const rdb = await getRdbInstance()
        if (!rdb || !deviceId) return
        const stateSnap = await get(ref(rdb, `devices/${deviceId}/state`))
        const val = stateSnap.val() || {}
        const ts = val?.time_synced === true
        const cs = val?.current_status || 'N/D'
        setStatus(`Status: ${cs} • Time synced: ${ts ? 'yes' : 'no'}`)
        setReady(ts)
      } catch {}
      if (!cancelled) setTimeout(tick, 2000)
    }
    tick()
    return () => { cancelled = true }
  }, [deviceId])

  const linkNow = async () => {
    try {
      setLinking(true)
      const auth = await getAuthInstance()
      const uid = auth?.currentUser?.uid
      if (!uid || !deviceId) return
      await linkDeviceToUser(uid, deviceId)
      router.replace('/patient/link-device')
    } finally {
      setLinking(false)
    }
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={styles.container}>
      <View style={styles.pad}>
        <Card>
          <Text style={styles.title}>Finalize Provisioning</Text>
          <Text style={styles.subtitle}>{status}</Text>
          <Button onPress={linkNow} disabled={!ready || linking}>{linking ? 'Linking...' : 'Link Device'}</Button>
        </Card>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  pad: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#4B5563', marginBottom: 12 }
})

