import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inUserGroup = segments[0] === '(user)';
    const inDriverGroup = segments[0] === '(driver)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!session && !inAuthGroup) {
      // Not signed in, redirect to login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Signed in, check role and redirect
      checkRoleAndRedirect();
    }
  }, [session, segments, loading]);

  const checkRoleAndRedirect = async () => {
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      if (profile.role === 'driver') {
        router.replace('/(driver)');
      } else if (profile.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(user)');
      }
    } else {
      // No profile, redirect to role selection
      router.replace('/(auth)/role-select');
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(driver)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

