import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { globalStyles } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function LiveAttendance() {
  // sessionId comes in as a route param from my-sessions.jsx, e.g.
  // router.push({ pathname: '/live-attendance', params: { sessionId: session.id } })
  const { sessionId } = useLocalSearchParams();

  const [moduleCode, setModuleCode] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    fetchSessionInfo();
    fetchAttendees();

    // Set up a live subscription: instead of the student list only
    // updating when this screen reloads, Realtime pushes new rows to
    // us the instant a student checks in — no manual refresh needed.
    const channel = supabase
      .channel(`attendance-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // A new check-in just happened for this exact session.
          // Fetch that one student's profile so we can show their name,
          // then add them to the list on screen immediately.
          handleNewAttendance(payload.new);
        }
      )
      .subscribe();

    // Cleanup: stop listening when this screen is left, so we don't
    // leave the subscription running in the background forever.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  async function fetchSessionInfo() {
    // Just for the header — which module this live session belongs to.
    const { data } = await supabase
      .from('sessions')
      .select('modules(code)')
      .eq('id', sessionId)
      .single();
    setModuleCode(data?.modules?.code ?? 'Unknown module');
  }

  async function fetchAttendees() {
    setLoading(true);
    // Pull every attendance row for this session so far, joined to the
    // student's profile for their name and student number, ordered so
    // the earliest check-in shows first.
    const { data, error } = await supabase
      .from('attendance_records')
      .select('id, checked_in_at, profiles(full_name, student_number)')
      .eq('session_id', sessionId)
      .order('checked_in_at', { ascending: true });

    if (!error) setAttendees(data);
    setLoading(false);
  }

  async function handleNewAttendance(newRecord) {
    // The Realtime payload only gives us the raw attendance_records row —
    // it doesn't include the joined profile data. So we fetch that
    // student's name/number separately, then append them to the list.
    const { data } = await supabase
      .from('profiles')
      .select('full_name, student_number')
      .eq('id', newRecord.student_id)
      .single();

    setAttendees((current) => [
      ...current,
      { id: newRecord.id, checked_in_at: newRecord.checked_in_at, profiles: data },
    ]);
  }

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>{moduleCode} · Live</Text>

      {loading && <ActivityIndicator style={{ marginVertical: 16 }} />}

      {!loading && attendees.length === 0 && (
        <Text style={globalStyles.subtitle}>No check-ins yet.</Text>
      )}

      {attendees.map((record) => (
        <View key={record.id} style={globalStyles.card}>
          <Text style={{ fontWeight: '600' }}>{record.profiles?.full_name ?? 'Unknown student'}</Text>
          <Text style={globalStyles.subtitle}>
            {record.profiles?.student_number ?? ''} ·{' '}
            {new Date(record.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      ))}
    </View>
  );
}