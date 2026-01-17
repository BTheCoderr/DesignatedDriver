// Simplified request flow for MVP
// Just: pickup, dropoff, vehicle, notes

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { supabase, type Vehicle } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { DEFAULT_LOCATION } from '@/lib/cityDetection';
import * as Location from 'expo-location';
import { logTripRequested } from '@/lib/analytics';

export default function RequestRescueSimpleScreen() {
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadVehicles();
    getCurrentLocation();
  }, []);

  const loadVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading vehicles:', error);
      return;
    }

    setVehicles(data || []);
    if (data && data.length > 0) {
      setSelectedVehicle(data[0]);
    }
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPickupAddress(DEFAULT_LOCATION.address);
        setGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          const addr = geocode[0];
          setPickupAddress(`${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`.trim() || DEFAULT_LOCATION.address);
        } else {
          setPickupAddress(DEFAULT_LOCATION.address);
        }
      } catch {
        setPickupAddress(DEFAULT_LOCATION.address);
      }
    } catch (error) {
      console.error('Location error:', error);
      setPickupAddress(DEFAULT_LOCATION.address);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!pickupAddress.trim()) {
      Alert.alert('Error', 'Please enter a pickup address');
      return;
    }
    if (!destinationAddress.trim()) {
      Alert.alert('Error', 'Please enter a destination address');
      return;
    }
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        setLoading(false);
        return;
      }

      // Get coordinates for pickup (use default if can't geocode)
      let pickupLat = DEFAULT_LOCATION.lat;
      let pickupLng = DEFAULT_LOCATION.lng;
      
      try {
        const pickupGeocode = await Location.geocodeAsync(pickupAddress);
        if (pickupGeocode.length > 0) {
          pickupLat = pickupGeocode[0].latitude;
          pickupLng = pickupGeocode[0].longitude;
        }
      } catch {
        // Use default
      }

      // Get coordinates for destination (use default if can't geocode)
      let destLat = DEFAULT_LOCATION.lat + 0.05;
      let destLng = DEFAULT_LOCATION.lng + 0.05;
      
      try {
        const destGeocode = await Location.geocodeAsync(destinationAddress);
        if (destGeocode.length > 0) {
          destLat = destGeocode[0].latitude;
          destLng = destGeocode[0].longitude;
        }
      } catch {
        // Use default
      }

      // Ensure destination_address is not empty (required field)
      const finalDestinationAddress = destinationAddress.trim();
      if (!finalDestinationAddress) {
        Alert.alert('Error', 'Destination address is required');
        setLoading(false);
        return;
      }

      // Create simple trip - status = 'requested' (Looking for driver)
      const tripData = {
        user_id: user.id,
        vehicle_id: selectedVehicle.id,
        dispatch_mode: 'chase_car' as const, // Default for MVP
        status: 'requested' as const, // This is "Looking for driver"
        pickup_latitude: Number(pickupLat),
        pickup_longitude: Number(pickupLng),
        pickup_address: pickupAddress.trim() || null,
        destination_latitude: Number(destLat),
        destination_longitude: Number(destLng),
        destination_address: finalDestinationAddress, // Required field
        user_notes: notes.trim() || null,
        // Simple pricing for MVP - can be calculated later
        base_fee: 25.00,
        mileage_fee: 2.50,
        surge_multiplier: 1.0,
        total_price: 25.00, // Will be updated when driver accepts
        estimated_distance_miles: 5.0, // Will be calculated properly later
        estimated_duration_minutes: 15,
      };

      console.log('Creating trip with data:', tripData);

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert(tripData)
        .select()
        .single();

      if (tripError) {
        console.error('Trip creation error details:', tripError);
        console.error('Error code:', tripError.code);
        console.error('Error message:', tripError.message);
        console.error('Error details:', tripError.details);
        throw tripError;
      }

      // Log analytics
      await logTripRequested(trip.id, user.id, {
        vehicle_id: selectedVehicle.id,
        has_notes: !!notes.trim(),
      });

      setLoading(false);
      
      // Show success and navigate to tracking
      Alert.alert(
        'Request Submitted!',
        'We\'re looking for a driver. You\'ll be notified when one accepts.',
        [
          {
            text: 'OK',
            onPress: () => router.replace(`/(user)/trip-tracking?id=${trip.id}`),
          },
        ]
      );
    } catch (error: any) {
      setLoading(false);
      console.error('Create trip error:', error);
      
      // Better error messages for common issues
      let errorMessage = 'Failed to create trip. Please try again.';
      
      if (error.code === '23503') {
        errorMessage = 'Vehicle not found. Please add a vehicle first.';
      } else if (error.code === '23505') {
        errorMessage = 'A trip with this information already exists.';
      } else if (error.code === '42501') {
        errorMessage = 'Permission denied. Please check your account settings.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Request a Driver</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>

        {/* Payment Notice */}
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            💳 <Text style={styles.noticeBold}>Free during beta</Text> - Payment will be collected after trip completion
          </Text>
        </View>

        {/* Pickup Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pickup Address *</Text>
          {gettingLocation ? (
            <View style={styles.loadingInput}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="123 Main St, City, State"
              placeholderTextColor="#666"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              autoCapitalize="words"
            />
          )}
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
          </TouchableOpacity>
        </View>

        {/* Destination Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Destination Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Main St, City, State"
            placeholderTextColor="#666"
            value={destinationAddress}
            onChangeText={setDestinationAddress}
            autoCapitalize="words"
          />
        </View>

        {/* Vehicle Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehicle *</Text>
          {vehicles.length === 0 ? (
            <TouchableOpacity
              style={styles.addVehicleButton}
              onPress={() => router.push('/(user)/vehicles')}
            >
              <Text style={styles.addVehicleText}>+ Add Vehicle First</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.vehicleList}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle?.id === vehicle.id && styles.vehicleCardSelected,
                  ]}
                  onPress={() => setSelectedVehicle(vehicle)}
                >
                  <Text style={styles.vehicleName}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Text>
                  {vehicle.license_plate && (
                    <Text style={styles.vehiclePlate}>{vehicle.license_plate}</Text>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.addVehicleButton}
                onPress={() => router.push('/(user)/vehicles')}
              >
                <Text style={styles.addVehicleText}>+ Add Another Vehicle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notes (Optional) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions or notes..."
            placeholderTextColor="#666"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !pickupAddress || !destinationAddress || !selectedVehicle}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Status will update to "Looking for driver" once submitted
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  noticeBanner: {
    backgroundColor: '#1a3a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a4a2a',
  },
  noticeText: {
    fontSize: 14,
    color: '#4CAF50',
    lineHeight: 20,
  },
  noticeBold: {
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 18,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 18,
  },
  loadingInput: {
    backgroundColor: '#1a1a1a',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  locationButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleList: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  vehicleCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#1a1a3a',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#888',
  },
  addVehicleButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addVehicleText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
