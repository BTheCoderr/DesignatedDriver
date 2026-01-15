import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { supabase, type Vehicle } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { selectDispatchMode, calculatePrice, type TripData } from '@/lib/dispatcher';
import { detectCityDensity, DEFAULT_LOCATION } from '@/lib/cityDetection';
import * as Location from 'expo-location';

export default function RequestRescueScreen() {
  const [step, setStep] = useState(1); // 1: vehicle, 2: destination, 3: confirm, 4: creating
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
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
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback to default location (Providence, RI)
        console.log('Location permission denied, using default: Providence, RI');
        setPickupCoords({ lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng });
        setPickupAddress(DEFAULT_LOCATION.address);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setPickupCoords({ lat: latitude, lng: longitude });

      // Reverse geocode to get address
      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          const addr = geocode[0];
          setPickupAddress(`${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`.trim());
        } else {
          setPickupAddress(DEFAULT_LOCATION.address);
        }
      } catch (geocodeError) {
        // If geocoding fails, use default
        console.log('Geocoding failed, using default location');
        setPickupAddress(DEFAULT_LOCATION.address);
      }
    } catch (error) {
      console.error('Location error:', error);
      // Fallback to default location on error
      setPickupCoords({ lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng });
      setPickupAddress(DEFAULT_LOCATION.address);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedVehicle) {
        Alert.alert('Error', 'Please select a vehicle');
        return;
      }
      // Validate vehicle has all required fields for insurance
      if (!selectedVehicle.make || !selectedVehicle.model || !selectedVehicle.year) {
        Alert.alert(
          'Incomplete Vehicle Information',
          'This vehicle is missing required information (make, model, or year). Please update the vehicle details before requesting a rescue.',
          [
            {
              text: 'Update Vehicle',
              onPress: () => router.push('/(user)/vehicles'),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }
      if (!selectedVehicle.license_plate || !selectedVehicle.color) {
        Alert.alert(
          'Incomplete Vehicle Information',
          'License plate and color are required for insurance coverage. Please update the vehicle details before requesting a rescue.',
          [
            {
              text: 'Update Vehicle',
              onPress: () => router.push('/(user)/vehicles'),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!destination.trim()) {
        Alert.alert('Error', 'Please enter a destination');
        return;
      }
      // For MVP, use a simple geocoding (you'd use a real geocoding service in production)
      // For now, we'll create the trip with the address and let backend handle it
      await calculateDispatch();
    }
  };

  const calculateDispatch = async () => {
    if (!selectedVehicle || !pickupCoords || !destination.trim()) return;

    setLoading(true);
    setStep(3);

    try {
      // Mock available drivers for MVP (in production, query from database)
      const availableDrivers: any[] = [
        {
          id: 'driver-1',
          gear_verified: 'verified',
          gear_type: 'folding_scooter',
          is_available: true,
          currentLocation: { lat: pickupCoords.lat + 0.01, lng: pickupCoords.lng + 0.01 },
          rating: 4.8,
        },
      ];

      // Calculate distance (simplified for MVP - use real distance calculation)
      const distance = 5.0; // miles (would calculate from coords)

      // Detect city density from pickup location
      const cityDensity = detectCityDensity(pickupCoords.lat, pickupCoords.lng);

      const tripData: TripData = {
        pickup: {
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
          address: pickupAddress || 'Current location',
        },
        destination: {
          lat: destinationCoords?.lat || pickupCoords.lat + 0.05,
          lng: destinationCoords?.lng || pickupCoords.lng + 0.05,
          address: destination,
        },
        distance,
        timeOfDay: new Date().getHours(),
        weather: 'clear', // TODO: Integrate weather API
        cityDensity, // Auto-detected from location
        isWeekend: [0, 6].includes(new Date().getDay()),
      };

      const result = await selectDispatchMode(tripData, availableDrivers);
      
      // Ensure price exists (it should be calculated in selectDispatchMode)
      const price = result.price || result.priceEstimate || (result.mode ? calculatePrice(
        result.mode,
        distance,
        tripData.timeOfDay,
        tripData.weather,
        tripData.isWeekend
      ) : null);

      setDispatchResult({ ...result, price: price || undefined });
      setStep(4);
    } catch (error) {
      console.error('Dispatch error:', error);
      Alert.alert('Error', 'Failed to calculate dispatch. Please try again.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedVehicle || !pickupCoords || !destination.trim() || !dispatchResult) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const distance = 5.0; // Would calculate from coords

      // Create trip
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          vehicle_id: selectedVehicle.id,
          dispatch_mode: dispatchResult.mode,
          status: 'requested',
          pickup_latitude: pickupCoords.lat,
          pickup_longitude: pickupCoords.lng,
          pickup_address: pickupAddress || 'Current location',
          destination_latitude: destinationCoords?.lat || pickupCoords.lat + 0.05,
          destination_longitude: destinationCoords?.lng || pickupCoords.lng + 0.05,
          destination_address: destination,
          primary_driver_id: dispatchResult.primaryDriver?.id || null,
          chase_driver_id: dispatchResult.chaseDriver?.id || null,
          base_fee: dispatchResult.price?.base_fee || 0,
          mileage_fee: dispatchResult.price?.mileage_fee || 0,
          surge_multiplier: dispatchResult.price?.surge_multiplier || 1.0,
          total_price: dispatchResult.price?.total || 0,
          estimated_distance_miles: distance,
          estimated_duration_minutes: dispatchResult.estimatedArrival || 15,
        })
        .select()
        .single();

      if (tripError) {
        throw tripError;
      }

      // Create insurance session
      const { error: insuranceError } = await supabase
        .from('insurance_sessions')
        .insert({
          trip_id: trip.id,
          policy_status: 'not_started',
          vehicle_make: selectedVehicle.make,
          vehicle_model: selectedVehicle.model,
          vehicle_year: selectedVehicle.year,
          license_plate: selectedVehicle.license_plate,
        });

      if (insuranceError) {
        console.error('Insurance session error:', insuranceError);
      }

      setLoading(false);
      router.replace(`/(user)/trip-tracking?id=${trip.id}`);
    } catch (error: any) {
      setLoading(false);
      console.error('Create trip error:', error);
      Alert.alert('Error', error.message || 'Failed to create trip. Please try again.');
    }
  };

  const handleAddVehicle = () => {
    router.push('/(user)/vehicles');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Select Vehicle */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Your Vehicle</Text>
            {vehicles.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No vehicles added yet</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
                  <Text style={styles.addButtonText}>+ Add Vehicle</Text>
                </TouchableOpacity>
              </View>
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
                <TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
                  <Text style={styles.addButtonText}>+ Add Another Vehicle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Step 2: Enter Destination */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Where are you going?</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Destination Address</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main St, City, State"
                placeholderTextColor="#666"
                value={destination}
                onChangeText={setDestination}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.pickupInfo}>
              <Text style={styles.pickupLabel}>Pickup Location:</Text>
              <Text style={styles.pickupText}>
                {pickupAddress || 'Getting your location...'}
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Loading Dispatch */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Finding the best driver...</Text>
          </View>
        )}

        {/* Step 4: Confirm & Price */}
        {step === 4 && dispatchResult && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirm Your Trip</Text>
            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Mode:</Text>
                <Text style={styles.confirmValue}>
                  {dispatchResult.mode === 'solo_scoot' ? '🚴 Solo-Scoot' : '🚗 Chase Car'}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>From:</Text>
                <Text style={styles.confirmValue}>{pickupAddress || 'Current location'}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>To:</Text>
                <Text style={styles.confirmValue}>{destination}</Text>
              </View>
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Price Breakdown</Text>
                {dispatchResult.price && (
                  <>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>Base Fee:</Text>
                      <Text style={styles.priceAmount}>${dispatchResult.price.base_fee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>Mileage:</Text>
                      <Text style={styles.priceAmount}>${dispatchResult.price.mileage_fee.toFixed(2)}</Text>
                    </View>
                    {dispatchResult.price.surge_multiplier > 1 && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>Surge ({dispatchResult.price.surge_multiplier}x):</Text>
                        <Text style={styles.priceAmount}>
                          ${dispatchResult.price.breakdown.surge.toFixed(2)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>Platform Fee:</Text>
                      <Text style={styles.priceAmount}>${dispatchResult.price.platform_fee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>Taxes:</Text>
                      <Text style={styles.priceAmount}>${dispatchResult.price.taxes.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.priceTotal]}>
                      <Text style={styles.priceTotalLabel}>Total:</Text>
                      <Text style={styles.priceTotalAmount}>${dispatchResult.price.total.toFixed(2)}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {step > 1 && step < 4 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(step - 1)}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 4 && (
            <TouchableOpacity
              style={[styles.nextButton, loading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {step === 1 ? 'Next' : step === 2 ? 'Find Driver' : 'Confirm'}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {step === 4 && (
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm & Request</Text>
              )}
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
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
  pickupInfo: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  pickupLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  pickupText: {
    fontSize: 16,
    color: '#fff',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  confirmCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  confirmValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  priceSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#888',
  },
  priceAmount: {
    fontSize: 14,
    color: '#fff',
  },
  priceTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  priceTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  priceTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
