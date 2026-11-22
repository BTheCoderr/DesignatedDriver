import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SERVICES, type Service } from '@/lib/services';
import { supabase } from '@/lib/supabase';

export default function ServicesScreen() {
  const router = useRouter();
  async function choose(service: Service) {
    if (!service.available) {
      Alert.alert('Coming soon', service.title + ' is being prepared. Booking is not yet available for this service.');
      return;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      Alert.alert('Sign in required', 'Please sign in to request a driver.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    router.push('/(user)/request-rescue');
  }
  return <SafeAreaView style={styles.root}><ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity onPress={() => router.back()} accessibilityRole="button"><Text style={styles.back}>‹ Back</Text></TouchableOpacity>
    <Text style={styles.eyebrow}>DESIGNATED DRIVER</Text>
    <Text style={styles.heading}>Where can we take you?</Text>
    <Text style={styles.intro}>Your car, our car, your schedule. Choose the service you need.</Text>
    {SERVICES.map(service => <TouchableOpacity key={service.id} style={styles.card} onPress={() => choose(service)} accessibilityRole="button" accessibilityLabel={service.title + (service.available ? '' : ', coming soon')}>
      <Text style={styles.icon}>{service.icon}</Text><View style={styles.info}><Text style={styles.title}>{service.title}</Text><Text style={styles.subtitle}>{service.subtitle}</Text>{!service.available && <Text style={styles.soon}>COMING SOON</Text>}</View><Text style={styles.arrow}>›</Text>
    </TouchableOpacity>)}
    <Text style={styles.note}>Only Drive My Car currently connects to the existing booking flow. All services are subject to driver, insurance and regulatory verification before launch.</Text>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
 root:{flex:1,backgroundColor:'#0a0a0a'},content:{padding:24,paddingBottom:48},back:{color:'#9bbcf7',fontSize:17,marginBottom:24},eyebrow:{color:'#77b1ff',fontSize:12,fontWeight:'700',letterSpacing:2,marginBottom:8},heading:{fontSize:30,fontWeight:'800',color:'#fff',marginBottom:10},intro:{color:'#aaa',fontSize:15,lineHeight:22,marginBottom:26},card:{backgroundColor:'#191919',borderWidth:1,borderColor:'#303030',borderRadius:18,padding:18,marginBottom:12,flexDirection:'row',alignItems:'center'},icon:{fontSize:30,marginRight:14},info:{flex:1},title:{color:'#fff',fontSize:17,fontWeight:'700'},subtitle:{color:'#aaa',fontSize:13,marginTop:4},soon:{color:'#8ebaff',fontSize:10,fontWeight:'800',letterSpacing:1,marginTop:7},arrow:{color:'#aaa',fontSize:26},note:{color:'#888',fontSize:12,lineHeight:19,marginTop:18}
});
