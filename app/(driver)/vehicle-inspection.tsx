import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

type InspectionType = 'before' | 'after';

export default function VehicleInspectionScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [driverAttestation, setDriverAttestation] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const inspectionType = (type || 'before') as InspectionType;
  const isBefore = inspectionType === 'before';

  useEffect(() => {
    if (!id) {
      router.replace('/(driver)/');
      return;
    }
    loadTrip();
    requestCameraPermission();
    loadExistingInspection();
  }, [id, inspectionType]);

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
  };

  const loadExistingInspection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('vehicle_inspections')
      .select('photo_urls, notes, driver_attestation')
      .eq('trip_id', id)
      .eq('inspection_type', inspectionType)
      .single();

    if (data) {
      setPhotos(data.photo_urls || []);
      setNotes(data.notes || '');
      setDriverAttestation(data.driver_attestation || false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take vehicle photos');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error('Error picking photos:', error);
      Alert.alert('Error', 'Failed to pick photos');
    }
  };

  const uploadPhoto = async (uri: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !trip) throw new Error('Not authenticated');

    const filename = `vehicle-${inspectionType}-${trip.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: filename,
    });

    const { data, error } = await supabase.storage
      .from('vehicle-inspections')
      .upload(`${user.id}/${filename}`, formData as any, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-inspections')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', `Please take at least one photo of the vehicle${isBefore ? ' condition' : ''}`);
      return;
    }

    if (!driverAttestation) {
      Alert.alert('Error', 'Please confirm that the photos accurately represent the vehicle condition');
      return;
    }

    if (!trip) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload all photos
      const photoUrls = await Promise.all(photos.map(uri => uploadPhoto(uri)));

      // Create or update inspection
      const { error: inspectionError } = await supabase
        .from('vehicle_inspections')
        .upsert({
          trip_id: trip.id,
          driver_id: user.id,
          inspection_type: inspectionType,
          photo_urls: photoUrls,
          notes: notes.trim() || null,
          driver_attestation: true,
        }, {
          onConflict: 'trip_id,inspection_type',
        });

      if (inspectionError) throw inspectionError;

      // Navigate based on inspection type
      if (isBefore) {
        // After before photos, go to drive screen
        router.replace(`/(driver)/drive?id=${trip.id}`);
      } else {
        // After after photos, complete the trip
        router.replace(`/(driver)/end-trip?id=${trip.id}`);
      }
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      Alert.alert('Error', error.message || 'Failed to submit inspection');
    } finally {
      setUploading(false);
    }
  };

  if (!trip) {
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBefore ? 'Vehicle Inspection (Before)' : 'Vehicle Inspection (After)'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>
            {isBefore 
              ? '📸 Document Vehicle Condition (Before Trip)'
              : '📸 Document Vehicle Condition (After Trip)'}
          </Text>
          <Text style={styles.instructionText}>
            {isBefore
              ? 'Take photos of the customer\'s vehicle from multiple angles to document its condition before the trip. This protects both you and the customer from false damage claims.'
              : 'Take photos of the vehicle from the same angles to show no new damage was added during the trip.'}
          </Text>
          <Text style={styles.instructionSubtext}>
            Recommended: Front, back, both sides, and any existing damage close-ups
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
          {photos.length > 0 && (
            <View style={styles.photosGrid}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Text style={styles.photoButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
              <Text style={styles.photoButtonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, driverAttestation && styles.checkboxChecked]}
            onPress={() => setDriverAttestation(!driverAttestation)}
          >
            {driverAttestation && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I confirm these photos accurately represent the vehicle's condition
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (photos.length === 0 || !driverAttestation || uploading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={photos.length === 0 || !driverAttestation || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isBefore ? 'Submit & Start Trip' : 'Submit & Complete Trip'}
            </Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
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
  instructionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    lineHeight: 20,
  },
  instructionSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  buttonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
