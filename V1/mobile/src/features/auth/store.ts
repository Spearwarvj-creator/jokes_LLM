import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;

  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    try {
      set({ loading: true });

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null });
      });

      set({ initialized: true });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) return { error };

      // Session will be set automatically by onAuthStateChange
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      // Session will be set automatically by onAuthStateChange
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ session: null, user: null });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
