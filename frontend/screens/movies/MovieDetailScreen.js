import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24', success: '#10b981',
};

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [m, sc] = await Promise.all([api.get(`/movies/${movieId}`), api.get(`/screenings/movie/${movieId}`)]);
        setMovie(m.data);
        setScreenings(sc.data);
      } catch (e) { Alert.alert('Error', 'Failed to load movie'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [movieId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={T.primary} /></View>;
  if (!movie) return <View style={s.center}><Text style={{ color: T.muted }}>Movie not found</Text></View>;

  return (
    <ScrollView style={s.container}>
      <View style={s.posterWrap}>
        <Image source={{ uri: movie.poster || 'https://via.placeholder.com/400x250?text=No+Poster' }}
          style={s.poster} resizeMode="cover" />
        <View style={s.posterOverlay} />
        <View style={s.ratingBadge}>
          <Text style={s.ratingText}>⭐ {movie.rating}</Text>
        </View>
      </View>

      <View style={s.content}>
        <Text style={s.title}>{movie.title}</Text>

        <View style={s.chips}>
          {movie.genre?.map(g => <View key={g} style={s.chip}><Text style={s.chipText}>{g}</Text></View>)}
          <View style={s.chip}><Text style={s.chipText}>{movie.duration} min</Text></View>
          <View style={s.chip}><Text style={s.chipText}>{movie.language}</Text></View>
        </View>

        <View style={s.metaRow}>
          {movie.director ? (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Director</Text>
              <Text style={s.metaVal}>{movie.director}</Text>
            </View>
          ) : null}
          {movie.cast?.length > 0 ? (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Cast</Text>
              <Text style={s.metaVal}>{movie.cast.slice(0, 2).join(', ')}</Text>
            </View>
          ) : null}
        </View>

        {movie.description ? (
          <View style={s.synopsisBox}>
            <Text style={s.synopsisLabel}>Synopsis</Text>
            <Text style={s.synopsis}>{movie.description}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={s.reviewBtn}
          onPress={() => navigation.navigate('WriteFeedback', { movieId: movie._id, movieTitle: movie.title })}>
          <Text style={s.reviewBtnText}>⭐  Write a Review</Text>
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Available Screenings</Text>

        {screenings.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🎟️</Text>
            <Text style={s.emptyText}>No screenings scheduled</Text>
          </View>
        ) : (
          screenings.map(sc => (
            <TouchableOpacity key={sc._id} style={s.screeningCard}
              onPress={() => navigation.navigate('SeatSelection', { screeningId: sc._id })}>
              <View style={s.screeningLeft}>
                <Text style={s.hallName}>{sc.hall?.name}</Text>
                <Text style={s.companyName}>{sc.hall?.company?.name}</Text>
                <View style={s.showtime}>
                  <Text style={s.showtimeText}>📅 {sc.date}  •  🕐 {sc.showtime}</Text>
                </View>
              </View>
              <View style={s.screeningRight}>
                <Text style={s.price}>Rs. {sc.ticketPrice}</Text>
                <Text style={s.perSeat}>per seat</Text>
                <View style={s.bookBtn}>
                  <Text style={s.bookBtnText}>Book Now</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },
  posterWrap: { position: 'relative' },
  poster: { width: '100%', height: 280 },
  posterOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'transparent' },
  ratingBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: T.gold + '44' },
  ratingText: { color: T.gold, fontWeight: '700', fontSize: 13 },
  content: { padding: 20 },
  title: { color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 14, lineHeight: 34 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { backgroundColor: T.elevated, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: T.border },
  chipText: { color: T.subtle, fontSize: 12, fontWeight: '600' },
  metaRow: { gap: 12, marginBottom: 20 },
  metaItem: { backgroundColor: T.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: T.border },
  metaLabel: { color: T.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  metaVal: { color: T.text, fontSize: 14, fontWeight: '500' },
  synopsisBox: { backgroundColor: T.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: T.border },
  synopsisLabel: { color: T.primary, fontWeight: '700', marginBottom: 8, fontSize: 13, letterSpacing: 0.5 },
  synopsis: { color: T.subtle, lineHeight: 24, fontSize: 14 },
  reviewBtn: { backgroundColor: T.elevated, borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: T.gold + '55' },
  reviewBtnText: { color: T.gold, fontWeight: '700', fontSize: 14 },
  sectionTitle: { color: T.text, fontSize: 18, fontWeight: '700', marginBottom: 14 },
  emptyWrap: { alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { color: T.muted, fontSize: 14 },
  screeningCard: { backgroundColor: T.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  screeningLeft: { flex: 1 },
  hallName: { color: T.text, fontWeight: '700', fontSize: 15 },
  companyName: { color: T.muted, fontSize: 12, marginTop: 3 },
  showtime: { marginTop: 8 },
  showtimeText: { color: T.subtle, fontSize: 12 },
  screeningRight: { alignItems: 'center', marginLeft: 12 },
  price: { color: T.primary, fontWeight: '800', fontSize: 20 },
  perSeat: { color: T.muted, fontSize: 11, marginTop: 2 },
  bookBtn: { backgroundColor: T.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 10 },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
