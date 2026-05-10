import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#f59e0b', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', danger: '#e50914',
};

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();

  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim())
      return Alert.alert('Error', 'Please enter email and password');
    setLoading(true);
    try {
      const data = await login(email.trim().toLowerCase(), password);
      if (data && data.role !== 'admin') {
        await logout();
        Alert.alert('Access Denied', 'This account does not have admin privileges.');
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
            <Text style={s.logoEmoji}>🛡️</Text>
          </View>
          <Text style={s.logoText}>Admin Panel</Text>
          <View style={s.restrictedBadge}>
            <Text style={s.restrictedText}>RESTRICTED ACCESS</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Administrator Login</Text>
          <Text style={s.cardSub}>Authorized personnel only</Text>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Admin Email</Text>
            <TextInput style={s.input} placeholder="admin@email.com" placeholderTextColor={T.muted}
              value={email} onChangeText={setEmail} keyboardType="email-address"
              autoCapitalize="none" autoCorrect={false} />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Password</Text>
            <TextInput style={s.input} placeholder="••••••••" placeholderTextColor={T.muted}
              value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleAdminLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnText}>Sign In as Admin</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.backPill} onPress={() => navigation.navigate('Login')}>
          <Text style={s.backPillText}>👤  User Login</Text>
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
  logoText: { fontSize: 30, fontWeight: '800', color: T.primary, letterSpacing: 2, marginBottom: 12 },
  restrictedBadge: { backgroundColor: T.primary + '22', borderWidth: 1, borderColor: T.primary, borderRadius: 30, paddingHorizontal: 16, paddingVertical: 5 },
  restrictedText: { color: T.primary, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  card: { backgroundColor: T.surface, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: T.border },
  cardTitle: { fontSize: 22, fontWeight: '700', color: T.text, marginBottom: 4 },
  cardSub: { color: T.muted, fontSize: 14, marginBottom: 28 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: T.subtle, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: T.elevated, color: T.text, borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: T.border },
  btn: { backgroundColor: T.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  backPill: { alignSelf: 'center', marginTop: 28, backgroundColor: T.surface, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: T.border },
  backPillText: { color: T.subtle, fontSize: 13, fontWeight: '600' },
});
