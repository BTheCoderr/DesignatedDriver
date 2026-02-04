import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, type Vehicle } from '@/lib/supabase';
import { createBooking } from '@/lib/booking';
import { detectCityDensity, DEFAULT_LOCATION } from '@/lib/cityDetection';
import { logTripRequested } from '@/lib/analytics';

export default function RequestRescueScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Vehicle, 2: Destination, 3: Confirm
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  
  // Hardcoded "Current Location" for MVP testing (Providence)
  const pickupLocation = { 
    lat: DEFAULT_LOCATION.lat, 
    lng: DEFAULT_LOCATION.lng, 
    address: DEFAULT_LOCATION.address 
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching vehicles:', error);
      return;
    }

    if (data) setVehicles(data);
  }

  async function handleRequestRescue() {
    if (!selectedVehicleId || !destinationAddress) return;

    setLoading(true);
    try {
      // 1. Mock Geocoding (In real app, use Mapbox/Google API here)
      // For MVP, we'll use a slightly offset location to simulate distance
      const mockDestination = {
        lat: pickupLocation.lat + 0.01, // Slightly different lat for testing distance
        lng: pickupLocation.lng + 0.01,
        address: destinationAddress
      };

      // 2. Detect city density from pickup location
      const cityDensity = detectCityDensity(pickupLocation.lat, pickupLocation.lng);

      // 3. Call our Booking Logic
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const trip = await createBooking({
        userId: user.id,
        vehicleId: selectedVehicleId,
        pickup: pickupLocation,
        destination: mockDestination,
        cityDensity: cityDensity // Use detected density instead of hardcoded
      });

      // 4. Log analytics
      await logTripRequested(trip.id, user.id, {
        dispatch_mode: trip.dispatch_mode,
        estimated_price: trip.total_price || 0,
      });

      Alert.alert(
        "Rescue Requested!", 
        `Dispatching ${trip.dispatch_mode === 'solo_scoot' ? 'Solo-Scoot' : 'Chase Car'} driver...`,
        [
          {
            text: 'Track Trip',
            onPress: () => router.replace(`/(user)/trip-tracking?id=${trip.id}`)
          }
        ]
      );
      
      // Navigate to Tracking
      router.replace(`/(user)/trip-tracking?id=${trip.id}`);

    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert(
        "Error", 
        error.message || "Failed to request rescue. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // --- Step 1: Select Vehicle ---
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.header}>Select Your Vehicle</Text>
      <Text style={styles.subHeader}>Which car needs a driver?</Text>
      
      <ScrollView style={styles.list}>
        {vehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vehicles found.</Text>
            <Text style={styles.emptySubtext}>Please add one in settings.</Text>
            <TouchableOpacity 
              style={styles.addVehicleBtn}
              onPress={() => router.push('/(user)/vehicles')}
            >
              <Text style={styles.addVehicleBtnText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((v) => (
            <TouchableOpacity 
              key={v.id} 
              style={[styles.card, selectedVehicleId === v.id && styles.selectedCard]}
              onPress={() => setSelectedVehicleId(v.id)}
            >
              <Text style={styles.cardTitle}>
                {v.year} {v.make} {v.model}
              </Text>
              <Text style={styles.cardSub}>
                {v.license_plate || 'No plate'} • {v.color || 'No color'}
              </Text>
              {(!v.make || !v.model || !v.year || !v.license_plate) && (
                <Text style={styles.warningText}>
                  ⚠️ Missing required info for insurance
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.btn, !selectedVehicleId && styles.btnDisabled]}
        disabled={!selectedVehicleId}
        onPress={() => {
          // Validate vehicle has required fields before proceeding
          if (selectedVehicle && (!selectedVehicle.make || !selectedVehicle.model || !selectedVehicle.year || !selectedVehicle.license_plate)) {
            Alert.alert(
              'Incomplete Vehicle Information',
              'This vehicle is missing required information for insurance coverage. Please update the vehicle details before requesting a rescue.',
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
        }}
      >
        <Text style={styles.btnText}>Next: Destination</Text>
      </TouchableOpacity>
    </View>
  );

  // --- Step 2: Destination ---
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.header}>Where are we going?</Text>
      <Text style={styles.subHeader}>Enter drop-off location</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pickup</Text>
        <TextInput 
          value={pickupLocation.address} 
          editable={false} 
          style={[styles.input, styles.disabledInput]} 
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Destination</Text>
        <TextInput 
          value={destinationAddress}
          onChangeText={setDestinationAddress}
          placeholder="e.g. 123 Main St, Providence, RI"
          style={styles.input}
          autoFocus
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.flexBtn, !destinationAddress && styles.btnDisabled]}
          disabled={!destinationAddress}
          onPress={() => setStep(3)}
        >
          <Text style={styles.btnText}>Review Quote</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- Step 3: Review & Confirm ---
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.header}>Confirm Rescue</Text>
      <Text style={styles.subHeader}>Review details before dispatch</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle</Text>
          <Text style={styles.summaryValue}>
            {selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>From</Text>
          <Text style={styles.summaryValue}>{pickupLocation.address}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>To</Text>
          <Text style={styles.summaryValue}>{destinationAddress}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Est. Price</Text>
          {/* Note: In a real app, you'd calculate this BEFORE this step to show user. 
              For MVP, we show a range since actual price depends on dispatch mode */}
          <Text style={styles.summaryValue}>$25.00 - $35.00</Text>
        </View>
        <Text style={styles.disclaimer}>
          Final price depends on Solo-Scoot or Chase Car availability.
        </Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.flexBtn, styles.confirmBtn]}
          onPress={handleRequestRescue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Request Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  stepContainer: { flex: 1, padding: 20, paddingTop: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subHeader: { fontSize: 16, color: '#666', marginBottom: 30 },
  list: { flex: 1 },
  
  // Cards
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  selectedCard: { 
    borderColor: '#007AFF', 
    backgroundColor: '#f0f9ff',
    borderWidth: 2
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  cardSub: { fontSize: 14, color: '#666', marginTop: 4 },
  warningText: { fontSize: 12, color: '#ff6b6b', marginTop: 8, fontWeight: '500' },
  
  // Empty state
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 16, marginBottom: 8 },
  emptySubtext: { textAlign: 'center', color: '#999', fontSize: 14, marginBottom: 20 },
  addVehicleBtn: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  addVehicleBtnText: { color: '#fff', fontWeight: '600' },

  // Inputs
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  disabledInput: { backgroundColor: '#f0f0f0', color: '#888' },

  // Summary
  summaryCard: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 30, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 2 
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 16, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  disclaimer: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' },

  // Buttons
  row: { flexDirection: 'row', gap: 12 },
  flexBtn: { flex: 1 },
  btn: { 
    backgroundColor: '#000', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 'auto' 
  },
  confirmBtn: { backgroundColor: '#28a745' },
  btnDisabled: { backgroundColor: '#ccc' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backBtn: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#666', fontSize: 16 },
});
