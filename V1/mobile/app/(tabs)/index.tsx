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

      // TEMPORARY: Direct OpenRouter call for testing (NOT SECURE for production!)
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a professional comedian who creates funny, clever jokes.',
            },
            {
              role: 'user',
              content: `Generate a ${jokeType} joke about ${topic}. ${category ? `Category: ${category}.` : ''} Just return the joke, nothing else.`,
            },
          ],
          temperature: 0.8,
          max_tokens: 300,
        }),
      });

      const data = await response.json();
      const generatedJoke = data.choices[0]?.message?.content?.trim();

      if (!generatedJoke) {
        throw new Error('No joke generated');
      }

      setJoke(generatedJoke);

      // Save to database
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('jokes').insert({
          user_id: userData.user.id,
          content: generatedJoke,
          topic: topic.trim(),
          joke_type: jokeType,
          category: category || null,
        });
      }
    } catch (error: any) {
      console.error('Error generating joke:', error);
      Alert.alert('Error', 'Failed to generate joke. Please try again.');
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
