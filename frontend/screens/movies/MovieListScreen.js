import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../services/api';

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

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  return (
    <View style={s.container}>
      <TextInput
        style={s.search}
        placeholder="🔍  Search movies or genres..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMovies(); }} tintColor="#E50914" />}
        ListEmptyComponent={<Text style={s.empty}>No movies found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('MovieDetail', { movieId: item._id })}>
            <Image
              source={{ uri: item.poster || 'https://via.placeholder.com/160x220?text=No+Poster' }}
              style={s.poster}
              resizeMode="cover"
            />
            <View style={s.info}>
              <Text style={s.title} numberOfLines={2}>{item.title}</Text>
              <Text style={s.genre} numberOfLines={1}>{item.genre?.join(', ')}</Text>
              <Text style={s.dur}>{item.duration} min</Text>
            </View>
            <View style={s.badge}><Text style={s.badgeText}>{item.rating}</Text></View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  search: { backgroundColor: '#2a2a2a', color: '#fff', margin: 12, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#333' },
  card: { width: '48%', marginBottom: 16, backgroundColor: '#1a1a1a', borderRadius: 12, overflow: 'hidden' },
  poster: { width: '100%', height: 200 },
  info: { padding: 10 },
  title: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  genre: { color: '#aaa', fontSize: 11, marginTop: 3 },
  dur: { color: '#E50914', fontSize: 11, marginTop: 3, fontWeight: '600' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#ffd700', fontSize: 10, fontWeight: 'bold' },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 15 },
});
