import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
const services = new Set(['drive_my_car','chauffeur','vehicle_delivery','book_a_ride','scheduled_assistance','business']);
Deno.serve(async (req) => {
 const origin = req.headers.get('origin') || '';
 const allowed = Deno.env.get('GUEST_QUOTE_ORIGIN') || 'https://designateddriver.netlify.app';
 const headers = {'Content-Type':'application/json','Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
 const reply = (status:number, body:object) => new Response(JSON.stringify(body),{status,headers});
 if(origin && origin !== allowed) return reply(403,{accepted:false});
 if(req.method==='OPTIONS') return new Response(null,{status:204,headers});
 if(req.method!=='POST') return reply(405,{accepted:false});
 try {
 const raw = await req.text();
 if(raw.length>12000) return reply(413,{accepted:false});
 const p=JSON.parse(raw);
 const field=(k:string,min:number,max:number)=>{if(typeof p[k]!=='string')throw Error('invalid');const v=p[k].trim();if(v.length<min||v.length>max)throw Error('invalid');return v;};
 const service=field('service',1,50),name=field('name',2,120),email=field('email',3,254).toLowerCase(),phone=field('phone',7,40),pickup=field('pickup',3,500),destination=field('destination',3,500),notes=field('notes',0,2000),requestedFor=field('requestedFor',1,50);
 if(!services.has(service)||!/^\S+@\S+\.\S+$/.test(email)||phone.replace(/\D/g,'').length<7||!Number.isFinite(Date.parse(requestedFor))||Date.parse(requestedFor)<=Date.now())return reply(400,{accepted:false});
 const secret=Deno.env.get('TURNSTILE_SECRET_KEY'), url=Deno.env.get('SUPABASE_URL'), key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!secret||!url||!key||Deno.env.get('GUEST_INTAKE_ENABLED')!=='true')return reply(503,{accepted:false});
 const token=field('challengeToken',1,2048);
 const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token})});
 const challenge=await verification.json();
 if(!verification.ok||challenge.success!==true||challenge.hostname!==new URL(allowed).hostname||challenge.action!=='guest_quote')return reply(403,{accepted:false});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await db.from('guest_transport_inquiries').insert({service,name,email,phone,pickup,destination,requested_for:new Date(requestedFor).toISOString(),notes});
 if(error)return reply(503,{accepted:false});
 return reply(201,{accepted:true});
 }catch{return reply(400,{accepted:false});}
});
