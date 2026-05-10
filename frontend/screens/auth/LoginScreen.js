import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim())
      return Alert.alert('Error', 'Please enter email and password');
    setLoading(true);
    try {
      const data = await login(email.trim().toLowerCase(), password);
      if (data && data.role === 'admin') {
        await logout();
        Alert.alert('Admin Account', 'Please use the Admin Login page.',
          [{ text: 'Go to Admin Login', onPress: () => navigation.navigate('AdminLogin') }]);
      }
    } catch (err) {
      Alert.alert('Login Failed', err?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <View style={s.logoRing}>
            <Text style={s.logoEmoji}>🎬</Text>
          </View>
          <Text style={s.logoText}>CineBook</Text>
          <Text style={s.tagline}>Your Cinema Experience</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <Text style={s.cardSub}>Sign in to continue</Text>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Email</Text>
            <TextInput style={s.input} placeholder="you@email.com" placeholderTextColor={T.muted}
              value={email} onChangeText={setEmail} keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false} />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Password</Text>
            <TextInput style={s.input} placeholder="••••••••" placeholderTextColor={T.muted}
              value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.linkRow}>
            <Text style={s.linkText}>Don't have an account? </Text>
            <Text style={s.linkBold}>Create one</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.adminPill} onPress={() => navigation.navigate('AdminLogin')}>
          <Text style={s.adminPillText}>🔐  Admin Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: T.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 40 },
  logoRing: { width: 90, height: 90, borderRadius: 45, backgroundColor: T.surface, borderWidth: 2, borderColor: T.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoEmoji: { fontSize: 40 },
  logoText: { fontSize: 34, fontWeight: '800', color: T.primary, letterSpacing: 3 },
  tagline: { color: T.muted, marginTop: 6, fontSize: 13, letterSpacing: 0.5 },
  card: { backgroundColor: T.surface, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: T.border },
  cardTitle: { fontSize: 24, fontWeight: '700', color: T.text, marginBottom: 4 },
  cardSub: { color: T.muted, fontSize: 14, marginBottom: 28 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: T.subtle, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: T.elevated, color: T.text, borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: T.border },
  btn: { backgroundColor: T.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: T.muted, fontSize: 14 },
  linkBold: { color: T.primary, fontWeight: '700', fontSize: 14 },
  adminPill: { alignSelf: 'center', marginTop: 28, backgroundColor: T.surface, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: T.border },
  adminPillText: { color: T.subtle, fontSize: 13, fontWeight: '600' },
});
