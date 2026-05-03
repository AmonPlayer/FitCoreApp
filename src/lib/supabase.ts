import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// SecureStore has a 2048-byte limit per key; JWT tokens can exceed this.
// We chunk large values across multiple keys.
const CHUNK_SIZE = 1800;

function chunkKey(key: string, index: number) {
  return `${key}.chunk.${index}`;
}

const ExpoSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const count = await SecureStore.getItemAsync(`${key}.chunks`);
    if (count === null) {
      return SecureStore.getItemAsync(key);
    }
    const chunks: string[] = [];
    for (let i = 0; i < parseInt(count, 10); i++) {
      const chunk = await SecureStore.getItemAsync(chunkKey(key, i));
      if (chunk === null) return null;
      chunks.push(chunk);
    }
    return chunks.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}.chunks`, String(chunks));
    for (let i = 0; i < chunks; i++) {
      await SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
  },

  async removeItem(key: string): Promise<void> {
    const count = await SecureStore.getItemAsync(`${key}.chunks`);
    if (count !== null) {
      for (let i = 0; i < parseInt(count, 10); i++) {
        await SecureStore.deleteItemAsync(chunkKey(key, i));
      }
      await SecureStore.deleteItemAsync(`${key}.chunks`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl: string = extra.supabaseUrl ?? '';
const supabaseAnonKey: string = extra.supabaseAnonKey ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
