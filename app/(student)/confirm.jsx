import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { colors, globalStyles } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function Confirm() {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();

  const [moduleInfo, setModuleInfo] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'already' | 'error'
  const [checkedInAt, setCheckedInAt] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (sessionId) markAttendance();
  }, [sessionId]);

  async function markAttendance() {
    // Who's currently logged in — this becomes the student_id on the
    // attendance row.
    const { data: { user } } = await supabase.auth.getUser();

    // Grab the module's code/name just to show on this screen
    // ("ITDMA3-34 · Mobile Development and Web Services"), matching
    // wireframe 4's header.
    const { data: session } = await supabase
      .from('sessions')
      .select('modules(code, name)')
      .eq('id', sessionId)
      .single();
    setModuleInfo(session?.modules ?? null);

    // The actual check-in: one row in attendance_records linking this
    // student to this session. network_verified is left null for now —
    // that's where the real Wi-Fi check result will go once that
    // logic exists.
    const { data, error } = await supabase
      .from('attendance_records')
      .insert({
        session_id: sessionId,
        student_id: user.id,
        status: 'present',
      })
      .select()
      .single();

    if (error) {
      // Code 23505 = unique constraint violation. Our schema has
      // unique(session_id, student_id), so this specific error means
      // "you already checked in" rather than a real failure — worth
      // showing that as its own friendly state, not a generic error.
      if (error.code === '23505') {
        setStatus('already');
      } else {
        setErrorMessage(error.message);
        setStatus('error');
      }
      return;
    }

    setCheckedInAt(data.checked_in_at);
    setStatus('success');
  }

  if (status === 'loading') {
    return (
      <View style={[globalStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[globalStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={globalStyles.title}>Something went wrong</Text>
        <Text style={globalStyles.subtitle}>{errorMessage}</Text>
        <TouchableOpacity style={[globalStyles.button, { marginTop: 16 }]} onPress={() => router.back()}>
          <Text style={globalStyles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Both 'success' and 'already' land here — same UI, since either way
  // the student IS marked present, we just don't need to say "just now"
  // if it turns out they'd already joined a moment earlier.
  return (
    <View style={[globalStyles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={globalStyles.subtitle}>
        {moduleInfo?.code} · {moduleInfo?.name}
      </Text>

      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#D4F4DD',
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 24,
        }}
      >
        <Text style={{ fontSize: 36, color: colors.accent }}>✓</Text>
      </View>

      <Text style={[globalStyles.title, { fontSize: 20 }]}>You're marked present</Text>

      {status === 'success' && checkedInAt && (
        <Text style={globalStyles.subtitle}>
          {new Date(checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · via
          Eduvos Student-BYOD
        </Text>
      )}
      {status === 'already' && (
        <Text style={globalStyles.subtitle}>You already checked in to this session.</Text>
      )}

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 24 }]}
        onPress={() => router.push('/sessions')}
      >
        <Text style={globalStyles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}