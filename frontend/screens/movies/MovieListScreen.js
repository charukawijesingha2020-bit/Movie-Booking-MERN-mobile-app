import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24',
};

export default function MovieListScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = async () => {
    try {
      const { data } = await api.get('/movies');
      setMovies(data);
      setFiltered(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(movies.filter(m =>
      m.title.toLowerCase().includes(q) || m.genre?.join(' ').toLowerCase().includes(q)
    ));
  }, [search, movies]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={T.primary} /></View>;

  return (
    <View style={s.container}>
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search movies or genres..."
          placeholderTextColor={T.muted} value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 14 }}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMovies(); }} tintColor={T.primary} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🎬</Text>
            <Text style={s.emptyText}>No movies found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('MovieDetail', { movieId: item._id })}>
            <Image source={{ uri: item.poster || 'https://via.placeholder.com/160x220?text=No+Poster' }}
              style={s.poster} resizeMode="cover" />
            <View style={s.ratingPill}>
              <Text style={s.ratingText}>⭐ {item.rating}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={s.cardGenre} numberOfLines={1}>{item.genre?.join(', ')}</Text>
              <View style={s.cardFooter}>
                <Text style={s.cardDur}>{item.duration}m</Text>
                <View style={s.langPill}>
                  <Text style={s.langText}>{item.language}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, margin: 14, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: T.border },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: T.text, fontSize: 14, paddingVertical: 12 },
  clearBtn: { color: T.muted, fontSize: 16, padding: 4 },
  card: { width: '48%', marginBottom: 16, backgroundColor: T.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  poster: { width: '100%', height: 210 },
  ratingPill: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  ratingText: { color: T.gold, fontSize: 10, fontWeight: '700' },
  cardInfo: { padding: 10 },
  cardTitle: { color: T.text, fontWeight: '700', fontSize: 13, lineHeight: 18 },
  cardGenre: { color: T.muted, fontSize: 11, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardDur: { color: T.primary, fontSize: 11, fontWeight: '700' },
  langPill: { backgroundColor: T.elevated, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  langText: { color: T.subtle, fontSize: 10 },
  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: T.muted, fontSize: 16 },
});
