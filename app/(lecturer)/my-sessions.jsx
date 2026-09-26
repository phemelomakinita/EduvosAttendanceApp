import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../constants/AuthContext';
import { colors, globalStyles } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function MySessions() {
  const router = useRouter();
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [])
  );

  const [, forceRerender] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceRerender((n) => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchSessions() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('sessions')
      .select('id, starts_at, duration_minutes, status, modules(code)')
      .eq('lecturer_id', user.id)
      .order('starts_at', { ascending: false });

    if (!error) setSessions(data);
    setLoading(false);
  }

  // Cancelled always wins, regardless of time. Otherwise, ended vs active
  // is purely a time calculation, same as before.
  function getDisplayStatus(session) {
    if (session.status === 'cancelled') return 'cancelled';
    const end = new Date(session.starts_at).getTime() + session.duration_minutes * 60000;
    return Date.now() >= end ? 'ended' : 'active';
  }

  function minutesRemaining(session) {
    const end = new Date(session.starts_at).getTime() + session.duration_minutes * 60000;
    const mins = Math.round((end - Date.now()) / 60000);
    return mins > 0 ? mins : 0;
  }

  // Soft-cancel: updates the row instead of deleting it, so any
  // attendance_records already tied to this session are preserved.
  async function handleCancel(sessionId) {
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'cancelled' })
      .eq('id', sessionId);

    if (error) {
      console.log('CANCEL FAILED:', error.message);
      return;
    }

    setSessions((current) =>
      current.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s))
    );
  }

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>My sessions</Text>

      {loading && <ActivityIndicator style={{ marginVertical: 16 }} />}

      {!loading && sessions.length === 0 && (
        <Text style={globalStyles.subtitle}>No sessions yet — create one below.</Text>
      )}

      {sessions.map((session) => {
        const displayStatus = getDisplayStatus(session);
        const isJoinable = displayStatus === 'active';

        return (
          <View key={session.id} style={[globalStyles.card, { position: 'relative' }]}>
            {isJoinable && (
              <TouchableOpacity
                onPress={() => handleCancel(session.id)}
                style={{ position: 'absolute', top: 10, right: 10, padding: 4 }}
              >
                <Text style={{ color: '#888', fontWeight: '600', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}

            <Text style={{ fontWeight: '600' }}>{session.modules?.code ?? 'Unknown module'}</Text>
            <Text style={globalStyles.subtitle}>
              {new Date(session.starts_at).toLocaleDateString()} · {session.duration_minutes} min total
            </Text>
            <Text
              style={{
                color: displayStatus === 'active' ? colors.accent : '#999',
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {displayStatus === 'active'
                ? `Active now · ${minutesRemaining(session)} min left`
                : displayStatus === 'cancelled'
                ? 'Cancelled'
                : 'Ended'}
            </Text>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 10 }, !isJoinable && { backgroundColor: '#ccc' }]}
              disabled={!isJoinable}
              onPress={() => router.push({ pathname: '/live-attendance', params: { sessionId: session.id } })}
            >
              <Text style={[globalStyles.buttonText, !isJoinable && { color: '#888' }]}>
                {isJoinable ? 'View live' : displayStatus === 'cancelled' ? 'Cancelled' : 'Ended'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent }]}
        onPress={() => router.push('/create-session')}
      >
        <Text style={[globalStyles.buttonText, { color: colors.accent }]}>+ New session</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={async () => {
        await logout();
        router.replace('/');
      }}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 24 }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}