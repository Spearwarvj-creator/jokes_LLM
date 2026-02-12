import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '../../src/features/auth/store';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading } = useAuthStore();
  const router = useRouter();

  const handleSignup = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const { error } = await signUp(email.trim(), password, displayName.trim());

    if (error) {
      Alert.alert('Signup Failed', error.message || 'An error occurred');
    } else {
      Alert.alert(
        'Success!',
        'Account created successfully. Please log in.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Join the Fun!
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Create an account to start generating jokes
        </Text>

        <TextInput
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          mode="outlined"
          autoCapitalize="words"
          autoComplete="name"
          style={styles.input}
        />

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
          autoComplete="password-new"
          style={styles.input}
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign Up
        </Button>

        <Link href="/(auth)/login" asChild>
          <Button mode="text" style={styles.linkButton}>
            Already have an account? Sign In
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
