import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons, Chip } from 'react-native-paper';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/features/auth/store';

const JOKE_TYPES = [
  { value: 'pun', label: 'Pun' },
  { value: 'one-liner', label: 'One-liner' },
  { value: 'dad-joke', label: 'Dad Joke' },
  { value: 'observational', label: 'Observational' },
];

const CATEGORIES = ['Technology', 'Food', 'Animals', 'Work', 'Relationships', 'Travel'];

export default function HomeScreen() {
  const [topic, setTopic] = useState('');
  const [jokeType, setJokeType] = useState('pun');
  const [category, setCategory] = useState('');
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useAuthStore();

  const generateJoke = async () => {
    if (!topic.trim()) {
      Alert.alert('Error', 'Please enter a topic for the joke');
      return;
    }

    try {
      setLoading(true);
      setJoke('');

      // Get the current session token
      const token = session?.access_token;
      if (!token) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      // Call the backend API (for now, we'll use placeholder until backend is deployed)
      // In production, this would be: process.env.EXPO_PUBLIC_API_URL + '/api/jokes/generate'

      // Call backend API (secure - API key is server-side only)
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://jokes-llm.vercel.app';
      console.log('API URL:', apiUrl); // Debug log

      const response = await fetch(`${apiUrl}/api/jokes/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          jokeType,
          category: category || undefined,
        }),
      });

      console.log('Response status:', response.status); // Debug log

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}`);
      }

      // Try to parse JSON with error handling
      let data;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText.substring(0, 200)); // Debug log
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response from server');
      }

      // Handle both response formats
      let generatedJoke;
      if (typeof data.joke === 'string') {
        // Backend returned fallback format: { joke: "string" }
        generatedJoke = data.joke.trim();
      } else if (data.joke?.content) {
        // Backend returned full format: { joke: { content: "string", ... } }
        generatedJoke = data.joke.content.trim();
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('No joke in response');
      }

      if (!generatedJoke) {
        throw new Error('No joke generated');
      }

      setJoke(generatedJoke);

      // Note: Backend already saves the joke to database
    } catch (error: any) {
      console.error('Error generating joke:', error);

      // Show more helpful error message
      let errorMessage = 'Failed to generate joke. Please try again.';

      if (error.message.includes('Server error')) {
        errorMessage = 'Server error: ' + error.message;
      } else if (error.message.includes('Invalid response')) {
        errorMessage = 'The server returned an invalid response. Please check your connection.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot reach the server. Please check your internet connection.';
      }

      Alert.alert('Error generating joke', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineLarge" style={styles.title}>
        Joke Generator
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Get your daily dose of laughs!
      </Text>

      <TextInput
        label="Topic"
        value={topic}
        onChangeText={setTopic}
        mode="outlined"
        placeholder="e.g., cats, programming, coffee"
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.label}>
        Joke Type
      </Text>
      <SegmentedButtons
        value={jokeType}
        onValueChange={setJokeType}
        buttons={JOKE_TYPES}
        style={styles.segmented}
      />

      <Text variant="labelLarge" style={styles.label}>
        Category (Optional)
      </Text>
      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            selected={category === cat}
            onPress={() => setCategory(category === cat ? '' : cat)}
            style={styles.chip}
          >
            {cat}
          </Chip>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={generateJoke}
        loading={loading}
        disabled={loading}
        style={styles.button}
        icon="creation"
      >
        Generate Joke
      </Button>

      {joke ? (
        <Card style={styles.jokeCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.jokeText}>
              {joke}
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 20,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 8,
    marginBottom: 24,
  },
  jokeCard: {
    marginBottom: 20,
  },
  jokeText: {
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
