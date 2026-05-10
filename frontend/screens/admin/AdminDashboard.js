import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#f59e0b', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', danger: '#e50914',
};

const StatCard = ({ icon, label, value, color }) => (
  <View style={[s.statCard, { borderTopColor: color }]}>
    <Text style={s.statIcon}>{icon}</Text>
    <Text style={[s.statValue, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ movies: 0, companies: 0, halls: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [m, c, h, b] = await Promise.all([
        api.get('/movies/all'), api.get('/companies'),
        api.get('/halls'), api.get('/bookings'),
      ]);
      setStats({ movies: m.data.length, companies: c.data.length, halls: h.data.length, bookings: b.data.length });
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={T.primary} /></View>;

  return (
    <ScrollView style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={T.primary} />}>

      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Admin Panel</Text>
          <Text style={s.greetingSub}>Welcome back, {user?.name}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={s.accountCard}>
        <View style={s.avatarWrap}>
          <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <View style={s.accountInfo}>
          <Text style={s.accountName}>{user?.name}</Text>
          <Text style={s.accountEmail}>{user?.email}</Text>
        </View>
        <View style={s.adminBadge}>
          <Text style={s.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Overview</Text>
      <View style={s.statsGrid}>
        <StatCard icon="🎬" label="Movies" value={stats.movies} color="#e50914" />
        <StatCard icon="🏢" label="Companies" value={stats.companies} color="#10b981" />
        <StatCard icon="🏟️" label="Halls" value={stats.halls} color={T.primary} />
        <StatCard icon="🎟️" label="Bookings" value={stats.bookings} color="#6366f1" />
      </View>

      <Text style={s.sectionTitle}>Quick Guide</Text>
      <View style={s.guideCard}>
        {[
          { icon: '🎬', text: 'Add and manage movies in the Movies tab' },
          { icon: '🏢', text: 'Manage cinema companies in Companies tab' },
          { icon: '📅', text: 'Assign movies to halls via Screenings tab' },
          { icon: '🎟️', text: 'View all user bookings in the Bookings tab' },
        ].map((item, i) => (
          <View key={i} style={s.guideRow}>
            <Text style={s.guideIcon}>{item.icon}</Text>
            <Text style={s.guideText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 12 },
  greeting: { fontSize: 22, fontWeight: '800', color: T.text },
  greetingSub: { color: T.muted, fontSize: 13, marginTop: 3 },
  logoutBtn: { backgroundColor: T.surface, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: T.border },
  logoutText: { color: T.danger, fontWeight: '700', fontSize: 13 },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: T.primary + '44' },
  avatarWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { color: '#000', fontSize: 22, fontWeight: '800' },
  accountInfo: { flex: 1 },
  accountName: { color: T.text, fontWeight: '700', fontSize: 16 },
  accountEmail: { color: T.muted, fontSize: 13, marginTop: 2 },
  adminBadge: { backgroundColor: T.primary + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: T.primary },
  adminBadgeText: { color: T.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { color: T.text, fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginTop: 24, marginBottom: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  statCard: { width: '46%', backgroundColor: T.surface, borderRadius: 16, padding: 18, margin: '2%', borderTopWidth: 3, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  statIcon: { fontSize: 28, marginBottom: 10 },
  statValue: { fontSize: 32, fontWeight: '800' },
  statLabel: { color: T.muted, fontSize: 12, marginTop: 4, fontWeight: '600' },
  guideCard: { backgroundColor: T.surface, borderRadius: 18, padding: 18, marginHorizontal: 16, borderWidth: 1, borderColor: T.border, gap: 14 },
  guideRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guideIcon: { fontSize: 20, width: 28 },
  guideText: { color: T.subtle, fontSize: 14, flex: 1, lineHeight: 20 },
});
