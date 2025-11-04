import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/services/firebase';

// Definición de tipos para el estado
interface LoginState {
  email: string;
  password: string;
  isRegistering: boolean;
  role: 'patient' | 'caregiver' | null;
}

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [role, setRole] = useState<'patient' | 'caregiver' | null>(null);
  const router = useRouter();

  const handleLogin = async (): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'patient') {
          router.push('/patient/home');
        } else if (userData.role === 'caregiver') {
          router.push('/caregiver/dashboard');
        }
      } else {
        Alert.alert('Error', 'No se encontró información de usuario.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error de inicio de sesión', errorMessage);
    }
  };

  const handleRegister = async (): Promise<void> => {
    if (!role) {
      Alert.alert('Error', 'Por favor selecciona un rol');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
      });
      Alert.alert('Éxito', 'Usuario registrado correctamente');
      setIsRegistering(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error de registro', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pildhora</Text>
      <Text style={styles.subtitle}>Tu gestor de medicación con confianza</Text>
      
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Introduce tu usuario"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Introduce tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        {isRegistering && (
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'patient' && styles.selectedRole]}
              onPress={() => setRole('patient')}
            >
              <Text style={styles.roleText}>Paciente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'caregiver' && styles.selectedRole]}
              onPress={() => setRole('caregiver')}
            >
              <Text style={styles.roleText}>Cuidador</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={isRegistering ? handleRegister : handleLogin}
        >
          <Text style={styles.buttonText}>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.link}>
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedRole: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
  },
  roleText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#1890ff',
    textAlign: 'center',
    fontSize: 14,
  },
});