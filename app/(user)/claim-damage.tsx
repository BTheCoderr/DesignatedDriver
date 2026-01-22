import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function ClaimDamageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [damageLocation, setDamageLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace('/(user)/');
      return;
    }
    loadTrip();
    requestPermissions();
  }, [id]);

  const loadTrip = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error loading trip:', error);
      router.replace('/(user)/');
      return;
    }

    setTrip(data);

    // Load vehicle inspection photos (before/after) if they exist
    const { data: inspections } = await supabase
      .from('vehicle_inspections')
      .select('inspection_type, photo_urls')
      .eq('trip_id', id)
      .order('created_at', { ascending: true });

    if (inspections) {
      const before = inspections.find(i => i.inspection_type === 'before');
      const after = inspections.find(i => i.inspection_type === 'after');
      setBeforePhotos(before?.photo_urls || []);
      setAfterPhotos(after?.photo_urls || []);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
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

    const filename = `claim-${trip.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: filename,
    });

    const { data, error } = await supabase.storage
      .from('damage-claims')
      .upload(`${user.id}/${filename}`, formData as any, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('damage-claims')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'Please upload at least one photo of the damage');
      return;
    }

    if (!damageLocation.trim()) {
      Alert.alert('Error', 'Please specify the damage location');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the damage');
      return;
    }

    if (!trip) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload all photos
      const photoUrls = await Promise.all(photos.map(uri => uploadPhoto(uri)));

      // Create claim with timestamp
      const claimTimestamp = new Date().toISOString();
      const { error } = await supabase
        .from('claims')
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          status: 'submitted',
          photo_urls: photoUrls,
          damage_location: damageLocation,
          description,
          // Timestamp is automatically set by created_at, but we log it
        });

      if (error) throw error;

      Alert.alert(
        'Claim Submitted ✅',
        `Your damage claim has been submitted with ${photoUrls.length} photo(s) at ${new Date(claimTimestamp).toLocaleString()}. Our team will review it shortly.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(user)/'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      Alert.alert('Error', error.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Report Damage</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Report Damage</Text>
          <Text style={styles.headerSubtitle}>
            Built-in damage claim flow with photos and timestamps
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Trip Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From:</Text>
            <Text style={styles.infoValue}>{trip.pickup_address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To:</Text>
            <Text style={styles.infoValue}>{trip.destination_address}</Text>
          </View>
          {trip.started_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trip Started:</Text>
              <Text style={styles.infoValue}>
                {new Date(trip.started_at).toLocaleString()}
              </Text>
            </View>
          )}
          {trip.completed_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trip Completed:</Text>
              <Text style={styles.infoValue}>
                {new Date(trip.completed_at).toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.timestampNote}>
            <Text style={styles.timestampNoteText}>
              📸 Claim will be timestamped automatically when submitted
            </Text>
          </View>
        </View>

        {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
          <View style={styles.inspectionCard}>
            <Text style={styles.inspectionTitle}>Vehicle Inspection Photos</Text>
            <Text style={styles.inspectionSubtitle}>
              These photos were taken by the driver to document vehicle condition
            </Text>
            
            {beforePhotos.length > 0 && (
              <View style={styles.inspectionSection}>
                <Text style={styles.inspectionLabel}>Before Trip ({beforePhotos.length} photos)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.inspectionPhotos}>
                  {beforePhotos.map((url, index) => (
                    <Image key={index} source={{ uri: url }} style={styles.inspectionPhoto} />
                  ))}
                </ScrollView>
              </View>
            )}

            {afterPhotos.length > 0 && (
              <View style={styles.inspectionSection}>
                <Text style={styles.inspectionLabel}>After Trip ({afterPhotos.length} photos)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.inspectionPhotos}>
                  {afterPhotos.map((url, index) => (
                    <Image key={index} source={{ uri: url }} style={styles.inspectionPhoto} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Damage Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Front bumper, driver side door"
            placeholderTextColor="#666"
            value={damageLocation}
            onChangeText={setDamageLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the damage in detail..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (photos.length === 0 || !damageLocation.trim() || !description.trim() || submitting) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={photos.length === 0 || !damageLocation.trim() || !description.trim() || submitting}
        >
          {submitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Submit Claim</Text>
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
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  headerCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
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
    marginBottom: 12,
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
  timestampNote: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  timestampNoteText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  inspectionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  inspectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  inspectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 16,
  },
  inspectionSection: {
    marginBottom: 16,
  },
  inspectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  inspectionPhotos: {
    marginBottom: 8,
  },
  inspectionPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
  buttonContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  submitButton: {
    backgroundColor: '#ff4444',
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
