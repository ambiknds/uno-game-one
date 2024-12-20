import { supabase } from './supabase';
import toast from 'react-hot-toast';

export const signInAnonymously = async () => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: `${crypto.randomUUID()}@anonymous.uno.com`,
      password: crypto.randomUUID(),
    });

    if (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to sign in anonymously');
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Authentication error:', error);
    toast.error('Failed to sign in anonymously');
    throw error;
  }
};