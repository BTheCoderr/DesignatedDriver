import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';

export default function AcceptJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.back();
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
      router.back();
      return;
    }

    setTrip(data);
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!trip) return;

    setAccepting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAccepting(false);
      return;
    }

    // Update trip with driver assignment
    const updateData: any = {
      status: 'dispatched',
      dispatched_at: new Date().toISOString(),
    };

    if (trip.dispatch_mode === 'solo_scoot') {
      updateData.primary_driver_id = user.id;
    } else {
      // For Chase Car, assign as primary or chase based on availability
      if (!trip.primary_driver_id) {
        updateData.primary_driver_id = user.id;
      } else if (!trip.chase_driver_id) {
        updateData.chase_driver_id = user.id;
      }
    }

    const { error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', trip.id);

    setAccepting(false);

    if (error) {
      console.error('Error accepting job:', error);
      return;
    }

    router.replace(`/(driver)/arrive?id=${trip.id}`);
  };

  const handleDecline = () => {
    router.back();
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.modeCard}>
          <Text style={styles.modeEmoji}>
            {trip.dispatch_mode === 'solo_scoot' ? '🛴' : '🚗'}
          </Text>
          <Text style={styles.modeText}>
            {trip.dispatch_mode === 'solo_scoot' ? 'Solo-Scoot' : 'Chase Car'}
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
          {trip.estimated_duration_minutes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Est. Duration:</Text>
              <Text style={styles.infoValue}>{trip.estimated_duration_minutes} minutes</Text>
            </View>
          )}
        </View>

        {trip.total_price && (
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Earnings</Text>
            <Text style={styles.priceAmount}>${trip.total_price.toFixed(2)}</Text>
            <View style={styles.priceBreakdown}>
              <Text style={styles.priceRow}>
                Base: ${trip.base_fee?.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.priceRow}>
                Mileage: ${trip.mileage_fee?.toFixed(2) || '0.00'}
              </Text>
              {trip.surge_multiplier && trip.surge_multiplier > 1 && (
                <Text style={styles.priceRow}>
                  Surge: {trip.surge_multiplier}x
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️</Text>
          <Text style={styles.mapPlaceholderLabel}>Route Map</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={handleDecline}
          disabled={accepting}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.acceptButton, accepting && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={accepting}
        >
          {accepting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>Accept Job</Text>
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
  scrollView: {
    flex: 1,
    padding: 24,
  },
  modeCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  modeEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  modeText: {
    fontSize: 20,
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
  priceCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  priceLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 12,
  },
  priceBreakdown: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  priceRow: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  mapPlaceholder: {
    backgroundColor: '#1a1a1a',
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  mapPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapPlaceholderLabel: {
    fontSize: 16,
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
