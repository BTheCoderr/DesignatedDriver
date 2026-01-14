import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, type DriverGear, type Profile } from '@/lib/supabase';

export default function GearVerificationScreen() {
  const [pendingGear, setPendingGear] = useState<(DriverGear & { profile?: Profile })[]>([]);
  const [selectedGear, setSelectedGear] = useState<(DriverGear & { profile?: Profile }) | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPendingGear();
  }, []);

  const loadPendingGear = async () => {
    const { data, error } = await supabase
      .from('driver_gear')
      .select('*, profile:driver_id(*)')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading pending gear:', error);
      return;
    }

    setPendingGear(data || []);
  };

  const handleApprove = async () => {
    if (!selectedGear) return;

    setProcessing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProcessing(false);
      return;
    }

    const { error } = await supabase
      .from('driver_gear')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        admin_notes: adminNotes || null,
      })
      .eq('id', selectedGear.id);

    setProcessing(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', 'Gear verified successfully!');
    setSelectedGear(null);
    setAdminNotes('');
    loadPendingGear();
  };

  const handleReject = async () => {
    if (!selectedGear) return;

    if (!adminNotes.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    setProcessing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProcessing(false);
      return;
    }

    const { error } = await supabase
      .from('driver_gear')
      .update({
        verification_status: 'rejected',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        admin_notes: adminNotes,
      })
      .eq('id', selectedGear.id);

    setProcessing(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', 'Gear rejected');
    setSelectedGear(null);
    setAdminNotes('');
    loadPendingGear();
  };

  if (selectedGear) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedGear(null)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Gear</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Driver</Text>
            <Text style={styles.infoValue}>
              {selectedGear.profile?.full_name || selectedGear.profile?.email || 'Unknown'}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Gear Type</Text>
            <Text style={styles.infoValue}>
              {selectedGear.gear_type === 'folding_scooter' ? '🛴 Folding Scooter' :
               selectedGear.gear_type === 'folding_bike' ? '🚴 Folding Bike' : '📦 Other'}
            </Text>
          </View>

          {selectedGear.device_model && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Device Model</Text>
              <Text style={styles.infoValue}>{selectedGear.device_model}</Text>
            </View>
          )}

          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos ({selectedGear.photo_urls?.length || 0})</Text>
            {selectedGear.photo_urls && selectedGear.photo_urls.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                {selectedGear.photo_urls.map((url, index) => (
                  <Image key={index} source={{ uri: url }} style={styles.photo} />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noPhotosText}>No photos available</Text>
            )}
          </View>

          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Admin Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about this verification..."
              placeholderTextColor="#666"
              value={adminNotes}
              onChangeText={setAdminNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.rejectButton, processing && styles.buttonDisabled]}
            onPress={handleReject}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.rejectButtonText}>Reject</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.approveButton, processing && styles.buttonDisabled]}
            onPress={handleApprove}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.approveButtonText}>Approve</Text>
            )}
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
        <Text style={styles.headerTitle}>Gear Verification</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {pendingGear.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✓</Text>
            <Text style={styles.emptyText}>No pending verifications</Text>
            <Text style={styles.emptySubtext}>All gear has been reviewed</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {pendingGear.map((gear) => (
              <TouchableOpacity
                key={gear.id}
                style={styles.gearCard}
                onPress={() => setSelectedGear(gear)}
              >
                <View style={styles.gearCardHeader}>
                  <Text style={styles.gearType}>
                    {gear.gear_type === 'folding_scooter' ? '🛴' :
                     gear.gear_type === 'folding_bike' ? '🚴' : '📦'} {gear.gear_type.replace('_', ' ')}
                  </Text>
                  <Text style={styles.pendingBadge}>Pending</Text>
                </View>
                <Text style={styles.driverName}>
                  {gear.profile?.full_name || gear.profile?.email || 'Unknown Driver'}
                </Text>
                {gear.device_model && (
                  <Text style={styles.deviceModel}>{gear.device_model}</Text>
                )}
                <Text style={styles.photoCount}>
                  {gear.photo_urls?.length || 0} photo{gear.photo_urls?.length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  list: {
    gap: 12,
  },
  gearCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  gearCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gearType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  pendingBadge: {
    backgroundColor: '#FFA500',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  driverName: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  deviceModel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  photoCount: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  photosSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  photosScroll: {
    marginBottom: 12,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  noPhotosText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#ff4444',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
