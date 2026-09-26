import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../constants/AuthContext';

export default function Index() {
  const { isLoggedIn, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;
  if (role === 'lecturer') return <Redirect href="/(lecturer)/my-sessions" />;
  return <Redirect href="/(student)/wifi-check" />;
}