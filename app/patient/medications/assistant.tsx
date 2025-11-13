import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../src/store';
import { callPatientMedicationQA } from '../../../src/services/functions/ai';

export default function MedicationAssistantScreen() {
  const { user } = useSelector((s: RootState) => s.auth);
  const { language } = useSelector((s: RootState) => s.preferences);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>('');

  const labelAsk = language === 'en' ? 'Ask about your medications' : 'Pregunta sobre tus medicamentos';
  const labelButton = language === 'en' ? 'Ask' : 'Preguntar';
  const labelTitle = language === 'en' ? 'Medication Assistant' : 'Asistente de Medicación';

  const handleAsk = async () => {
    if (!user?.id || !question.trim()) return;
    try {
      setLoading(true);
      const res = await callPatientMedicationQA(user.id, question);
      const text = res.answer || res.raw || '';
      setAnswer(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{labelTitle}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>{labelAsk}</Text>
        <TextInput value={question} onChangeText={setQuestion} multiline style={styles.input} placeholder={language === 'en' ? 'Type your question…' : 'Escribe tu pregunta…'} />
        <TouchableOpacity onPress={handleAsk} style={styles.button} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{labelButton}</Text>}
        </TouchableOpacity>
      </View>
      {!!answer && (
        <View style={styles.answerCard}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 8, padding: 16, borderRadius: 8 },
  label: { marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F9FAFB', minHeight: 80, padding: 12, borderRadius: 8 },
  button: { backgroundColor: '#3B82F6', marginTop: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  answerCard: { backgroundColor: '#FFFFFF', marginHorizontal: 8, marginTop: 8, padding: 16, borderRadius: 8 },
  answerText: { color: '#111827' },
});

