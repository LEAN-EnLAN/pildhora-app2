import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../../../src/store';
import { Container, Card, AnimatedListItem } from '../../../src/components/ui';
import { ScreenWrapper, CaregiverHeader } from '../../../src/components/caregiver';
import { useLinkedPatients } from '../../../src/hooks/useLinkedPatients';
import { useScrollViewPadding } from '../../../src/hooks/useScrollViewPadding';
import { colors, spacing, typography } from '../../../src/theme/tokens';
import { ErrorState } from '../../../src/components/caregiver/ErrorState';
import { categorizeError } from '../../../src/utils/errorHandling';

export default function MedicationsIndexScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { contentPaddingBottom } = useScrollViewPadding();

  const { 
    patients, 
    isLoading,
    error,
    refetch 
  } = useLinkedPatients({
    caregiverId: user?.id || null,
    enabled: !!user?.id,
  });

  const handlePatientSelect = useCallback((patientId: string) => {
    router.push(`/caregiver/medications/${patientId}`);
  }, [router]);

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    const categorized = categorizeError(error);
    return (
      <ScreenWrapper>
        <Container>
          <ErrorState
            category={categorized.category}
            message={categorized.userMessage}
            onRetry={refetch}
          />
        </Container>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper applyTopPadding={false}>
      <CaregiverHeader 
        caregiverName={user?.name} 
        title="Medicamentos"
        showScreenTitle={true}
      />
      
      <Container>
        <ScrollView 
          contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>Selecciona un paciente para gestionar sus medicamentos</Text>

          {patients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No hay pacientes vinculados</Text>
              <Text style={styles.emptyDescription}>
                Vincula un dispositivo para comenzar a gestionar medicamentos.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {patients.map((patient, index) => (
                <AnimatedListItem key={patient.id} index={index}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handlePatientSelect(patient.id)}
                  >
                    <Card style={styles.card}>
                      <View style={styles.cardContent}>
                        <View style={styles.avatarContainer}>
                          <Ionicons name="person" size={24} color={colors.primary[600]} />
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={styles.patientName}>{patient.name}</Text>
                          <Text style={styles.patientEmail}>{patient.email}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                      </View>
                    </Card>
                  </TouchableOpacity>
                </AnimatedListItem>
              ))}
            </View>
          )}
        </ScrollView>
      </Container>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  list: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  patientName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginTop: spacing.md,
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
