import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';
import MapView from '@/components/MapView';

export default function TripTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace('/(user)/');
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

    if (error) {
      console.error('Error loading trip:', error);
      setLoading(false);
      return;
    }

    setTrip(data);
    setLoading(false);

    // Navigate to complete screen if trip is completed
    if (data.status === 'completed') {
      router.replace(`/(user)/trip-complete?id=${id}`);
    }
  };

  const handleCancel = async () => {
    if (!trip || trip.status !== 'requested') return;

    const { error } = await supabase
      .from('trips')
      .update({ status: 'cancelled' })
      .eq('id', trip.id);

    if (error) {
      console.error('Error cancelling trip:', error);
      return;
    }

    router.replace('/(user)/');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Trip not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(user)/')}>
            <Text style={styles.backButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusText = () => {
    switch (trip.status) {
      case 'requested':
        return 'Driver assigned, arriving soon...';
      case 'driver_arrived':
        return 'Driver has arrived';
      case 'in_progress':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      case 'cancelled':
        return 'Trip cancelled';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (trip.status) {
      case 'requested':
        return '#FFA500';
      case 'driver_arrived':
        return '#4CAF50';
      case 'in_progress':
        return '#007AFF';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#ff4444';
      default:
        return '#888';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Tracking</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <View style={styles.statusContent}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <Text style={styles.statusSubtext}>
              {trip.dispatch_mode === 'solo_scoot' ? '🚴 Solo-Scoot' : '🚗 Chase Car'}
            </Text>
          </View>
        </View>

        {/* Trip Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From:</Text>
            <Text style={styles.infoValue}>{trip.pickup_address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To:</Text>
            <Text style={styles.infoValue}>{trip.destination_address}</Text>
          </View>
          {trip.estimated_duration_minutes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ETA:</Text>
              <Text style={styles.infoValue}>{trip.estimated_duration_minutes} minutes</Text>
            </View>
          )}
        </View>

        {/* Price Info */}
        {trip.total_price && (
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Total Price</Text>
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

        {/* Map View */}
        {trip.pickup_latitude && trip.pickup_longitude && (
          <MapView
            latitude={trip.pickup_latitude}
            longitude={trip.pickup_longitude}
            destinationLat={trip.destination_latitude || undefined}
            destinationLng={trip.destination_longitude || undefined}
            showRoute={trip.status === 'in_progress' || trip.status === 'trunk_verified'}
            height={300}
            style={styles.mapContainer}
          />
        )}

        {/* Actions */}
        {trip.status === 'requested' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel Trip</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  loadingText: {
    color: '#888',
    marginTop: 16,
    fontSize: 16,
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
  scrollView: {
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
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#888',
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
  mapContainer: {
    marginBottom: 24,
  },
  mapPlaceholder: {
    backgroundColor: '#1a1a1a',
    height: 300,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
