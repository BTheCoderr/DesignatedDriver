import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { getService, type ServiceId } from '@/lib/services';

type RequestRow = { id: string; service_type: ServiceId; pickup_address: string; destination_address: string; requested_for: string; status: string };
export default function MyRequests() {
 const router = useRouter();
 const [rows,setRows] = useState<RequestRow[]>([]);
 const [loading,setLoading] = useState(true);
 const [error,setError] = useState('');
 async function load() {
   setLoading(true); setError('');
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError || !user) { setError('Sign in to see your requests.'); setRows([]); setLoading(false); return; }
   const { data, error: queryError } = await supabase.from('transport_requests').select('id,service_type,pickup_address,destination_address,requested_for,status').eq('customer_id',user.id).order('created_at',{ascending:false}).limit(50);
   if(queryError) { setError('Requests could not be loaded. Check the staging database migration.'); setRows([]); }
   else setRows((data || []) as RequestRow[]);
   setLoading(false);
 }
 useEffect(()=>{ void load(); },[]);
 return <SafeAreaView style={styles.root}><ScrollView contentContainerStyle={styles.content}>
   <TouchableOpacity onPress={()=>router.back()}><Text style={styles.link}>‹ Back</Text></TouchableOpacity>
   <Text style={styles.title}>My transport requests</Text>
   <Text style={styles.note}>Inquiries are not confirmed bookings. No driver or payment is assigned.</Text>
   <TouchableOpacity onPress={()=>void load()}><Text style={styles.link}>Refresh requests</Text></TouchableOpacity>
   {loading ? <ActivityIndicator color="#8ebaff"/> : error ? <Text style={styles.note}>{error}</Text> : rows.length === 0 ? <Text style={styles.note}>No requests yet.</Text> : rows.map(row=><View key={row.id} style={styles.card}>
     <Text style={styles.service}>{getService(row.service_type)?.title || row.service_type}</Text>
     <Text style={styles.status}>{row.status.replace(/_/g,' ').toUpperCase()}</Text>
     <Text style={styles.detail}>{row.pickup_address} → {row.destination_address}</Text>
     <Text style={styles.detail}>{new Date(row.requested_for).toLocaleString()}</Text>
   </View>)}
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:'#0a0a0a'},content:{padding:24,paddingBottom:48},link:{color:'#8ebaff',fontSize:16,marginBottom:18},title:{color:'#fff',fontSize:27,fontWeight:'800',marginBottom:12},note:{color:'#aaa',fontSize:14,lineHeight:21,marginBottom:22},card:{backgroundColor:'#1b1b1b',padding:18,borderRadius:14,marginBottom:12},service:{color:'#fff',fontSize:17,fontWeight:'700'},status:{color:'#8ebaff',fontSize:12,marginTop:6,marginBottom:12},detail:{color:'#ccc',fontSize:14,marginBottom:6}});
