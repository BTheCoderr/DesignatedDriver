import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';

export default function ArriveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingArrived, setMarkingArrived] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace('/(driver)/');
      return;
    }
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error loading trip:', error);
      router.replace('/(driver)/');
      return;
    }

    setTrip(data);
    setLoading(false);
  };

  const handleMarkArrived = async () => {
    if (!trip) return;

    setMarkingArrived(true);

    const { error } = await supabase
      .from('trips')
      .update({
        status: 'driver_arriving',
        driver_arrived_at: new Date().toISOString(),
      })
      .eq('id', trip.id);

    setMarkingArrived(false);

    if (error) {
      console.error('Error marking arrived:', error);
      return;
    }

    // Navigate to next step
    if (trip.dispatch_mode === 'solo_scoot') {
      router.replace(`/(driver)/trunk-photo?id=${trip.id}`);
    } else {
      router.replace(`/(driver)/drive?id=${trip.id}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(driver)/')}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arrive at Pickup</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>Pickup Location</Text>
          <Text style={styles.locationAddress}>{trip.pickup_address}</Text>
        </View>

        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️</Text>
          <Text style={styles.mapPlaceholderLabel}>Navigation Map</Text>
          <Text style={styles.mapPlaceholderSubtext}>Use your navigation app to reach the pickup location</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Trip Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Destination:</Text>
            <Text style={styles.infoValue}>{trip.destination_address}</Text>
          </View>
          {trip.estimated_distance_miles && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance:</Text>
              <Text style={styles.infoValue}>{trip.estimated_distance_miles.toFixed(1)} miles</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.arriveButton, markingArrived && styles.buttonDisabled]}
          onPress={handleMarkArrived}
          disabled={markingArrived}
        >
          {markingArrived ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.arriveButtonText}>Mark Arrived</Text>
          )}
        </TouchableOpacity>
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
    paddingBottom: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  locationCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  mapPlaceholder: {
    backgroundColor: '#1a1a1a',
    height: 300,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  mapPlaceholderText: {
    fontSize: 64,
    marginBottom: 12,
  },
  mapPlaceholderLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  arriveButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  arriveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
