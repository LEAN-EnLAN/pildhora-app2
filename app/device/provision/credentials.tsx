import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Card } from '../../../src/components/ui'
import { PHTextField } from '../../../src/components/ui/PHTextField'
import { useRouter } from 'expo-router'

export default function ProvisionCredentials() {
  const router = useRouter()
  const [wifiSsid, setWifiSsid] = useState('')
  const [wifiPass, setWifiPass] = useState('')
  const [deviceEmail, setDeviceEmail] = useState('')
  const [devicePassword, setDevicePassword] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [timezone, setTimezone] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!wifiSsid || !wifiPass || !deviceEmail || !devicePassword || !deviceId || !timezone) {
      Alert.alert('Missing info', 'Complete all fields')
      return
    }
    try {
      setLoading(true)
      const body = new URLSearchParams({ wifiSsid, wifiPass, deviceEmail, devicePassword, deviceId, timezone }).toString()
      const res = await fetch('http://192.168.4.1/provision', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      if (!res.ok) throw new Error('Provisioning failed')
      router.push({ pathname: '/device/provision/confirm', params: { deviceId, timezone } })
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Provisioning error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={styles.container}>
      <View style={styles.pad}>
        <Card>
          <Text style={styles.title}>Enter Credentials</Text>
          <PHTextField placeholder="WiFi SSID" value={wifiSsid} onChangeText={setWifiSsid} style={styles.input} />
          <PHTextField placeholder="WiFi Password" value={wifiPass} onChangeText={setWifiPass} style={styles.input} />
          <PHTextField placeholder="Device Email" value={deviceEmail} onChangeText={setDeviceEmail} style={styles.input} />
          <PHTextField placeholder="Device Password" value={devicePassword} onChangeText={setDevicePassword} style={styles.input} />
          <PHTextField placeholder="Device ID" value={deviceId} onChangeText={setDeviceId} style={styles.input} />
          <PHTextField placeholder="Timezone (e.g. America/New_York)" value={timezone} onChangeText={setTimezone} style={styles.input} />
          <Button onPress={submit} disabled={loading}>{loading ? 'Saving...' : 'Provision'}</Button>
        </Card>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  pad: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  input: { marginBottom: 8 }
})

