import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function UserHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Designated Driver</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.rescueButton}
          activeOpacity={0.9}
          onPress={() => router.push('/(user)/request-rescue')}
        >
          <View style={styles.rescueButtonInner}>
            <Text style={styles.rescueEmoji}>🚗</Text>
            <View style={styles.rescueTextContainer}>
              <Text style={styles.rescueButtonText}>RESCUE</Text>
              <Text style={styles.rescueButtonSubtext}>One-tap to get home</Text>
            </View>
            <Text style={styles.rescueArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(user)/vehicles')}
          >
            <Text style={styles.actionEmoji}>🚗</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Vehicles</Text>
              <Text style={styles.actionSubtext}>Add or edit your vehicles</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Trips</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No trips yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap RESCUE to request a driver</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  rescueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  rescueButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 32,
  },
  rescueEmoji: {
    fontSize: 48,
    marginRight: 20,
  },
  rescueTextContainer: {
    flex: 1,
  },
  rescueButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 2,
  },
  rescueButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  rescueArrow: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 14,
    color: '#888',
  },
  actionArrow: {
    color: '#888',
    fontSize: 20,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
  },
});
