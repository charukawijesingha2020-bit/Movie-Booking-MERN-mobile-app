import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#f5a623',
  dark: '#0d0d0d',
  card: '#161616',
  input: '#222222',
  text: '#fff',
  muted: '#888',
  border: '#2e2e2e',
  danger: '#E50914',
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
        // Not an admin — log them out and show error
        await logout();
        Alert.alert('Access Denied', 'This account does not have admin privileges.');
      }
    } catch (err) {
      Alert.alert('Login Failed', err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.logoText}>Admin Panel</Text>
          <Text style={styles.tagline}>CineBook Administration</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ADMIN ACCESS</Text>
            </View>
          </View>

          <Text style={styles.title}>Administrator Login</Text>
          <Text style={styles.subtitle}>Restricted to authorized personnel only</Text>

          <Text style={styles.label}>Admin Email</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@cinema.com"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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

          <TouchableOpacity style={styles.btn} onPress={handleAdminLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.btnText}>Sign In as Admin</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Back to User Login */}
        <TouchableOpacity style={styles.userLinkWrap} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.userLinkText}>👤 Regular user? <Text style={styles.userLinkBold}>User Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.dark },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  shieldIcon: { fontSize: 64 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 2, marginTop: 8 },
  tagline: { color: COLORS.muted, marginTop: 4, fontSize: 14 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
  },
  badgeRow: { alignItems: 'center', marginBottom: 16 },
  badge: {
    backgroundColor: COLORS.primary + '22',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 11, letterSpacing: 1.5 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 4, textAlign: 'center' },
  subtitle: { color: COLORS.muted, marginBottom: 24, fontSize: 13, textAlign: 'center' },
  label: { color: COLORS.muted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.input,
    color: COLORS.text,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  userLinkWrap: {
    marginTop: 24,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#161616',
  },
  userLinkText: { color: COLORS.muted, fontSize: 14 },
  userLinkBold: { color: '#E50914', fontWeight: 'bold' },
});
