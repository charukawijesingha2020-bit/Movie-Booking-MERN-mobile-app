import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const T = {
  bg: '#000000', surface: '#0d1b2a', elevated: '#0f2840',
  border: '#1a3a5c', primary: '#1e56a0', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24', success: '#10b981',
};

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posterError, setPosterError] = useState(false);

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
      {/* Poster */}
      <View style={s.posterWrap}>
        <Image
          source={{ uri: posterError || !movie.poster ? 'https://via.placeholder.com/400x250?text=No+Poster' : movie.poster }}
          style={s.poster}
          resizeMode="cover"
          onError={() => setPosterError(true)}
        />
        <View style={s.posterGradient} />
        <View style={s.ratingBadge}>
          <Ionicons name="star" size={12} color={T.gold} />
          <Text style={s.ratingText}>{movie.rating}</Text>
        </View>
      </View>

      <View style={s.content}>
        <Text style={s.title}>{movie.title}</Text>

        {/* Genre + info chips */}
        <View style={s.chips}>
          {movie.genre?.map(g => (
            <View key={g} style={s.chip}>
              <Text style={s.chipText}>{g}</Text>
            </View>
          ))}
          <View style={[s.chip, s.chipAlt]}>
            <Ionicons name="time-outline" size={11} color={T.primary} />
            <Text style={[s.chipText, { color: T.primary }]}>{movie.duration} min</Text>
          </View>
          <View style={[s.chip, s.chipAlt]}>
            <Ionicons name="language-outline" size={11} color={T.primary} />
            <Text style={[s.chipText, { color: T.primary }]}>{movie.language}</Text>
          </View>
        </View>

        {/* Meta row */}
        <View style={s.metaRow}>
          {movie.director ? (
            <View style={s.metaItem}>
              <View style={s.metaLabelRow}>
                <Ionicons name="videocam-outline" size={13} color={T.muted} />
                <Text style={s.metaLabel}>Director</Text>
              </View>
              <Text style={s.metaVal}>{movie.director}</Text>
            </View>
          ) : null}
          {movie.cast?.length > 0 ? (
            <View style={s.metaItem}>
              <View style={s.metaLabelRow}>
                <Ionicons name="people-outline" size={13} color={T.muted} />
                <Text style={s.metaLabel}>Cast</Text>
              </View>
              <Text style={s.metaVal}>{movie.cast.slice(0, 2).join(', ')}</Text>
            </View>
          ) : null}
        </View>

        {/* Synopsis */}
        {movie.description ? (
          <View style={s.synopsisBox}>
            <View style={s.synopsisHeader}>
              <View style={s.synopsisAccent} />
              <Text style={s.synopsisLabel}>Synopsis</Text>
            </View>
            <Text style={s.synopsis}>{movie.description}</Text>
          </View>
        ) : null}

        {/* Review button */}
        <TouchableOpacity
          style={s.reviewBtn}
          onPress={() => navigation.navigate('WriteFeedback', { movieId: movie._id, movieTitle: movie.title })}
        >
          <Ionicons name="star-outline" size={16} color={T.gold} />
          <Text style={s.reviewBtnText}>Write a Review</Text>
        </TouchableOpacity>

        {/* Screenings */}
        <View style={s.screeningHeader}>
          <Text style={s.sectionTitle}>Available Screenings</Text>
          {screenings.length > 0 && (
            <View style={s.screeningCount}>
              <Text style={s.screeningCountText}>{screenings.length}</Text>
            </View>
          )}
        </View>

        {screenings.length === 0 ? (
          <View style={s.emptyWrap}>
            <Ionicons name="ticket-outline" size={40} color={T.border} style={{ marginBottom: 10 }} />
            <Text style={s.emptyText}>No screenings scheduled</Text>
          </View>
        ) : (
          screenings.map(sc => (
            <TouchableOpacity
              key={sc._id}
              style={s.screeningCard}
              onPress={() => navigation.navigate('SeatSelection', { screeningId: sc._id })}
              activeOpacity={0.8}
            >
              <View style={s.screeningAccent} />
              <View style={s.screeningLeft}>
                <Text style={s.hallName}>{sc.hall?.name}</Text>
                <Text style={s.companyName}>{sc.hall?.company?.name}</Text>
                <View style={s.screeningMeta}>
                  <View style={s.metaTag}>
                    <Ionicons name="calendar-outline" size={12} color={T.muted} />
                    <Text style={s.metaTagText}>{sc.date}</Text>
                  </View>
                  <View style={s.metaTag}>
                    <Ionicons name="time-outline" size={12} color={T.muted} />
                    <Text style={s.metaTagText}>{sc.showtime}</Text>
                  </View>
                </View>
              </View>
              <View style={s.screeningRight}>
                <Text style={s.price}>Rs. {sc.ticketPrice}</Text>
                <Text style={s.perSeat}>per seat</Text>
                <View style={s.bookBtn}>
                  <Text style={s.bookBtnText}>Book</Text>
                  <Ionicons name="arrow-forward" size={12} color="#fff" />
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
  posterGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, backgroundColor: T.bg + 'CC' },
  ratingBadge: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: T.gold + '44' },
  ratingText: { color: T.gold, fontWeight: '700', fontSize: 13 },

  content: { padding: 20 },
  title: { color: T.text, fontSize: 28, fontWeight: '800', marginBottom: 14, lineHeight: 34 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { backgroundColor: T.elevated, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: T.border },
  chipAlt: { flexDirection: 'row', alignItems: 'center', gap: 4, borderColor: T.primary + '40', backgroundColor: T.primary + '10' },
  chipText: { color: T.subtle, fontSize: 12, fontWeight: '600' },

  metaRow: { gap: 10, marginBottom: 20 },
  metaItem: { backgroundColor: T.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: T.border },
  metaLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  metaLabel: { color: T.muted, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  metaVal: { color: T.text, fontSize: 14, fontWeight: '500' },

  synopsisBox: { backgroundColor: T.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: T.border },
  synopsisHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  synopsisAccent: { width: 3, height: 16, backgroundColor: T.primary, borderRadius: 2 },
  synopsisLabel: { color: T.text, fontWeight: '700', fontSize: 14 },
  synopsis: { color: T.subtle, lineHeight: 24, fontSize: 14 },

  reviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.elevated, borderRadius: 14, padding: 15, marginBottom: 28, borderWidth: 1, borderColor: T.gold + '55' },
  reviewBtnText: { color: T.gold, fontWeight: '700', fontSize: 14 },

  screeningHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { color: T.text, fontSize: 18, fontWeight: '700' },
  screeningCount: { backgroundColor: T.primary + '20', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  screeningCountText: { color: T.primary, fontWeight: '700', fontSize: 12 },

  emptyWrap: { alignItems: 'center', padding: 30 },
  emptyText: { color: T.muted, fontSize: 14 },

  screeningCard: { backgroundColor: T.surface, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  screeningAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: T.primary },
  screeningLeft: { flex: 1, padding: 16, paddingLeft: 18 },
  hallName: { color: T.text, fontWeight: '700', fontSize: 15 },
  companyName: { color: T.muted, fontSize: 12, marginTop: 3, marginBottom: 8 },
  screeningMeta: { flexDirection: 'row', gap: 10 },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTagText: { color: T.subtle, fontSize: 12 },

  screeningRight: { alignItems: 'center', paddingRight: 16, paddingVertical: 16 },
  price: { color: T.primary, fontWeight: '800', fontSize: 20 },
  perSeat: { color: T.muted, fontSize: 11, marginTop: 2 },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, marginTop: 10 },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
