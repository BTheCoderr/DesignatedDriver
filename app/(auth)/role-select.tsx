import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function RoleSelectScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectRole = async (role: 'user' | 'driver') => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      Alert.alert('Error', 'Not authenticated');
      router.replace('/(auth)/login');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to set role');
      return;
    }

    if (role === 'driver') {
      router.replace('/(driver)');
    } else {
      router.replace('/(user)');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Role</Text>
      <Text style={styles.subtitle}>How will you use Chauffer?</Text>

      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, loading && styles.optionDisabled]}
          onPress={() => selectRole('user')}
          disabled={loading}
        >
          <Text style={styles.optionEmoji}>🚗</Text>
          <Text style={styles.optionTitle}>I need a driver</Text>
          <Text style={styles.optionDescription}>
            Request a professional driver to take you and your car home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, loading && styles.optionDisabled]}
          onPress={() => selectRole('driver')}
          disabled={loading}
        >
          <Text style={styles.optionEmoji}>👨‍✈️</Text>
          <Text style={styles.optionTitle}>I'm a driver</Text>
          <Text style={styles.optionDescription}>
            Accept jobs and drive customers' cars home
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
  },
  options: {
    gap: 20,
  },
  option: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  loading: {
    marginTop: 20,
    alignItems: 'center',
  },
});

