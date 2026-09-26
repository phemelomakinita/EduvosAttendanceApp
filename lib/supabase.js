import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://uvjoikkvxxadjhbhqwbr.supabase.co';
const supabaseAnonKey = 'sb_publishable_x_8lyz6dpHQopQNjDi2fhQ_IVF1tXnl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});