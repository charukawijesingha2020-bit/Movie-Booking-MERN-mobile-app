import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#f59e0b', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', danger: '#e50914',
};

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(null);
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

  const inputRow = (field) => [s.inputRow, focused === field && s.inputRowFocused];
  const iconColor = (field) => focused === field ? T.primary : T.muted;

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />

        {/* Warning stripe */}
        <View style={s.warningStripe}>
          <Ionicons name="warning-outline" size={13} color={T.primary} />
          <Text style={s.warningText}>RESTRICTED AREA — AUTHORIZED PERSONNEL ONLY</Text>
        </View>

        <View style={s.hero}>
          <View style={s.logoRing}>
            <Ionicons name="shield" size={42} color={T.primary} />
          </View>
          <Text style={s.logoText}>Admin Panel</Text>
          <View style={s.restrictedBadge}>
            <Ionicons name="lock-closed" size={11} color={T.primary} />
            <Text style={s.restrictedText}>RESTRICTED ACCESS</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Administrator Login</Text>
          <Text style={s.cardSub}>Authorized personnel only</Text>

          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Admin Email</Text>
            <View style={inputRow('email')}>
              <Ionicons name="mail-outline" size={18} color={iconColor('email')} style={s.inputIcon} />
              <TextInput
                style={s.inputInner}
                placeholder="admin@email.com"
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
            onPress={handleAdminLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={s.btnSheen} />
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <View style={s.btnInner}>
                <Ionicons name="shield-checkmark" size={18} color="#000" />
                <Text style={s.btnText}>Sign In as Admin</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.backPill} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="person-outline" size={14} color={T.subtle} />
          <Text style={s.backPillText}>User Login</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: T.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  bgCircle1: { position: 'absolute', top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: T.primary + '07' },
  bgCircle2: { position: 'absolute', bottom: 60, left: -70, width: 180, height: 180, borderRadius: 90, backgroundColor: T.danger + '06' },

  warningStripe: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: T.primary + '15', borderRadius: 10, padding: 10, marginBottom: 28, borderWidth: 1, borderColor: T.primary + '30' },
  warningText: { color: T.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },

  hero: { alignItems: 'center', marginBottom: 36 },
  logoRing: { width: 90, height: 90, borderRadius: 45, backgroundColor: T.surface, borderWidth: 2, borderColor: T.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: T.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  logoText: { fontSize: 30, fontWeight: '800', color: T.primary, letterSpacing: 2, marginBottom: 12 },
  restrictedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.primary + '22', borderWidth: 1, borderColor: T.primary, borderRadius: 30, paddingHorizontal: 16, paddingVertical: 5 },
  restrictedText: { color: T.primary, fontSize: 11, fontWeight: '700', letterSpacing: 2 },

  card: { backgroundColor: T.surface, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: T.border },
  cardTitle: { fontSize: 22, fontWeight: '700', color: T.text, marginBottom: 4 },
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
  btnSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },

  backPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 28, backgroundColor: T.surface, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: T.border },
  backPillText: { color: T.subtle, fontSize: 13, fontWeight: '600' },
});