import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24',
};

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
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={T.primary} />
    </View>
  );

  return (
    <ScrollView style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={T.primary} />}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.greetingSub}>What are you watching today?</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={s.banner}>
        <View style={s.bannerBadge}><Text style={s.bannerBadgeText}>NOW SHOWING</Text></View>
        <Text style={s.bannerTitle}>Book Your Seats</Text>
        <Text style={s.bannerSub}>Before they fill up!</Text>
      </View>

      {/* Featured Movies */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Featured Movies</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Movies')}>
          <Text style={s.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {movies.map(item => (
          <TouchableOpacity key={item._id} style={s.movieCard}
            onPress={() => navigation.navigate('MovieDetail', { movieId: item._id })}>
            <Image source={{ uri: item.poster || 'https://via.placeholder.com/120x180?text=No+Image' }}
              style={s.moviePoster} resizeMode="cover" />
            <View style={s.ratingPill}>
              <Text style={s.ratingText}>⭐ {item.rating}</Text>
            </View>
            <View style={s.movieInfo}>
              <Text style={s.movieTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.movieMeta} numberOfLines={1}>{item.genre?.[0]} • {item.duration}m</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cinema Companies */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Cinemas Near You</Text>
      </View>

      {companies.map(company => (
        <TouchableOpacity key={company._id} style={s.companyCard}
          onPress={() => navigation.navigate('CompanyDetail', { companyId: company._id, companyName: company.name })}>
          <View style={s.companyAvatar}>
            <Text style={s.companyAvatarText}>{company.name.charAt(0)}</Text>
          </View>
          <View style={s.companyInfo}>
            <Text style={s.companyName}>{company.name}</Text>
            <Text style={s.companyAddress} numberOfLines={1}>📍 {company.address}</Text>
            {company.phone ? <Text style={s.companyPhone}>📞 {company.phone}</Text> : null}
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 24 }} />
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
  logoutText: { color: T.primary, fontWeight: '700', fontSize: 13 },
  banner: { marginHorizontal: 16, marginBottom: 8, backgroundColor: T.primary, borderRadius: 20, padding: 24 },
  bannerBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  bannerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  bannerSub: { color: 'rgba(255,255,255,0.75)', marginTop: 4, fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 28, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.text },
  seeAll: { color: T.primary, fontSize: 13, fontWeight: '600' },
  movieCard: { width: 140, backgroundColor: T.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  moviePoster: { width: 140, height: 196 },
  ratingPill: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  ratingText: { color: T.gold, fontSize: 11, fontWeight: '700' },
  movieInfo: { padding: 10 },
  movieTitle: { color: T.text, fontWeight: '700', fontSize: 13 },
  movieMeta: { color: T.muted, fontSize: 11, marginTop: 3 },
  companyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, marginHorizontal: 16, marginBottom: 10, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: T.border },
  companyAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  companyAvatarText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  companyInfo: { flex: 1 },
  companyName: { color: T.text, fontWeight: '700', fontSize: 16 },
  companyAddress: { color: T.muted, fontSize: 12, marginTop: 3 },
  companyPhone: { color: T.muted, fontSize: 11, marginTop: 2 },
  chevron: { color: T.muted, fontSize: 26, fontWeight: '300' },
});
