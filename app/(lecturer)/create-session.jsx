import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { globalStyles } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function CreateSession() {
  const router = useRouter();
  const [moduleCode, setModuleCode] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleStartSession() {
    if (!moduleCode || !date || !duration) {
      setError('Please fill in all fields.');
      return;
    }
    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      setError('Duration must be a number, e.g. 60');
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    // Look up the module by its code
    const { data: moduleRow, error: moduleError } = await supabase
      .from('modules')
      .select('id')
      .eq('code', moduleCode.trim().toUpperCase())
      .single();

    if (moduleError || !moduleRow) {
      setLoading(false);
      setError(`Module "${moduleCode}" not found.`);
      return;
    }

    const { data: newSession, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        module_id: moduleRow.id,
        lecturer_id: user.id,
        starts_at: new Date().toISOString(),
        duration_minutes: durationNum,
        status: 'active',
      })
      .select()
      .single();

    setLoading(false);

    if (sessionError) {
      // If this fires with a permissions message, it means this module
      // isn't actually assigned to you in module_lecturers yet.
      setError(sessionError.message);
      return;
    }

    router.push({ pathname: '/live-attendance', params: { sessionId: newSession.id } });
  }

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>New session</Text>

      <Text style={globalStyles.subtitle}>Module</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g. ITDMA3-34"
        autoCapitalize="characters"
        value={moduleCode}
        onChangeText={setModuleCode}
      />

      <Text style={globalStyles.subtitle}>Date</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g. 2026-09-04"
        value={date}
        onChangeText={setDate}
      />

      <Text style={globalStyles.subtitle}>Duration (minutes)</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="e.g. 60"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      <Text style={[globalStyles.subtitle, { marginBottom: 12 }]}>
        Lecturer: Mr M. Langa (auto-filled from login)
      </Text>

      {error && <Text style={{ color: '#C0392B', marginBottom: 12 }}>{error}</Text>}

      <TouchableOpacity style={globalStyles.button} onPress={handleStartSession} disabled={loading}>
        <Text style={globalStyles.buttonText}>{loading ? 'Starting...' : 'Start session'}</Text>
      </TouchableOpacity>
    </View>
  );
}