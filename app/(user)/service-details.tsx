import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getService, type ServiceId } from '@/lib/services';

/** Pre-booking intake only. Does not create trips, charge customers, or dispatch drivers. */
export default function ServiceDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const service = getService(params.service as ServiceId);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit() {
    if (!service || service.available || submitting) return;
    if (pickup.trim().length < 3 || destination.trim().length < 3 || pickup.length > 500 || destination.length > 500 || notes.length > 2000) {
      Alert.alert('Check your details', 'Enter valid pickup and destination addresses (3–500 characters) and notes under 2,000 characters.'); return;
    }
    const scheduled = new Date(date);
    if (!date.trim() || Number.isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
      Alert.alert('Choose a future time', 'Enter a date and time with timezone, such as 2026-12-10T15:00:00-05:00.'); return;
    }
    setSubmitting(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { Alert.alert('Sign in required', 'Sign in before sending a request.'); return; }
      const { error } = await supabase.from('transport_requests').insert({
        customer_id: user.id, service_type: service.id,
        pickup_address: pickup.trim(), destination_address: destination.trim(),
        requested_for: scheduled.toISOString(), notes: notes.trim() || null,
      });
      if (error) throw error;
      Alert.alert('Request received', 'Your request is pending review. No driver has been assigned, no ride is confirmed and no payment has been collected.', [{ text: 'OK', onPress: () => router.replace('/(user)/services') }]);
    } catch (error) {
      Alert.alert('Request not sent', 'The request service is unavailable. No reservation was created. Please try again later.');
    } finally { setSubmitting(false); }
  }
  if (!service) return <SafeAreaView style={styles.root}><Text style={styles.title}>Unknown service</Text><TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Back to services</Text></TouchableOpacity></SafeAreaView>;
  return <SafeAreaView style={styles.root}><ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>‹ Services</Text></TouchableOpacity>
    <Text style={styles.title}>{service.icon} {service.title}</Text><Text style={styles.subtitle}>{service.subtitle}</Text>
    <Text style={styles.warning}>Submit an inquiry for review only. This does not reserve a ride, dispatch a driver, or charge a payment.</Text>
    <Text style={styles.label}>Pickup address</Text><TextInput style={styles.input} placeholder="Where should the driver arrive?" placeholderTextColor="#888" value={pickup} onChangeText={setPickup}/>
    <Text style={styles.label}>Destination</Text><TextInput style={styles.input} placeholder="Where are you going?" placeholderTextColor="#888" value={destination} onChangeText={setDestination}/>
    <Text style={styles.label}>Preferred date and time</Text><TextInput style={styles.input} placeholder="2026-12-10T15:00:00-05:00" placeholderTextColor="#888" value={date} onChangeText={setDate}/>
    <Text style={styles.label}>Special instructions</Text><TextInput style={[styles.input,styles.multiline]} multiline placeholder="Passenger, vehicle or handoff details" placeholderTextColor="#888" value={notes} onChangeText={setNotes}/>
    <TouchableOpacity style={styles.button} onPress={submit} disabled={submitting}><Text style={styles.buttonText}>{submitting ? 'Sending…' : 'Send request for review'}</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:'#0a0a0a'},content:{padding:24,paddingBottom:44},link:{color:'#9bbcf7',fontSize:16,marginBottom:24},title:{color:'#fff',fontSize:27,fontWeight:'800',marginBottom:8},subtitle:{color:'#aaa',fontSize:15,marginBottom:18},warning:{color:'#d9c68b',backgroundColor:'#29251b',padding:14,borderRadius:12,lineHeight:20,marginBottom:22},label:{color:'#fff',fontSize:14,fontWeight:'600',marginBottom:8},input:{backgroundColor:'#1c1c1c',color:'#fff',padding:14,borderRadius:12,borderWidth:1,borderColor:'#393939',marginBottom:18},multiline:{minHeight:100,textAlignVertical:'top'},button:{backgroundColor:'#2673db',borderRadius:12,padding:17,alignItems:'center'},buttonText:{color:'#fff',fontWeight:'700',fontSize:16}});
