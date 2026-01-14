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
        setLoading(false);
        console.error('Auth error:', userError);
        Alert.alert('Error', 'Not authenticated. Please try logging in again.');
        router.replace('/(auth)/login');
        return;
      }

      console.log('Setting role for user:', user.id, 'to:', role);

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      let error;

      if (existingProfile) {
        // Profile exists, update it
        console.log('Profile exists, updating role...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', user.id);
        error = updateError;
      } else {
        // Profile doesn't exist, create it
        console.log('Profile does not exist, creating new profile...');
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const userMetadata = currentUser?.user_metadata || {};
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            phone: userMetadata.phone || '',
            full_name: userMetadata.full_name || userMetadata.full_name || 'User',
            role,
          });
        error = insertError;
      }

      setLoading(false);

      if (error) {
        console.error('Profile error:', error);
        Alert.alert(
          'Error', 
          `Failed to set role: ${error.message}. Please try again or contact support.`
        );
        return;
      }

      console.log('Role set successfully, redirecting...');

      // Small delay to ensure state is updated
      setTimeout(() => {
        if (role === 'driver') {
          router.replace('/(driver)');
        } else {
          router.replace('/(user)');
        }
      }, 100);
    } catch (err) {
      setLoading(false);
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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
