import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const C = { primary: '#E50914', dark: '#141414', card: '#1a1a1a', card2: '#222', text: '#fff', muted: '#aaa', border: '#333' };

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [c, m] = await Promise.all([api.get('/companies'), api.get('/movies')]);
      setCompanies(c.data);
      setMovies(m.data.slice(0, 6));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /></View>;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.primary} />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>What are you watching today?</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>🎬 Now Showing</Text>
        <Text style={styles.bannerSub}>Book your seats before they fill up!</Text>
      </View>

      {/* Featured Movies */}
      <Text style={styles.sectionTitle}>🔥 Featured Movies</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {movies.map(item => (
          <TouchableOpacity key={item._id} style={styles.movieCard} onPress={() => navigation.navigate('MovieDetail', { movieId: item._id })}>
            <Image source={{ uri: item.poster || 'https://via.placeholder.com/120x180?text=No+Image' }}
              style={styles.moviePoster} resizeMode="cover" />
            <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.movieMeta}>{item.genre?.[0]} • {item.duration}min</Text>
            <View style={styles.ratingBadge}><Text style={styles.ratingText}>{item.rating}</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cinema Companies */}
      <Text style={styles.sectionTitle}>🏢 Cinema Companies</Text>
      {companies.map(company => (
        <TouchableOpacity key={company._id} style={styles.companyCard}
          onPress={() => navigation.navigate('CompanyDetail', { companyId: company._id, companyName: company.name })}>
          <View style={styles.companyIcon}>
            <Text style={styles.companyIconText}>{company.name.charAt(0)}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companyAddress} numberOfLines={1}>{company.address}</Text>
            {company.phone ? <Text style={styles.companyPhone}>{company.phone}</Text> : null}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.dark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: C.text },
  subGreeting: { color: C.muted, fontSize: 13, marginTop: 2 },
  logoutBtn: { backgroundColor: '#2a2a2a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: C.primary, fontWeight: 'bold', fontSize: 13 },
  banner: { marginHorizontal: 16, marginBottom: 8, backgroundColor: C.primary, borderRadius: 14, padding: 20 },
  bannerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4, fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: C.text, marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  movieCard: { width: 130, marginRight: 12, backgroundColor: C.card, borderRadius: 12, overflow: 'hidden' },
  moviePoster: { width: 130, height: 180 },
  movieTitle: { color: C.text, fontWeight: '600', fontSize: 13, padding: 8, paddingBottom: 2 },
  movieMeta: { color: C.muted, fontSize: 11, paddingHorizontal: 8, paddingBottom: 8 },
  ratingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  ratingText: { color: '#ffd700', fontSize: 10, fontWeight: 'bold' },
  companyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border },
  companyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  companyIconText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  companyInfo: { flex: 1 },
  companyName: { color: C.text, fontWeight: 'bold', fontSize: 16 },
  companyAddress: { color: C.muted, fontSize: 12, marginTop: 2 },
  companyPhone: { color: C.muted, fontSize: 11, marginTop: 2 },
  chevron: { color: C.muted, fontSize: 24 },
});
