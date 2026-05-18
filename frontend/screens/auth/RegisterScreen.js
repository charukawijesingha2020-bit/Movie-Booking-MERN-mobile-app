import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const T = {
  bg: '#000000', surface: '#0d1b2a', elevated: '#0f2840',
  border: '#1a3a5c', primary: '#1e56a0', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', success: '#10b981',
};

const FIELDS = [
  { key: 'name',    label: 'Full Name',        placeholder: 'John Doe',           icon: 'person-outline',   keyboard: 'default',       caps: 'words',  secure: false },
  { key: 'email',   label: 'Email',            placeholder: 'you@email.com',      icon: 'mail-outline',     keyboard: 'email-address', caps: 'none',   secure: false },
  { key: 'password',label: 'Password',         placeholder: 'Min. 6 characters',  icon: 'lock-closed-outline', keyboard: 'default',    caps: 'none',   secure: true  },
  { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat password',    icon: 'shield-checkmark-outline', keyboard: 'default', caps: 'none', secure: true  },
];

export default function RegisterScreen({ navigation }) {
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState({ password: false, confirm: false });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const set = (key) => (val) => setValues(v => ({ ...v, [key]: val }));

  const passStrength = () => {
    const p = values.password;
    if (p.length === 0) return 0;
    if (p.length < 6) return 1;
    if (p.length < 10) return 2;
    return 3;
  };

  const strengthColor = ['#1a3a5c', T.primary, '#f59e0b', T.success];
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'];

  const handleRegister = async () => {
    if (!values.name.trim() || !values.email.trim() || !values.password.trim())
      return Alert.alert('Error', 'All fields are required');
    if (values.password !== values.confirm)
      return Alert.alert('Error', 'Passwords do not match');
    if (values.password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(values.name.trim(), values.email.trim().toLowerCase(), values.password);
    } catch (err) {
      Alert.alert('Registration Failed', err?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const strength = passStrength();

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.bgCircle1} />
        <View style={s.bgCircle2} />

        <View style={s.hero}>
          <View style={s.logoRing}>
            <Ionicons name="film" size={42} color={T.primary} />
          </View>
          <Text style={s.logoText}>CineBook</Text>
          <Text style={s.tagline}>Join the cinema experience</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Create Account</Text>
          <Text style={s.cardSub}>Fill in your details to get started</Text>

          {FIELDS.map(f => (
            <View key={f.key} style={s.fieldWrap}>
              <Text style={s.fieldLabel}>{f.label}</Text>
              <View style={[s.inputRow, focused === f.key && s.inputRowFocused]}>
                <Ionicons
                  name={f.icon}
                  size={18}
                  color={focused === f.key ? T.primary : T.muted}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.inputInner}
                  placeholder={f.placeholder}
                  placeholderTextColor={T.muted}
                  value={values[f.key]}
                  onChangeText={set(f.key)}
                  secureTextEntry={f.secure && !showPass[f.key]}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.caps}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused(null)}
                />
                {f.secure && (
                  <TouchableOpacity onPress={() => setShowPass(p => ({ ...p, [f.key]: !p[f.key] }))} style={s.eyeBtn}>
                    <Ionicons name={showPass[f.key] ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.muted} />
                  </TouchableOpacity>
                )}
              </View>
              {f.key === 'password' && values.password.length > 0 && (
                <View style={s.strengthWrap}>
                  <View style={s.strengthBar}>
                    {[1, 2, 3].map(i => (
                      <View key={i} style={[s.strengthSegment, { backgroundColor: i <= strength ? strengthColor[strength] : T.border }]} />
                    ))}
                  </View>
                  <Text style={[s.strengthLabel, { color: strengthColor[strength] }]}>{strengthLabel[strength]}</Text>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={s.btnSheen} />
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={s.btnInner}>
                <Text style={s.btnText}>Create Account</Text>
                <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.7)" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.linkRow}>
            <Text style={s.linkText}>Already have an account? </Text>
            <Text style={s.linkBold}>Sign In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: T.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  bgCircle1: { position: 'absolute', top: -60, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: T.primary + '07' },
  bgCircle2: { position: 'absolute', bottom: 60, left: -70, width: 180, height: 180, borderRadius: 90, backgroundColor: '#6366f108' },

  hero: { alignItems: 'center', marginBottom: 36 },
  logoRing: { width: 90, height: 90, borderRadius: 45, backgroundColor: T.surface, borderWidth: 2, borderColor: T.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: T.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  logoText: { fontSize: 34, fontWeight: '800', color: T.primary, letterSpacing: 3 },
  tagline: { color: T.muted, marginTop: 6, fontSize: 13, letterSpacing: 0.5 },

  card: { backgroundColor: T.surface, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: T.border },
  cardTitle: { fontSize: 24, fontWeight: '700', color: T.text, marginBottom: 4 },
  cardSub: { color: T.muted, fontSize: 14, marginBottom: 24 },

  fieldWrap: { marginBottom: 14 },
  fieldLabel: { color: T.subtle, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.elevated, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  inputRowFocused: { borderColor: T.primary },
  inputIcon: { paddingLeft: 14 },
  inputInner: { flex: 1, color: T.text, fontSize: 15, paddingHorizontal: 12, paddingVertical: 14 },
  eyeBtn: { paddingRight: 14 },

  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 3, borderRadius: 4 },
  strengthLabel: { fontSize: 11, fontWeight: '700', width: 40, textAlign: 'right' },

  btn: { backgroundColor: T.primary, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 10, overflow: 'hidden', shadowColor: T.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  btnDisabled: { opacity: 0.6 },
  btnSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.08)', borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: T.muted, fontSize: 14 },
  linkBold: { color: T.primary, fontWeight: '700', fontSize: 14 },
});
