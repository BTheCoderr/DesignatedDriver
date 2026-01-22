import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';
import { bindInsurancePolicy, endInsurancePolicy } from '@/lib/insurance';
import MapView from '@/components/MapView';

export default function DriveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace('/(driver)/');
      return;
    }
    loadTrip();
    const subscription = supabase
      .channel(`trip:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setTrip(payload.new as Trip);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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

  const handleStartTrip = async () => {
    if (!trip) return;

    // ENFORCEMENT: Trunk photo required for scooter mode
    if (trip.dispatch_mode === 'solo_scoot') {
      // Check if trunk log exists with before_photo_url
      const { data: trunkLog } = await supabase
        .from('trunk_logs')
        .select('before_photo_url, device_secured')
        .eq('trip_id', trip.id)
        .single();

      if (!trunkLog || !trunkLog.before_photo_url || !trunkLog.device_secured) {
        Alert.alert(
          'Trunk Photo Required',
          'You must take a trunk photo and confirm device is secured before starting a Solo-Scoot trip.',
          [
            {
              text: 'Take Photo',
              onPress: () => router.replace(`/(driver)/trunk-photo?id=${trip.id}`),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Verify trip status is trunk_verified
      if (trip.status !== 'trunk_verified') {
        Alert.alert(
          'Trunk Not Verified',
          'Please complete trunk verification before starting the trip.',
          [
            {
              text: 'Verify Trunk',
              onPress: () => router.replace(`/(driver)/trunk-photo?id=${trip.id}`),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }
    }

    setStarting(true);

    try {
      // Bind insurance policy (insurance switch event - per video script)
      const insuranceResult = await bindInsurancePolicy(trip.id);

      // Update insurance session
      const { error: insuranceError } = await supabase
        .from('insurance_sessions')
        .update({
          policy_status: 'bound',
          policy_bound_at: new Date().toISOString(),
          policy_id: insuranceResult.policyId || null,
        })
        .eq('trip_id', trip.id);

      if (insuranceError) {
        console.error('Insurance update error:', insuranceError);
      }

      // Update trip status
      const { error: tripError } = await supabase
        .from('trips')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', trip.id);

      if (tripError) throw tripError;

      // Show confirmation that insurance is bound
      Alert.alert(
        'Insurance Coverage Active ✅',
        'Your insurance policy has been bound. Coverage is now active for this trip.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error starting trip:', error);
      Alert.alert('Error', error.message || 'Failed to start trip');
    } finally {
      setStarting(false);
    }
  };

  const handleEndTrip = async () => {
    if (!trip) return;

    Alert.alert(
      'End Trip',
      'Are you sure you have arrived at the destination?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            setEnding(true);

            try {
              // End insurance policy
              await endInsurancePolicy(trip.id);

              // Update insurance session
              const { error: insuranceError } = await supabase
                .from('insurance_sessions')
                .update({
                  policy_status: 'ended',
                  policy_ended_at: new Date().toISOString(),
                })
                .eq('trip_id', trip.id);

              if (insuranceError) {
                console.error('Insurance update error:', insuranceError);
              }

              // Update trip status
              const { error: tripError } = await supabase
                .from('trips')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                })
                .eq('id', trip.id);

              if (tripError) throw tripError;

              router.replace(`/(driver)/end-trip?id=${trip.id}`);
            } catch (error: any) {
              console.error('Error ending trip:', error);
              Alert.alert('Error', error.message || 'Failed to end trip');
            } finally {
              setEnding(false);
            }
          },
        },
      ]
    );
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

  const isInProgress = trip.status === 'in_progress';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Trip</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={[styles.statusIndicator, { backgroundColor: isInProgress ? '#4CAF50' : '#FFA500' }]} />
          <Text style={styles.statusText}>
            {isInProgress ? 'Trip in Progress' : 'Ready to Start'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From:</Text>
            <Text style={styles.infoValue}>{trip.pickup_address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To:</Text>
            <Text style={styles.infoValue}>{trip.destination_address}</Text>
          </View>
          {trip.estimated_distance_miles && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance:</Text>
              <Text style={styles.infoValue}>{trip.estimated_distance_miles.toFixed(1)} miles</Text>
            </View>
          )}
        </View>

        {trip.pickup_latitude && trip.pickup_longitude && (
          <MapView
            latitude={trip.pickup_latitude}
            longitude={trip.pickup_longitude}
            destinationLat={trip.destination_latitude || undefined}
            destinationLng={trip.destination_longitude || undefined}
            showRoute={isInProgress}
            height={300}
            style={styles.mapContainer}
          />
        )}

        {!isInProgress && (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>
              Once you're ready to begin driving, tap "Start Trip" to trigger the insurance session and begin coverage.
            </Text>
            <Text style={styles.instructionSubtext}>
              The moment you hit "Start Trip," insurance coverage is bound for this trip.
            </Text>
          </View>
        )}
        
        {isInProgress && (
          <View style={styles.insuranceCard}>
            <Text style={styles.insuranceTitle}>🛡️ Insurance Coverage Active</Text>
            <Text style={styles.insuranceText}>
              Policy bound at: {trip.started_at ? new Date(trip.started_at).toLocaleTimeString() : 'N/A'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!isInProgress ? (
          <TouchableOpacity
            style={[styles.startButton, starting && styles.buttonDisabled]}
            onPress={handleStartTrip}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startButtonText}>Start Trip</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.endButton, ending && styles.buttonDisabled]}
            onPress={handleEndTrip}
            disabled={ending}
          >
            {ending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.endButtonText}>End Trip</Text>
            )}
          </TouchableOpacity>
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
  statusCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  mapContainer: {
    marginBottom: 16,
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
  instructionCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insuranceCard: {
    backgroundColor: '#1a3a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginTop: 8,
  },
  insuranceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  insuranceText: {
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  endButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
