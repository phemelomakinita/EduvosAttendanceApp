import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../constants/AuthContext';
import { globalStyles } from '../../constants/theme';

export default function WifiCheck() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Verifying network</Text>
      <Text style={globalStyles.subtitle}>(WiFi check logic comes later)</Text>

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 16 }]}
        onPress={() => router.push('/sessions')}
      >
        <Text style={globalStyles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 24 }} onPress={async () => { await logout(); 
        router.replace('/');
        }}
      >
        <Text style={{ textAlign: 'center', color: 'red' }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}