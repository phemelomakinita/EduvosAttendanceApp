import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../constants/AuthContext';
import { globalStyles } from '../../constants/theme';

export default function Signup() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name || !surname || !studentNumber || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await signUp(email.trim(), password, {
      full_name: `${name.trim()} ${surname.trim()}`,
      role: 'student',
      student_number: studentNumber.trim(),
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/');
  }

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Create account</Text>
      <Text style={globalStyles.subtitle}>For student demo accounts</Text>

      <TextInput style={globalStyles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={globalStyles.input} placeholder="Surname" value={surname} onChangeText={setSurname} />
      <TextInput
        style={globalStyles.input}
        placeholder="Student number"
        value={studentNumber}
        onChangeText={setStudentNumber}
      />
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

      {error && <Text style={{ color: '#C0392B', marginBottom: 12, textAlign: 'center' }}>{error}</Text>}

      <TouchableOpacity style={globalStyles.button} onPress={handleSignup} disabled={loading}>
        <Text style={globalStyles.buttonText}>{loading ? 'Creating account...' : 'Create account'}</Text>
      </TouchableOpacity>

      <Link href="/login" style={{ marginTop: 16, textAlign: 'center', color: '#1F3864' }}>
        Already have an account? Log in
      </Link>
    </View>
  );
}