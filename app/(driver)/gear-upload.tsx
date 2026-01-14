import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function GearUploadScreen() {
  const [gearType, setGearType] = useState<'folding_scooter' | 'folding_bike' | 'other' | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [deviceModel, setDeviceModel] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

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
    if (!user) throw new Error('Not authenticated');

    const filename = `gear-${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const formData = new FormData();
    
    // @ts-ignore
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: filename,
    });

    const { data, error } = await supabase.storage
      .from('driver-gear-photos')
      .upload(`${user.id}/${filename}`, formData as any, {
        contentType: 'image/jpeg',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('driver-gear-photos')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!gearType) {
      Alert.alert('Error', 'Please select a gear type');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Error', 'Please upload at least one photo');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload all photos
      const photoUrls = await Promise.all(photos.map(uri => uploadPhoto(uri)));

      // Create or update driver gear record
      const { error } = await supabase
        .from('driver_gear')
        .upsert({
          driver_id: user.id,
          gear_type: gearType,
          device_model: deviceModel || null,
          photo_urls: photoUrls,
          verification_status: 'pending',
        }, {
          onConflict: 'driver_id',
        });

      if (error) throw error;

      Alert.alert('Success', 'Gear submitted for verification!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(driver)/'),
        },
      ]);
    } catch (error: any) {
      console.error('Error submitting gear:', error);
      Alert.alert('Error', error.message || 'Failed to submit gear');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Gear</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            Upload photos of your folding device for Solo-Scoot verification
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gear Type</Text>
          <View style={styles.gearOptions}>
            {(['folding_scooter', 'folding_bike', 'other'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.gearOption,
                  gearType === type && styles.gearOptionSelected,
                ]}
                onPress={() => setGearType(type)}
              >
                <Text style={[
                  styles.gearOptionText,
                  gearType === type && styles.gearOptionTextSelected,
                ]}>
                  {type === 'folding_scooter' ? '🛴 Folding Scooter' :
                   type === 'folding_bike' ? '🚴 Folding Bike' : '📦 Other'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Model (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Xiaomi Mi Electric Scooter"
            placeholderTextColor="#666"
            value={deviceModel}
            onChangeText={setDeviceModel}
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
          style={[styles.submitButton, (!gearType || photos.length === 0 || uploading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!gearType || photos.length === 0 || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
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
  scrollView: {
    flex: 1,
    padding: 24,
  },
  instructionCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
  gearOptions: {
    gap: 12,
  },
  gearOption: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  gearOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#1a1a3a',
  },
  gearOptionText: {
    fontSize: 16,
    color: '#888',
  },
  gearOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
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
