import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../constants/AuthContext';
import { colors, globalStyles } from '../../constants/theme';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('student'); // visual toggle only — real role comes from the database after login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
  if (!email || !password) {
    setError('Please fill in both fields.');
    return;
  }
  setLoading(true);
  setError(null);

  try {
    const { error } = await login(email.trim(), password);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/');
  } catch (err) {
    setError(err.message || 'Something went wrong logging in.');
  } finally {
    setLoading(false);
  }
}

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Log in</Text>
      <Text style={globalStyles.subtitle}>Student number or lecturer email</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setMode('student')} style={{ marginRight: 16 }}>
          <Text style={{ color: mode === 'student' ? colors.accent : colors.textSecondary }}>
            ● Student
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('lecturer')}>
          <Text style={{ color: mode === 'lecturer' ? colors.accent : colors.textSecondary }}>
            ● Lecturer
          </Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={{ color: '#C0392B', marginBottom: 12, textAlign: 'center' }}>{error}</Text>}

      <TouchableOpacity style={globalStyles.button} onPress={handleLogin} disabled={loading}>
        <Text style={globalStyles.buttonText}>{loading ? 'Logging in...' : 'Log in'}</Text>
      </TouchableOpacity>

      <Link href="/signup" style={{ marginTop: 16, textAlign: 'center', color: colors.accent }}>
        Don't have an account? Sign up
      </Link>
    </View>
  );
}