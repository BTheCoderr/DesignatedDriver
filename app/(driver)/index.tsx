import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, type Trip, type DriverGear } from '@/lib/supabase';

export default function DriverHome() {
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [gearStatus, setGearStatus] = useState<DriverGear | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
    const subscription = supabase
      .channel('driver-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load gear status
    const { data: gear } = await supabase
      .from('driver_gear')
      .select('*')
      .eq('driver_id', user.id)
      .single();

    setGearStatus(gear);

    // Load active trip
    const { data: active } = await supabase
      .from('trips')
      .select('*')
      .or(`primary_driver_id.eq.${user.id},chase_driver_id.eq.${user.id}`)
      .in('status', ['dispatched', 'driver_arriving', 'trunk_verified', 'in_progress'])
      .single();

    if (active) {
      setActiveTrip(active);
      // Navigate to appropriate screen based on status
      if (active.status === 'dispatched') {
        router.replace(`/(driver)/arrive?id=${active.id}`);
      } else if (active.status === 'driver_arriving' || active.status === 'trunk_verified') {
        if (active.dispatch_mode === 'solo_scoot' && active.status === 'driver_arriving') {
          router.replace(`/(driver)/trunk-photo?id=${active.id}`);
        } else {
          router.replace(`/(driver)/drive?id=${active.id}`);
        }
      } else if (active.status === 'in_progress') {
        router.replace(`/(driver)/drive?id=${active.id}`);
      }
      return;
    }

    // Load available trips (requested status, matching gear)
    const { data: trips } = await supabase
      .from('trips')
      .select('*')
      .eq('status', 'requested')
      .order('requested_at', { ascending: true });

    // Filter by gear availability
    const filtered = trips?.filter((trip) => {
      if (trip.dispatch_mode === 'solo_scoot') {
        return gear?.verification_status === 'verified';
      }
      return true; // Chase Car doesn't require gear
    }) || [];

    setAvailableTrips(filtered);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Designated Driver</Text>
          <Text style={styles.subtitle}>Driver Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Gear Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gear Status</Text>
          {gearStatus ? (
            <View style={styles.gearStatus}>
              <Text style={styles.gearType}>
                {gearStatus.gear_type === 'folding_scooter' ? '🛴' : '🚴'} {gearStatus.gear_type.replace('_', ' ')}
              </Text>
              <View style={[
                styles.statusBadge,
                gearStatus.verification_status === 'verified' && styles.statusBadgeVerified,
                gearStatus.verification_status === 'pending' && styles.statusBadgePending,
                gearStatus.verification_status === 'rejected' && styles.statusBadgeRejected,
              ]}>
                <Text style={styles.statusText}>
                  {gearStatus.verification_status === 'verified' ? '✓ Verified' :
                   gearStatus.verification_status === 'pending' ? '⏳ Pending' :
                   gearStatus.verification_status === 'rejected' ? '✗ Rejected' : 'None'}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addGearButton}
              onPress={() => router.push('/(driver)/gear-upload')}
            >
              <Text style={styles.addGearText}>+ Add Gear for Solo-Scoot</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Trip */}
        {activeTrip && (
          <TouchableOpacity
            style={styles.activeTripCard}
            onPress={() => {
              if (activeTrip.status === 'dispatched') {
                router.push(`/(driver)/arrive?id=${activeTrip.id}`);
              } else if (activeTrip.status === 'in_progress') {
                router.push(`/(driver)/drive?id=${activeTrip.id}`);
              }
            }}
          >
            <Text style={styles.activeTripTitle}>Active Trip</Text>
            <Text style={styles.activeTripText}>
              {activeTrip.pickup_address} → {activeTrip.destination_address}
            </Text>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusDot,
                activeTrip.status === 'dispatched' && styles.statusDotEnRoute,
                activeTrip.status === 'driver_arriving' && styles.statusDotArriving,
                activeTrip.status === 'in_progress' && styles.statusDotDriving,
              ]} />
              <Text style={styles.activeTripStatus}>
                {activeTrip.status === 'dispatched' ? 'En Route' :
                 activeTrip.status === 'driver_arriving' ? 'Arriving' :
                 activeTrip.status === 'trunk_verified' ? 'Verified' :
                 activeTrip.status === 'in_progress' ? 'Driving' :
                 activeTrip.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Available Jobs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Jobs ({availableTrips.length})</Text>
          {availableTrips.length === 0 ? (
            <Text style={styles.emptyText}>No jobs available</Text>
          ) : (
            <View style={styles.jobsList}>
              {availableTrips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.jobCard}
                  onPress={() => router.push(`/(driver)/accept-job?id=${trip.id}`)}
                >
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobMode}>
                      {trip.dispatch_mode === 'solo_scoot' ? '🛴 Solo-Scoot' : '🚗 Chase Car'}
                    </Text>
                    {trip.total_price && (
                      <Text style={styles.jobPrice}>${trip.total_price.toFixed(2)}</Text>
                    )}
                  </View>
                  <Text style={styles.jobRoute}>
                    {trip.pickup_address} → {trip.destination_address}
                  </Text>
                  {trip.estimated_distance_miles && (
                    <Text style={styles.jobDistance}>
                      {trip.estimated_distance_miles.toFixed(1)} miles
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  logoutText: {
    color: '#888',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  gearStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gearType: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  statusBadgeVerified: {
    backgroundColor: '#4CAF50',
  },
  statusBadgePending: {
    backgroundColor: '#FFA500',
  },
  statusBadgeRejected: {
    backgroundColor: '#ff4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addGearButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addGearText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTripCard: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  activeTripTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  activeTripText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
    opacity: 0.9,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginRight: 8,
  },
  statusDotEnRoute: {
    backgroundColor: '#FFA500',
  },
  statusDotArriving: {
    backgroundColor: '#4CAF50',
  },
  statusDotDriving: {
    backgroundColor: '#007AFF',
  },
  activeTripStatus: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#0a0a0a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobMode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  jobPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  jobRoute: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  jobDistance: {
    fontSize: 12,
    color: '#666',
  },
});
