import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
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

  const inputRow = (field) => [s.inputRow, focused === field && s.inputRowFocused];
  const iconColor = (field) => focused === field ? T.primary : T.muted;

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        {/* Decorative background circles */}
        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />

        <View style={s.hero}>
          <View style={s.logoRing}>
            <Ionicons name="film" size={42} color={T.primary} />
          </View>
          <Text style={s.logoText}>CineBook</Text>
          <Text style={s.tagline}>Your Cinema Experience</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Welcome back</Text>
          <Text style={s.cardSub}>Sign in to continue</Text>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Email</Text>
            <View style={inputRow('email')}>
              <Ionicons name="mail-outline" size={18} color={iconColor('email')} style={s.inputIcon} />
              <TextInput
                style={s.inputInner}
                placeholder="you@email.com"
                placeholderTextColor={T.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Password</Text>
            <View style={inputRow('password')}>
              <Ionicons name="lock-closed-outline" size={18} color={iconColor('password')} style={s.inputIcon} />
              <TextInput
                style={s.inputInner}
                placeholder="••••••••"
                placeholderTextColor={T.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={s.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.muted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={s.btnSheen} />
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={s.btnInner}>
                <Text style={s.btnText}>Sign In</Text>
                <Ionicons name="arrow-forward-circle" size={20} color="rgba(255,255,255,0.7)" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.linkRow}>
            <Text style={s.linkText}>Don't have an account? </Text>
            <Text style={s.linkBold}>Create one</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.adminPill} onPress={() => navigation.navigate('AdminLogin')}>
          <Ionicons name="shield-outline" size={14} color={T.subtle} />
          <Text style={s.adminPillText}>Admin Login</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: T.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  bgCircle1: { position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: T.primary + '08' },
  bgCircle2: { position: 'absolute', bottom: 40, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6366f108' },

  hero: { alignItems: 'center', marginBottom: 40 },
  logoRing: { width: 90, height: 90, borderRadius: 45, backgroundColor: T.surface, borderWidth: 2, borderColor: T.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: T.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  logoText: { fontSize: 34, fontWeight: '800', color: T.primary, letterSpacing: 3 },
  tagline: { color: T.muted, marginTop: 6, fontSize: 13, letterSpacing: 0.5 },

  card: { backgroundColor: T.surface, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: T.border },
  cardTitle: { fontSize: 24, fontWeight: '700', color: T.text, marginBottom: 4 },
  cardSub: { color: T.muted, fontSize: 14, marginBottom: 28 },

  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: T.subtle, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.elevated, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  inputRowFocused: { borderColor: T.primary },
  inputIcon: { paddingLeft: 14 },
  inputInner: { flex: 1, color: T.text, fontSize: 15, paddingHorizontal: 12, paddingVertical: 14 },
  eyeBtn: { paddingRight: 14 },

  btn: { backgroundColor: T.primary, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 8, overflow: 'hidden', shadowColor: T.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  btnDisabled: { opacity: 0.6 },
  btnSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.08)', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: T.muted, fontSize: 14 },
  linkBold: { color: T.primary, fontWeight: '700', fontSize: 14 },

  adminPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 28, backgroundColor: T.surface, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: T.border },
  adminPillText: { color: T.subtle, fontSize: 13, fontWeight: '600' },
});