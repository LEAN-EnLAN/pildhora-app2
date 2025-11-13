import React from 'react'
import { View, Text, StyleSheet, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Card } from '../../../src/components/ui'
import { Link } from 'expo-router'

export default function ProvisionIntro() {
  return (
    <SafeAreaView edges={['top','bottom']} style={styles.container}>
      <View style={styles.pad}>
        <Card>
          <Text style={styles.title}>Provision New Device</Text>
          <Text style={styles.subtitle}>Power on the pillbox. Connect your phone to the Wi‑Fi network named Pillbox_Setup_XXXX.</Text>
          <View style={styles.actions}>
            <Button variant="primary" size="md" onPress={() => Linking.openURL('http://192.168.4.1/')}>Open Portal</Button>
            <Link href="/device/provision/credentials" asChild>
              <Button variant="secondary" size="md" onPress={() => {}}>Continue</Button>
            </Link>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  pad: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#4B5563', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12 }
})

