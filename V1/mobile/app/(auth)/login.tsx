import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '../../src/features/auth/store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const { error } = await signIn(email.trim(), password);

    if (error) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome Back!
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to get your daily dose of laughs
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign In
        </Button>

        <Link href="/(auth)/signup" asChild>
          <Button mode="text" style={styles.linkButton}>
            Don't have an account? Sign Up
          </Button>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 16,
  },
});
