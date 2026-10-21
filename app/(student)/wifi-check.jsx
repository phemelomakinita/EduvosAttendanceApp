import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../constants/AuthContext';
import { globalStyles } from '../../constants/theme';

// The network students are expected to be on. Change this if the real
// campus SSID is spelled differently.
const REQUIRED_SSID = 'Student-BYOD';

export default function WifiCheck() {
  const router = useRouter();
  const { logout } = useAuth();

  // 'checking' | 'connected' | 'wrong-network' | 'not-wifi' | 'cant-verify'
  const [status, setStatus] = useState('checking');
  const [detectedSsid, setDetectedSsid] = useState(null);

  useEffect(() => {
    checkNetwork();
  }, []);

  async function checkNetwork() {
    setStatus('checking');

    // On Android, reading the SSID requires location permission to be
    // granted first — without it, NetInfo returns a placeholder instead
    // of the real network name.
    if (Platform.OS === 'android') {
      await Location.requestForegroundPermissionsAsync();
    }

    const state = await NetInfo.fetch();

    if (state.type !== 'wifi') {
      setStatus('not-wifi');
      return;
    }

    const ssid = state.details?.ssid ?? null;
    setDetectedSsid(ssid);

    if (!ssid) {
      // This is the expected outcome on iOS in Expo Go — Apple doesn't
      // allow reading the SSID here. We can confirm "on Wi-Fi" but not
      // which network specifically.
      setStatus('cant-verify');
      return;
    }

    if (ssid === REQUIRED_SSID) {
      setStatus('connected');
    } else {
      setStatus('wrong-network');
    }
  }

  const canContinue = status === 'connected' || status === 'cant-verify';

  const statusConfig = {
    checking: { bg: '#F0F0F0', text: '#666', message: 'Checking your connection...' },
    connected: { bg: '#D4F4DD', text: '#1B873F', message: `Connected to ${REQUIRED_SSID}` },
    'cant-verify': {
      bg: '#FFF3CD',
      text: '#8A6D00',
      message: 'Network verification coming soon for iOS',
    },
    'wrong-network': {
      bg: '#FADBD8',
      text: '#C0392B',
      message: `Connected to "${detectedSsid}". Please connect to ${REQUIRED_SSID}.`,
    },
    'not-wifi': {
      bg: '#FADBD8',
      text: '#C0392B',
      message: `Not connected to Wi-Fi. Please connect to ${REQUIRED_SSID} to continue.`,
    },
  };

  const current = statusConfig[status];

  return (
    <View style={[globalStyles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons
        name="wifi"
        size={48}
        color={status === 'checking' ? '#999' : current.text}
        style={{ marginBottom: 16 }}
      />

      <Text style={[globalStyles.title, { fontSize: 20 }]}>Verifying Network</Text>

      <View
        style={{
          backgroundColor: current.bg,
          borderRadius: 10,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginVertical: 20,
          width: '100%',
        }}
      >
        {status === 'checking' ? (
          <ActivityIndicator color="#666" />
        ) : (
          <Text style={{ color: current.text, textAlign: 'center', fontWeight: '500' }}>
            {current.message}
          </Text>
        )}
      </View>

      {status !== 'checking' && !canContinue && (
        <TouchableOpacity style={[globalStyles.button, { marginBottom: 12 }]} onPress={checkNetwork}>
          <Text style={globalStyles.buttonText}>Try again</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[globalStyles.button, !canContinue && { backgroundColor: '#ccc' }]}
        disabled={!canContinue}
        onPress={() => router.push('/sessions')}
      >
        <Text style={[globalStyles.buttonText, !canContinue && { color: '#888' }]}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 24 }}
        onPress={async () => {
          await logout();
          router.replace('/');
        }}
      >
        <Text style={{ textAlign: 'center', color: 'red' }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}