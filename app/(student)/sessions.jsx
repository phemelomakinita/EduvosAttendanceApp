import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { colors, globalStyles } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function Sessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [joinedSessionIds, setJoinedSessionIds] = useState(new Set());
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

    const { data: enrollments } = await supabase
      .from('module_enrollments')
      .select('module_id')
      .eq('student_id', user.id);

    const moduleIds = enrollments?.map((e) => e.module_id) ?? [];

    if (moduleIds.length === 0) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('id, starts_at, duration_minutes, status, modules(code, name), profiles(full_name)')
      .in('module_id', moduleIds)
      .eq('status', 'active')
      .order('starts_at', { ascending: false });

    if (!error) setSessions(data);

    // Check which of these sessions this student has already joined,
    // so we can grey out "Join" and show "Joined" instead.
    if (data && data.length > 0) {
      const sessionIds = data.map((s) => s.id);
      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('session_id')
        .eq('student_id', user.id)
        .in('session_id', sessionIds);

      setJoinedSessionIds(new Set(attendance?.map((a) => a.session_id) ?? []));
    }

    setLoading(false);
  }

  // Same time-based "has this actually ended" check as the lecturer side —
  // a session can still say status: 'active' in the database while its
  // real time window has already passed.
  function isEnded(session) {
    const end = new Date(session.starts_at).getTime() + session.duration_minutes * 60000;
    return Date.now() >= end;
  }

  function minutesRemaining(session) {
    const end = new Date(session.starts_at).getTime() + session.duration_minutes * 60000;
    const mins = Math.round((end - Date.now()) / 60000);
    return mins > 0 ? mins : 0;
  }

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Select a class</Text>

      {loading && <ActivityIndicator style={{ marginVertical: 16 }} />}

      {!loading && sessions.length === 0 && (
        <Text style={globalStyles.subtitle}>No active classes right now.</Text>
      )}

      {sessions.map((session) => {
        const alreadyJoined = joinedSessionIds.has(session.id);
        const ended = isEnded(session);
        const canJoin = !alreadyJoined && !ended;

        return (
          <View key={session.id} style={globalStyles.card}>
            <Text style={{ fontWeight: '600' }}>{session.modules?.code ?? 'Unknown module'}</Text>
            <Text style={globalStyles.subtitle}>
              {session.profiles?.full_name ?? 'Unknown lecturer'} ·{' '}
              {new Date(session.starts_at).toLocaleDateString()}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 12, marginTop: 4 }}>
              {ended ? 'Ended' : `Ends in ${minutesRemaining(session)} min`}
            </Text>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 10 }, !canJoin && { backgroundColor: '#ccc' }]}
              disabled={!canJoin}
              onPress={() => router.push({ pathname: '/confirm', params: { sessionId: session.id } })}
            >
              <Text style={[globalStyles.buttonText, !canJoin && { color: '#888' }]}>
                {alreadyJoined ? 'Joined' : ended ? 'Ended' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}