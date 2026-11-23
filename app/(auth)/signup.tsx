import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { logSignup } from '@/lib/analytics';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; success: boolean } | null>(null);
  const showNotice = (message: string, success = false) => {
    setNotice({ message, success });
    if (Platform.OS !== 'web') Alert.alert(success ? 'Account update' : 'Signup error', message);
  };
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !fullName || !phone) {
      showNotice('Please fill in all fields');
      return;
    }

    setNotice(null);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            phone,
            full_name: fullName,
          },
        },
      });

      if (error) {
        setLoading(false);
        console.error('Signup error:', error);
        
        // Check for rate limiting
        if (error.message?.includes('429') || error.message?.includes('security purposes') || error.message?.includes('only request this after')) {
          const waitTime = error.message.match(/(\d+)\s+seconds?/)?.[1] || '60';
          showNotice(`Too many requests. Please wait ${waitTime} seconds before trying again.`);
          return;
        }
        
        // Check for API key error
        if (error.message?.includes('Invalid API key') || error.message?.includes('401')) {
          showNotice('The preview cannot connect to authentication. Please contact support.');
          return;
        }
        
        showNotice(error.message || 'Failed to create account. Please try again.');
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setLoading(false);
        showNotice('Check your email for the confirmation link. After verifying, return here and sign in.', true);
        return;
      }

      // Email confirmation not required - create profile immediately
      if (data.user && data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email.trim(),
            phone,
            full_name: fullName,
            role: 'user',
          }, { onConflict: 'id', ignoreDuplicates: true });

        if (profileError) {
          setLoading(false);
          console.error('Profile creation error:', profileError);
          showNotice(`Account created, but your profile could not be loaded: ${profileError.message}`);
          return;
        }

        setLoading(false);
        // Log signup event
        try { await logSignup(data.user.id); } catch (analyticsError) { console.warn('Signup analytics unavailable'); }
        // The account is already a customer; continue to services.
        router.replace('/(user)/services');
      } else {
        setLoading(false);
        showNotice('Account creation failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Unexpected signup error:', err);
      showNotice('Unable to reach the signup service. Check your connection and try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Designated Driver and get home safely</Text>
        </View>

        <View style={styles.form}>
          {notice && <View accessibilityRole="alert" style={[styles.notice, notice.success && styles.successNotice]}><Text style={styles.noticeText}>{notice.message}</Text></View>}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="(555) 123-4567"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  notice: { backgroundColor: '#632222', padding: 14, borderRadius: 10, marginBottom: 20 },
  successNotice: { backgroundColor: '#164e3c' },
  noticeText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 18,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#888',
    fontSize: 15,
  },
  linkTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
