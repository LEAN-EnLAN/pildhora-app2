import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';
import { getCaregiverPatients } from '../../../src/services/firebase/user';
import { Patient } from '../../../src/types';
import { Button, Card } from '../../../src/components/ui';
import { useRouter } from 'expo-router';

export default function CaregiverSelectPatient() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setLoading(false); return; }
      const list = await getCaregiverPatients(user.id);
      setPatients(list);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loading} />
      ) : patients.length === 0 ? (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>No hay pacientes asignados.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {patients.map((p) => (
            <Card key={p.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>{p.email}</Text>
                </View>
                <Button variant="primary" onPress={() => router.push(`/caregiver/medications/${p.id}`)}>Gestionar</Button>
              </View>
            </Card>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loading: { marginTop: 50 },
  emptyView: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 18, color: '#6B7280' },
  list: { padding: 16 },
  card: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 18, fontWeight: 'bold' },
  sub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
});
