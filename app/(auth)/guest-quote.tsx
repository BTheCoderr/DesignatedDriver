import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SERVICES, type ServiceId } from '@/lib/services';
import { validateGuestInquiry, type GuestInquiry } from '@/lib/guestInquiry';

export default function GuestQuote() {
 const router = useRouter();
 const [form, setForm] = useState<GuestInquiry>({service:'drive_my_car',name:'',email:'',phone:'',pickup:'',destination:'',requestedFor:'',notes:''});
 const [busy,setBusy] = useState(false);
 const [notice,setNotice] = useState('');
 const [sent,setSent] = useState(false);
 const fields = [['name','Full name'],['email','Email'],['phone','Phone'],['pickup','Pickup address'],['destination','Destination address'],['requestedFor','Preferred time (ISO with timezone)'],['notes','Additional details']] as const;
 async function submit() {
   if(busy || sent) return;
   setBusy(true); setNotice('');
   try {
     const payload = validateGuestInquiry(form);
     const endpoint = process.env.EXPO_PUBLIC_GUEST_QUOTE_ENDPOINT;
     if(!endpoint) throw new Error('Online guest requests are not available yet.');
     const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
     if(!response.ok) throw new Error('Request could not be sent. Please try again later.');
     const result = await response.json();
     if(result.accepted !== true) throw new Error('Request was not confirmed by the server.');
     setSent(true); setNotice('Request received for review. No ride is confirmed and no payment has been collected.');
   } catch(e) {setNotice(e instanceof Error ? e.message : 'Unable to send request.');}
   finally {setBusy(false);}
 }
 return <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
   <TouchableOpacity onPress={()=>router.back()}><Text style={s.link}>Back</Text></TouchableOpacity>
   <Text style={s.title}>Request a transportation quote</Text>
   <Text style={s.body}>No account required. Requests are reviewed manually; availability and pricing are not guaranteed.</Text>
   {!sent && <><Text style={s.label}>Choose service</Text>{SERVICES.map(service=><TouchableOpacity key={service.id} accessibilityRole="radio" accessibilityState={{checked:form.service===service.id}} style={[s.option,form.service===service.id&&s.selected]} onPress={()=>setForm(f=>({...f,service:service.id as ServiceId}))}><Text style={s.body}>{service.title}</Text></TouchableOpacity>)}
   {fields.map(([key,label])=><View key={key}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} style={s.input} value={form[key]} onChangeText={value=>setForm(f=>({...f,[key]:value}))} autoCapitalize={key==='email'?'none':'sentences'} keyboardType={key==='email'?'email-address':key==='phone'?'phone-pad':'default'} multiline={key==='notes'} placeholder={key==='requestedFor'?'2026-12-10T15:00:00-05:00':undefined} placeholderTextColor="#999"/></View>)}
   <TouchableOpacity disabled={busy} onPress={submit} style={s.button}><Text style={s.body}>{busy?'Sending…':'Request quote'}</Text></TouchableOpacity></>}
   {!!notice&&<Text accessibilityRole="alert" style={s.body}>{notice}</Text>}
 </ScrollView>;
}
const s=StyleSheet.create({page:{padding:24,paddingTop:55,backgroundColor:'#0a0a0a',flexGrow:1,gap:12},title:{color:'#fff',fontSize:28,fontWeight:'700'},body:{color:'#fff',fontSize:16,lineHeight:23},label:{color:'#ddd',marginBottom:6},link:{color:'#9bbcf7'},input:{backgroundColor:'#222',color:'#fff',padding:14,borderRadius:10},option:{padding:12,borderRadius:10,borderWidth:1,borderColor:'#444'},selected:{borderColor:'#78aaff',backgroundColor:'#193251'},button:{backgroundColor:'#1766c4',padding:16,borderRadius:10,alignItems:'center'}});
