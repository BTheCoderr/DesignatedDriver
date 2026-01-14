import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase, type Trip } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function TrunkPhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [deviceSecured, setDeviceSecured] = useState(false);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace('/(driver)/');
      return;
    }
    loadTrip();
    requestCameraPermission();
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
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take trunk photos');
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
        setPhoto(result.assets[0].uri);
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
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const uploadPhoto = async (uri: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !trip) throw new Error('Not authenticated');

    const filename = `trunk-${trip.id}-${Date.now()}.jpg`;
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: filename,
    });

    const { data, error } = await supabase.storage
      .from('trunk-photos')
      .upload(`${user.id}/${filename}`, formData as any, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('trunk-photos')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please take a photo of the device in the trunk');
      return;
    }

    if (!deviceSecured) {
      Alert.alert('Error', 'Please confirm that the device is secured');
      return;
    }

    if (!trip) return;

    setUploading(true);

    try {
      // Upload photo
      const photoUrl = await uploadPhoto(photo);

      // Create trunk log
      const { error: logError } = await supabase
        .from('trunk_logs')
        .insert({
          trip_id: trip.id,
          before_photo_url: photoUrl,
          device_secured: true,
          notes: notes || null,
        });

      if (logError) throw logError;

      // Update trip status
      const { error: tripError } = await supabase
        .from('trips')
        .update({
          status: 'trunk_verified',
        })
        .eq('id', trip.id);

      if (tripError) throw tripError;

      router.replace(`/(driver)/drive?id=${trip.id}`);
    } catch (error: any) {
      console.error('Error submitting trunk photo:', error);
      Alert.alert('Error', error.message || 'Failed to submit trunk photo');
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
        <Text style={styles.headerTitle}>Trunk Photo</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Take a photo of your device in the trunk</Text>
          <Text style={styles.instructionText}>
            Make sure the device is clearly visible and secured in the trunk before taking the photo.
          </Text>
        </View>

        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>📷</Text>
            <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} onPress={pickPhoto}>
              <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, deviceSecured && styles.checkboxChecked]}
            onPress={() => setDeviceSecured(!deviceSecured)}
          >
            {deviceSecured && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I confirm that the device is properly secured in the trunk
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (!photo || !deviceSecured || uploading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!photo || !deviceSecured || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit & Continue</Text>
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
  content: {
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
  },
  photoContainer: {
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 12,
  },
  retakeButton: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  photoPlaceholder: {
    backgroundColor: '#1a1a1a',
    height: 300,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  photoPlaceholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  galleryButtonText: {
    color: '#fff',
    fontSize: 16,
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
