import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8',
};

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim())
      return Alert.alert('Error', 'All fields are required');
    if (password !== confirm)
      return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Registration Failed', err?.message || 'Something went wrong');
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
          <Text style={s.tagline}>Join the cinema experience</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Create Account</Text>
          <Text style={s.cardSub}>Fill in your details to get started</Text>

          {[
            { label: 'Full Name', value: name, setter: setName, placeholder: 'John Doe' },
            { label: 'Email', value: email, setter: setEmail, placeholder: 'you@email.com', keyboard: 'email-address', caps: 'none' },
            { label: 'Password', value: password, setter: setPassword, placeholder: 'Min. 6 characters', secure: true },
            { label: 'Confirm Password', value: confirm, setter: setConfirm, placeholder: 'Repeat password', secure: true },
          ].map(f => (
            <View key={f.label} style={s.fieldWrap}>
              <Text style={s.fieldLabel}>{f.label}</Text>
              <TextInput style={s.input} placeholder={f.placeholder} placeholderTextColor={T.muted}
                value={f.value} onChangeText={f.setter} secureTextEntry={f.secure}
                keyboardType={f.keyboard || 'default'} autoCapitalize={f.caps || 'words'} />
            </View>
          ))}

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
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
  hero: { alignItems: 'center', marginBottom: 40 },
  logoRing: { width: 90, height: 90, borderRadius: 45, backgroundColor: T.surface, borderWidth: 2, borderColor: T.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoEmoji: { fontSize: 40 },
  logoText: { fontSize: 34, fontWeight: '800', color: T.primary, letterSpacing: 3 },
  tagline: { color: T.muted, marginTop: 6, fontSize: 13, letterSpacing: 0.5 },
  card: { backgroundColor: T.surface, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: T.border },
  cardTitle: { fontSize: 24, fontWeight: '700', color: T.text, marginBottom: 4 },
  cardSub: { color: T.muted, fontSize: 14, marginBottom: 24 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { color: T.subtle, fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: T.elevated, color: T.text, borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: T.border },
  btn: { backgroundColor: T.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: T.muted, fontSize: 14 },
  linkBold: { color: T.primary, fontWeight: '700', fontSize: 14 },
});
