import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase-client';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { generateJoke } from '../../lib/openrouter';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase using regular client (anon key)
    // This is the correct way to validate user JWT tokens
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get request body
    const { topic, jokeType, category } = req.body;

    if (!topic || !jokeType) {
      return res.status(400).json({ error: 'Missing required fields: topic, jokeType' });
    }

    // Validate joke type
    const validJokeTypes = ['pun', 'one-liner', 'dad-joke', 'dark', 'observational'];
    if (!validJokeTypes.includes(jokeType)) {
      return res.status(400).json({ error: 'Invalid joke type' });
    }

    // Generate joke using OpenRouter
    const result = await generateJoke({ topic, jokeType, category });

    if (!result.joke) {
      return res.status(500).json({ error: 'Failed to generate joke' });
    }

    // Save joke to database
    const { data: savedJoke, error: dbError } = await supabaseAdmin
      .from('jokes')
      .insert({
        user_id: user.id,
        content: result.joke,
        topic,
        joke_type: jokeType,
        category,
        model_used: result.modelUsed,
        tokens_used: result.tokensUsed,
        cost_usd: result.costUsd,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving joke:', dbError);
      // Return consistent format even if saving fails
      return res.status(200).json({
        joke: {
          content: result.joke,
          topic,
          joke_type: jokeType,
          category,
          model_used: result.modelUsed,
          warning: 'Joke generated but not saved to history',
        },
      });
    }

    // Return the joke
    return res.status(200).json({
      joke: savedJoke,
    });
  } catch (error: any) {
    console.error('Error generating joke:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
