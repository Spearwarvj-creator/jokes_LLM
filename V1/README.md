# Jokes LLM Mobile App

A mobile application that generates jokes using AI (OpenRouter API), with features for daily joke delivery via SMS and push notifications.

## Project Structure

```
V1/
├── mobile/          # Expo React Native app
├── backend/         # Vercel serverless functions
├── supabase/        # Database migrations
└── shared/          # Shared types and utilities
```

## Prerequisites

Before starting, you need to set up accounts for:

1. **Supabase** (https://supabase.com) - Database and authentication
2. **Vercel** (https://vercel.com) - Backend hosting
3. **OpenRouter** (https://openrouter.ai) - AI API for joke generation
4. **Twilio** (https://twilio.com) - SMS delivery (optional for MVP)
5. **Upstash** (https://upstash.com) - Redis for rate limiting (optional for MVP)

## Quick Start

### 1. Set Up Supabase

1. Create a new project at https://supabase.com
2. Wait for database provisioning
3. Go to Settings → API
4. Copy your Project URL and anon/public key
5. Copy your service_role key (keep this secret!)
6. Go to SQL Editor and run the migration:
   ```bash
   # Copy contents of supabase/migrations/20250212000000_initial_schema.sql
   # and run it in the Supabase SQL Editor
   ```

### 2. Set Up OpenRouter

1. Sign up at https://openrouter.ai
2. Go to Keys page
3. Create new API key
4. Add $10 credits for testing

### 3. Configure Environment Variables

**Mobile App:**
```bash
cd mobile
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

**Backend:**
```bash
cd backend
cp .env.example .env.local
# Edit .env.local with all credentials
```

### 4. Run Mobile App

```bash
cd mobile
npm install
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### 5. Run Backend Locally (Optional)

```bash
cd backend
npm install
# Install Vercel CLI: npm install -g vercel
vercel dev
```

## Development Workflow

### Phase 1: Foundation ✅
- [x] Project structure created
- [x] Dependencies installed
- [x] Database schema created
- [x] Environment variables configured

### Phase 2: Authentication (Next)
- [ ] Supabase Auth integration
- [ ] Login/signup screens
- [ ] Protected routes

### Phase 3: Core Joke Generation
- [ ] OpenRouter proxy endpoint
- [ ] Joke generation UI
- [ ] Save jokes to database

### Phase 4: Daily Delivery
- [ ] Push notifications
- [ ] SMS integration
- [ ] Cron job for daily delivery

## Tech Stack

- **Mobile**: Expo SDK 51+, React Native, TypeScript, Expo Router
- **State**: Zustand + TanStack Query
- **Backend**: Vercel Serverless Functions, Node.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **AI**: OpenRouter API
- **SMS**: Twilio
- **Push**: Expo Push Notifications

## Useful Commands

```bash
# Mobile app
cd mobile
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Backend
cd backend
vercel dev             # Run backend locally
vercel deploy          # Deploy to Vercel

# Database
# Run migrations in Supabase SQL Editor
# or use Supabase CLI:
npx supabase db push
```

## Troubleshooting

### Expo app won't start
```bash
cd mobile
rm -rf node_modules
npm install
npx expo start -c
```

### Can't connect to backend
- Make sure EXPO_PUBLIC_API_URL in mobile/.env.local matches your backend URL
- For local development: http://localhost:3000
- For Vercel: https://your-project.vercel.app

### Database connection issues
- Verify SUPABASE_URL and keys in .env.local
- Check that migrations have been run in Supabase SQL Editor
- Verify RLS policies are enabled

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` files
- Keep OpenRouter API key server-side only (backend)
- Never expose Supabase service_role key in mobile app
- Use anon/public key in mobile app only

## Next Steps

1. Complete account setups (see plan document)
2. Run database migrations in Supabase
3. Start building authentication (Session 2)

## Documentation

See `/Users/vijaychilaka/.claude/plans/happy-snuggling-willow.md` for complete implementation plan.
