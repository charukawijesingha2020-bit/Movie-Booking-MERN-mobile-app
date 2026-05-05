import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = { primary: '#E50914', dark: '#141414', card: '#1a1a1a', input: '#2a2a2a', text: '#fff', muted: '#aaa' };

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert('Error', 'Please enter email and password');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>🎬</Text>
          <Text style={styles.logoText}>CineBook</Text>
          <Text style={styles.tagline}>Your Cinema Experience</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@cinema.com"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.dark },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoIcon: { fontSize: 64 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 2 },
  tagline: { color: COLORS.muted, marginTop: 4, fontSize: 14 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  subtitle: { color: COLORS.muted, marginBottom: 24, fontSize: 14 },
  label: { color: COLORS.muted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.input, color: COLORS.text, borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#333' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { color: COLORS.muted, fontSize: 14 },
  linkBold: { color: COLORS.primary, fontWeight: 'bold' },
});
