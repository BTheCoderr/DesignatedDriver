import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { supabase, type Vehicle } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import Dropdown from '@/components/Dropdown';
import { CAR_MAKES, CAR_MODELS, CAR_YEARS, CAR_COLORS, getModelsForMake, type CarMake } from '@/lib/vehicleData';

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    color: '',
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found');
      return;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading vehicles:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      Alert.alert(
        'Error Loading Vehicles',
        error.message || 'Failed to load vehicles. Please check your connection and try again.'
      );
      return;
    }

    setVehicles(data || []);
  };

  const handleAddVehicle = async () => {
    // Validate all required fields for insurance
    if (!formData.make?.trim()) {
      Alert.alert('Error', 'Please enter the vehicle make');
      return;
    }
    if (!formData.model?.trim()) {
      Alert.alert('Error', 'Please enter the vehicle model');
      return;
    }
    if (!formData.year) {
      Alert.alert('Error', 'Please select the vehicle year');
      return;
    }
    const year = parseInt(formData.year);
    if (isNaN(year)) {
      Alert.alert('Error', 'Please select a valid year');
      return;
    }
    if (!formData.license_plate?.trim()) {
      Alert.alert('Error', 'License plate is required for insurance coverage');
      return;
    }
    if (!formData.color?.trim()) {
      Alert.alert('Error', 'Vehicle color is required for insurance coverage');
      return;
    }

    // Validate year is selected (not just empty string)
    if (!formData.year) {
      Alert.alert('Error', 'Please select a vehicle year');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        license_plate: formData.license_plate.trim().toUpperCase(),
        color: formData.color.trim(),
      });

    setLoading(false);

    if (error) {
      console.error('Error adding vehicle:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      Alert.alert(
        'Error Adding Vehicle',
        error.message || 'Failed to add vehicle. Please check your connection and try again.'
      );
      return;
    }

    Alert.alert('Success', 'Vehicle added!');
    setFormData({ make: '', model: '', year: '', license_plate: '', color: '' });
    setAvailableModels([]);
    setShowAddForm(false);
    loadVehicles();
  };

  const handleDelete = async (vehicleId: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('vehicles')
              .delete()
              .eq('id', vehicleId);

            if (error) {
              Alert.alert('Error', error.message);
              return;
            }

            loadVehicles();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(user)/')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Vehicles</Text>
        <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {showAddForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Add Vehicle</Text>
            
            <Dropdown
              label="Make"
              value={formData.make}
              options={CAR_MAKES}
              onSelect={(value) => {
                setFormData({ ...formData, make: String(value), model: '' });
                setAvailableModels(getModelsForMake(value as CarMake));
              }}
              placeholder="Select make"
              required
            />
            
            <Dropdown
              label="Model"
              value={formData.model}
              options={availableModels.length > 0 ? availableModels : []}
              onSelect={(value) => setFormData({ ...formData, model: String(value) })}
              placeholder={formData.make ? "Select model" : "Select make first"}
              required
              disabled={!formData.make || availableModels.length === 0}
            />
            
            <Dropdown
              label="Year"
              value={formData.year}
              options={CAR_YEARS}
              onSelect={(value) => setFormData({ ...formData, year: String(value) })}
              placeholder="Select year"
              required
            />
            
            <TextInput
              style={styles.input}
              placeholder="License Plate *"
              placeholderTextColor="#666"
              value={formData.license_plate}
              onChangeText={(text) => setFormData({ ...formData, license_plate: text.toUpperCase() })}
              autoCapitalize="characters"
              maxLength={10}
            />
            
            <Dropdown
              label="Color"
              value={formData.color}
              options={CAR_COLORS}
              onSelect={(value) => setFormData({ ...formData, color: String(value) })}
              placeholder="Select color"
              required
            />
            
            <Text style={styles.requiredNote}>
              * All fields are required for insurance coverage
            </Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddVehicle}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddForm(false);
                setFormData({ make: '', model: '', year: '', license_plate: '', color: '' });
                setAvailableModels([]);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.vehicleList}>
          {vehicles.map((vehicle) => {
            const isComplete = vehicle.make && vehicle.model && vehicle.year && vehicle.license_plate && vehicle.color;
            return (
              <View key={vehicle.id} style={styles.vehicleCard}>
                <View style={styles.vehicleInfo}>
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.vehicleName}>
                      {vehicle.year || 'Year'} {vehicle.make || 'Make'} {vehicle.model || 'Model'}
                    </Text>
                    {!isComplete && (
                      <View style={styles.incompleteBadge}>
                        <Text style={styles.incompleteText}>Incomplete</Text>
                      </View>
                    )}
                  </View>
                  {vehicle.license_plate ? (
                    <Text style={styles.vehiclePlate}>Plate: {vehicle.license_plate}</Text>
                  ) : (
                    <Text style={styles.missingField}>⚠️ License plate required</Text>
                  )}
                  {vehicle.color ? (
                    <Text style={styles.vehicleColor}>Color: {vehicle.color}</Text>
                  ) : (
                    <Text style={styles.missingField}>⚠️ Color required</Text>
                  )}
                  {!isComplete && (
                    <Text style={styles.updatePrompt}>
                      Update vehicle to use for trips
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(vehicle.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {vehicles.length === 0 && !showAddForm && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No vehicles yet</Text>
            <Text style={styles.emptySubtext}>Add your first vehicle to get started</Text>
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
  backButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  addButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  form: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
  },
  requiredNote: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 8,
  },
  vehicleList: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  incompleteBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  incompleteText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  vehicleColor: {
    fontSize: 14,
    color: '#888',
  },
  missingField: {
    fontSize: 12,
    color: '#ff4444',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  updatePrompt: {
    fontSize: 12,
    color: '#FFA500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
});
