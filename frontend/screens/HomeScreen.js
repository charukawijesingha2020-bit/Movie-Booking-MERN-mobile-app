import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const POSTER_PLACEHOLDER = 'https://via.placeholder.com/120x180?text=No+Image';
const PosterImage = ({ uri, style }) => {
  const [error, setError] = React.useState(false);
  return (
    <Image
      source={{ uri: error || !uri ? POSTER_PLACEHOLDER : uri }}
      style={style}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
};

const T = {
  bg: '#000000', surface: '#0d1b2a', elevated: '#0f2840',
  border: '#1a3a5c', primary: '#1e56a0', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24', success: '#10b981',
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

  const firstName = user?.name?.split(' ')[0];
  const [avatarError, setAvatarError] = React.useState(false);
  const AVATAR_URL = 'https://lh4.googleusercontent.com/proxy/jTL6IVbQ8pwKvriiE3zj_ua7Dem8b6Tn5B06I82jPKSzpT8ZV0R34dOFqAIGFiB_wbC0BhOiE8lDN4qytsOHCmsE3pys6CKJhuuesBqgq1PM28HF';

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={T.primary} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          {avatarError ? (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{firstName?.charAt(0)?.toUpperCase()}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: AVATAR_URL }}
              style={s.avatar}
              onError={() => setAvatarError(true)}
            />
          )}
          <View>
            <Text style={s.greeting}>Hey, {firstName} 👋</Text>
            <Text style={s.greetingSub}>What are you watching today?</Text>
          </View>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={16} color={T.primary} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bauinner */}
      <View style={s.banner}>
        <View style={s.bannerGlow} />
        <View style={s.bannerBadge}>
          <Ionicons name="film-outline" size={11} color="#fff" />
          <Text style={s.bannerBadgeText}>NOW SHOWING</Text>
        </View>
        <Text style={s.bannerTitle}>Book Your Seats</Text>
        <Text style={s.bannerSub}>Before they fill up!</Text>
        <TouchableOpacity style={s.bannerBtn} onPress={() => navigation.navigate('Movies')}>
          <Text style={s.bannerBtnText}>Browse Movies</Text>
          <Ionicons name="arrow-forward" size={14} color={T.primary} />
        </TouchableOpacity>
      </View>

      {/* Quick actions */}
      <View style={s.quickRow}>
        {[
          { icon: 'ticket-outline', label: 'My Tickets', screen: 'MyBookings', color: T.success },
          { icon: 'star-outline',   label: 'Reviews',    screen: 'Feedbacks',  color: T.gold },
          { icon: 'search-outline', label: 'Search',     screen: 'Movies',     color: '#6366f1' },
        ].map(({ icon, label, screen, color }) => (
          <TouchableOpacity key={label} style={s.quickItem} onPress={() => navigation.navigate(screen)}>
            <View style={[s.quickIcon, { borderColor: color + '40', backgroundColor: color + '15' }]}>
              <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={s.quickLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Movies */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Featured Movies</Text>
        <TouchableOpacity style={s.seeAllBtn} onPress={() => navigation.navigate('Movies')}>
          <Text style={s.seeAll}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={T.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {movies.map(item => (
          <TouchableOpacity key={item._id} style={s.movieCard}
            onPress={() => navigation.navigate('MovieDetail', { movieId: item._id })}>
            <PosterImage uri={item.poster} style={s.moviePoster} />
            <View style={s.posterOverlay} />
            <View style={s.ratingPill}>
              <Ionicons name="star" size={10} color={T.gold} />
              <Text style={s.ratingText}>{item.rating}</Text>
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
        <View style={s.countBadge}>
          <Text style={s.countText}>{companies.length}</Text>
        </View>
      </View>

      {companies.map(company => (
        <TouchableOpacity key={company._id} style={s.companyCard}
          onPress={() => navigation.navigate('CompanyDetail', { companyId: company._id, companyName: company.name })}>
          <View style={s.companyAvatar}>
            <Text style={s.companyAvatarText}>{company.name.charAt(0)}</Text>
          </View>
          <View style={s.companyInfo}>
            <Text style={s.companyName}>{company.name}</Text>
            <View style={s.companyMeta}>
              <Ionicons name="location-outline" size={12} color={T.muted} />
              <Text style={s.companyAddress} numberOfLines={1}>{company.address}</Text>
            </View>
            {company.phone ? (
              <View style={s.companyMeta}>
                <Ionicons name="call-outline" size={12} color={T.muted} />
                <Text style={s.companyPhone}>{company.phone}</Text>
              </View>
            ) : null}
          </View>
          <View style={s.chevronWrap}>
            <Ionicons name="chevron-forward" size={20} color={T.muted} />
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  greeting: { fontSize: 18, fontWeight: '800', color: T.text },
  greetingSub: { color: T.muted, fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.surface, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: T.border },
  logoutText: { color: T.primary, fontWeight: '700', fontSize: 13 },

  banner: { marginHorizontal: 16, marginBottom: 16, backgroundColor: T.primary, borderRadius: 20, padding: 22, overflow: 'hidden' },
  bannerGlow: { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.08)' },
  bannerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  bannerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  bannerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  bannerSub: { color: 'rgba(255,255,255,0.75)', marginTop: 4, fontSize: 14, marginBottom: 16 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  bannerBtnText: { color: T.primary, fontWeight: '700', fontSize: 13 },

  quickRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 8, backgroundColor: T.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: T.border },
  quickItem: { alignItems: 'center', gap: 8 },
  quickIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  quickLabel: { color: T.subtle, fontSize: 11, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 26, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: T.text },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { color: T.primary, fontSize: 13, fontWeight: '600' },
  countBadge: { backgroundColor: T.primary + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { color: T.primary, fontWeight: '700', fontSize: 12 },

  movieCard: { width: 140, backgroundColor: T.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  moviePoster: { width: 140, height: 196 },
  posterOverlay: { position: 'absolute', bottom: 52, left: 0, right: 0, height: 40, backgroundColor: 'transparent' },
  ratingPill: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  ratingText: { color: T.gold, fontSize: 11, fontWeight: '700' },
  movieInfo: { padding: 10 },
  movieTitle: { color: T.text, fontWeight: '700', fontSize: 13 },
  movieMeta: { color: T.muted, fontSize: 11, marginTop: 3 },

  companyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, marginHorizontal: 16, marginBottom: 10, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: T.border },
  companyAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  companyAvatarText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  companyInfo: { flex: 1, gap: 3 },
  companyName: { color: T.text, fontWeight: '700', fontSize: 16 },
  companyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  companyAddress: { color: T.muted, fontSize: 12, flex: 1 },
  companyPhone: { color: T.muted, fontSize: 11 },
  chevronWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: T.elevated, justifyContent: 'center', alignItems: 'center' },
});