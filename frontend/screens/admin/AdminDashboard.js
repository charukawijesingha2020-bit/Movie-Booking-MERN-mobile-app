import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
        api.get('/movies/all'),
        api.get('/companies'),
        api.get('/halls'),
        api.get('/bookings'),
      ]);
      setStats({ movies: m.data.length, companies: c.data.length, halls: h.data.length, bookings: b.data.length });
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  const totalRevenue = 0; // Could compute from bookings if needed

  return (
    <ScrollView style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#E50914" />}>
      {/* Admin Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Admin Panel 🎬</Text>
          <Text style={s.subGreeting}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>📊 Overview</Text>
      <View style={s.statsGrid}>
        <StatCard icon="🎬" label="Movies" value={stats.movies} color="#E50914" />
        <StatCard icon="🏢" label="Companies" value={stats.companies} color="#2a9d8f" />
        <StatCard icon="🏟️" label="Halls" value={stats.halls} color="#e9c46a" />
        <StatCard icon="🎟️" label="Bookings" value={stats.bookings} color="#a8dadc" />
      </View>

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>⚡ Quick Info</Text>
      <View style={s.infoCard}>
        <Text style={s.infoText}>• Use the tabs below to manage Movies, Companies, Halls and Screenings.</Text>
        <Text style={s.infoText}>• Assign movies to halls via the <Text style={s.infoHighlight}>Screenings</Text> tab.</Text>
        <Text style={s.infoText}>• View all user bookings in the <Text style={s.infoHighlight}>Bookings</Text> tab.</Text>
        <Text style={s.infoText}>• Reply to user reviews from the <Text style={s.infoHighlight}>Reviews</Text> section.</Text>
      </View>

      <Text style={s.sectionTitle}>👤 Admin Account</Text>
      <View style={s.accountCard}>
        <View style={s.accountAvatar}><Text style={s.accountAvatarText}>A</Text></View>
        <View>
          <Text style={s.accountName}>{user?.name}</Text>
          <Text style={s.accountEmail}>{user?.email}</Text>
          <View style={s.adminBadge}><Text style={s.adminBadgeText}>ADMINISTRATOR</Text></View>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subGreeting: { color: '#aaa', fontSize: 13, marginTop: 2 },
  logoutBtn: { backgroundColor: '#2a2a2a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#E50914', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  statCard: { width: '46%', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, margin: '2%', borderTopWidth: 3, alignItems: 'center' },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 30, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },
  infoCard: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginHorizontal: 16, gap: 8 },
  infoText: { color: '#aaa', fontSize: 13, lineHeight: 22 },
  infoHighlight: { color: '#E50914', fontWeight: 'bold' },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginHorizontal: 16 },
  accountAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E50914', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  accountAvatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  accountName: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  accountEmail: { color: '#aaa', fontSize: 13, marginTop: 2 },
  adminBadge: { backgroundColor: '#2a2a2a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-start' },
  adminBadgeText: { color: '#E50914', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
});
