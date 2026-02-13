import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Recommended models for joke generation (in order of cost)
const JOKE_MODELS = [
  'x-ai/grok-3-mini', // Fast and reliable for joke generation
  'openai/gpt-3.5-turbo', // Fallback option
];

interface JokeGenerationParams {
  topic: string;
  jokeType: string;
  category?: string;
}

export async function generateJoke(params: JokeGenerationParams) {
  const { topic, jokeType, category } = params;

  // Construct optimized prompt
  const prompt = buildJokePrompt(topic, jokeType, category);

  // Try models in order (fallback strategy)
  for (const model of JOKE_MODELS) {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional comedian who creates funny, clever jokes. Your jokes are witty, appropriate, and make people laugh.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8, // Good balance for humor
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000', // Optional: for ranking
          },
        }
      );

      const joke = response.data.choices[0]?.message?.content?.trim();
      const usage = response.data.usage;

      return {
        joke,
        modelUsed: model,
        tokensUsed: usage?.total_tokens || 0,
        costUsd: calculateCost(model, usage?.total_tokens || 0),
      };
    } catch (error: any) {
      const errorDetails = {
        model,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        apiKeyPresent: !!OPENROUTER_API_KEY,
        apiKeyPrefix: OPENROUTER_API_KEY?.substring(0, 10),
      };
      console.error(`Model ${model} failed:`, JSON.stringify(errorDetails, null, 2));
      // Try next model
      continue;
    }
  }

  throw new Error('All models failed to generate joke');
}

function buildJokePrompt(topic: string, jokeType: string, category?: string): string {
  let prompt = `Generate a ${jokeType} joke`;

  if (category) {
    prompt += ` in the ${category} category`;
  }

  prompt += ` about ${topic}.`;

  // Add type-specific instructions
  switch (jokeType) {
    case 'pun':
      prompt += ' Use wordplay and double meanings. Make it clever and witty.';
      break;
    case 'one-liner':
      prompt += ' Keep it short and punchy. One sentence maximum.';
      break;
    case 'dad-joke':
      prompt += ' Make it wholesome and groan-worthy in a good way.';
      break;
    case 'dark':
      prompt += ' Make it edgy but tasteful. Not offensive.';
      break;
    case 'observational':
      prompt += ' Point out something relatable and funny about everyday life.';
      break;
    default:
      prompt += ' Make it funny and entertaining.';
  }

  prompt += ' Just return the joke, nothing else.';

  return prompt;
}

function calculateCost(model: string, tokens: number): number {
  // Approximate cost per 1k tokens (you should update these based on actual rates)
  const costPer1kTokens: Record<string, number> = {
    'x-ai/grok-3-mini': 0.0005,
    'openai/gpt-3.5-turbo': 0.0015,
  };

  const rate = costPer1kTokens[model] || 0.001;
  return (tokens / 1000) * rate;
}
