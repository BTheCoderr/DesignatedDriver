import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AdminHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Designated Driver</Text>
      <Text style={styles.subtitle}>Admin Panel</Text>
      
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/(admin)/gear-verification')}
      >
        <View>
          <Text style={styles.cardTitle}>Gear Verifications</Text>
          <Text style={styles.cardText}>Review pending verifications</Text>
        </View>
        <Text style={styles.cardArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    color: '#888',
    fontSize: 14,
  },
  cardArrow: {
    color: '#007AFF',
    fontSize: 24,
    fontWeight: '300',
  },
  logoutButton: {
    marginTop: 40,
    padding: 12,
  },
  logoutButtonText: {
    color: '#888',
    fontSize: 14,
  },
});

