import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const T = {
  bg: '#000000', surface: '#0d1b2a', elevated: '#0f2840',
  border: '#1a3a5c', primary: '#1e56a0', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24',
};

const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi'];

const PLACEHOLDER = 'https://via.placeholder.com/160x220?text=No+Poster';
const PosterImage = ({ uri, style }) => {
  const [error, setError] = React.useState(false);
  return (
    <Image
      source={{ uri: error || !uri || !uri.startsWith('http') ? PLACEHOLDER : uri }}
      style={style}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
};

export default function MovieListScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focused, setFocused] = useState(false);

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
    let result = movies.filter(m =>
      m.title.toLowerCase().includes(q) || m.genre?.join(' ').toLowerCase().includes(q)
    );
    if (activeGenre !== 'All') {
      result = result.filter(m => m.genre?.includes(activeGenre));
    }
    setFiltered(result);
  }, [search, movies, activeGenre]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={T.primary} /></View>;

  return (
    <View style={s.container}>
      {/* Search bar */}
      <View style={[s.searchWrap, focused && s.searchWrapFocused]}>
        <Ionicons name="search-outline" size={18} color={focused ? T.primary : T.muted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search movies or genres..."
          placeholderTextColor={T.muted}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={T.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Genre filter chips */}
      <FlatList
        horizontal
        data={GENRES}
        keyExtractor={g => g}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 10, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.genreChip, activeGenre === item && s.genreChipActive]}
            onPress={() => setActiveGenre(item)}
          >
            <Text style={[s.genreText, activeGenre === item && s.genreTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Result count */}
      <View style={s.resultRow}>
        <Text style={s.resultCount}>{filtered.length} movie{filtered.length !== 1 ? 's' : ''}</Text>
        {search || activeGenre !== 'All' ? (
          <TouchableOpacity onPress={() => { setSearch(''); setActiveGenre('All'); }}>
            <Text style={s.clearAll}>Clear filters</Text>
          </TouchableOpacity>
        ) : null}
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
            <Ionicons name="film-outline" size={52} color={T.border} style={{ marginBottom: 12 }} />
            <Text style={s.emptyTitle}>No movies found</Text>
            <Text style={s.emptySub}>Try a different search or filter</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('MovieDetail', { movieId: item._id })}>
            <PosterImage uri={item.poster} style={s.poster} />
            <View style={s.ratingPill}>
              <Ionicons name="star" size={9} color={T.gold} />
              <Text style={s.ratingText}>{item.rating}</Text>
            </View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={s.cardGenre} numberOfLines={1}>{item.genre?.join(', ')}</Text>
              <View style={s.cardFooter}>
                <View style={s.durChip}>
                  <Ionicons name="time-outline" size={10} color={T.primary} />
                  <Text style={s.cardDur}>{item.duration}m</Text>
                </View>
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

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.surface, margin: 14, marginBottom: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1.5, borderColor: T.border },
  searchWrapFocused: { borderColor: T.primary },
  searchInput: { flex: 1, color: T.text, fontSize: 14, paddingVertical: 12 },

  genreChip: { backgroundColor: T.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: T.border },
  genreChipActive: { backgroundColor: T.primary, borderColor: T.primary },
  genreText: { color: T.muted, fontSize: 12, fontWeight: '600' },
  genreTextActive: { color: '#fff', fontWeight: '700' },

  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  resultCount: { color: T.muted, fontSize: 12 },
  clearAll: { color: T.primary, fontSize: 12, fontWeight: '600' },

  card: { width: '48%', marginBottom: 16, backgroundColor: T.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  poster: { width: '100%', height: 210 },
  ratingPill: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3 },
  ratingText: { color: T.gold, fontSize: 10, fontWeight: '700' },

  cardInfo: { padding: 10 },
  cardTitle: { color: T.text, fontWeight: '700', fontSize: 13, lineHeight: 18 },
  cardGenre: { color: T.muted, fontSize: 11, marginTop: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  durChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardDur: { color: T.primary, fontSize: 11, fontWeight: '700' },
  langPill: { backgroundColor: T.elevated, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  langText: { color: T.subtle, fontSize: 10 },

  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { color: T.text, fontWeight: '700', fontSize: 16 },
  emptySub: { color: T.muted, fontSize: 13, marginTop: 6 },
});