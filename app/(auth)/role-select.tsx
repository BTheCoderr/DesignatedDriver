import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function RoleSelectScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const selectRole = async (role: 'user' | 'driver') => {
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'Not authenticated. Please log in again.');
        router.replace('/(auth)/login');
        return;
      }

      const { error } = await supabase.rpc('choose_account_role', {
        p_role: role,
      });

      if (error) {
        console.error('Role selection error:', error);
        Alert.alert('Error', error.message || 'Failed to set up your account.');
        return;
      }

      router.replace(role === 'driver' ? '/(driver)' : '/(user)');
    } catch (err) {
      console.error('Unexpected role selection error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>How will you use Designated Driver?</Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.option, loading && styles.optionDisabled]}
            onPress={() => selectRole('user')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionEmoji}>🚗</Text>
            </View>
            <Text style={styles.optionTitle}>I need a driver</Text>
            <Text style={styles.optionDescription}>
              Request a professional driver to take you and your car home safely
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, loading && styles.optionDisabled]}
            onPress={() => selectRole('driver')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionEmoji}>👨‍✈️</Text>
            </View>
            <Text style={styles.optionTitle}>I'm a driver</Text>
            <Text style={styles.optionDescription}>
              Accept jobs and drive customers' cars home. Earn money on your schedule.
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Setting up your account...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  options: {
    gap: 20,
  },
  option: {
    backgroundColor: '#1a1a1a',
    padding: 28,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  optionEmoji: {
    fontSize: 40,
  },
  optionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  loading: {
    marginTop: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
  },
});
