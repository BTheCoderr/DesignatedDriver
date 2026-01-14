import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function AuthDebug() {
  const [envStatus, setEnvStatus] = useState<{
    url: boolean;
    key: boolean;
    keyPreview: string;
  } | null>(null);

  useEffect(() => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    
    setEnvStatus({
      url: !!url,
      key: !!key,
      keyPreview: key ? `${key.substring(0, 20)}...` : 'MISSING',
    });
  }, []);

  if (!envStatus) return null;

  if (!envStatus.url || !envStatus.key) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚠️ Configuration Error</Text>
        <Text style={styles.text}>
          Supabase environment variables are missing!
        </Text>
        <Text style={styles.text}>
          URL: {envStatus.url ? '✓' : '✗ Missing'}
        </Text>
        <Text style={styles.text}>
          API Key: {envStatus.key ? '✓' : '✗ Missing'}
        </Text>
        <Text style={styles.help}>
          Please check your .env file and make sure it contains:
        </Text>
        <Text style={styles.code}>
          EXPO_PUBLIC_SUPABASE_URL=your-url{'\n'}
          EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff4444',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  help: {
    color: '#fff',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  code: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 4,
  },
});
