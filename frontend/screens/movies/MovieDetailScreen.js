import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import api from '../../services/api';

const C = { primary: '#E50914', dark: '#141414', card: '#1a1a1a', text: '#fff', muted: '#aaa', border: '#333' };

export default function MovieDetailScreen({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [m, sc] = await Promise.all([
          api.get(`/movies/${movieId}`),
          api.get(`/screenings/movie/${movieId}`),
        ]);
        setMovie(m.data);
        setScreenings(sc.data);
      } catch (e) { Alert.alert('Error', 'Failed to load movie'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [movieId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={C.primary} /></View>;
  if (!movie) return <View style={s.center}><Text style={{ color: C.muted }}>Movie not found</Text></View>;

  return (
    <ScrollView style={s.container}>
      <Image
        source={{ uri: movie.poster || 'https://via.placeholder.com/400x250?text=No+Poster' }}
        style={s.poster}
        resizeMode="cover"
      />
      <View style={s.overlay}>
        <View style={s.ratingBadge}><Text style={s.ratingText}>{movie.rating}</Text></View>
      </View>

      <View style={s.content}>
        <Text style={s.title}>{movie.title}</Text>
        <View style={s.metaRow}>
          <Text style={s.metaChip}>{movie.genre?.join(' • ')}</Text>
          <Text style={s.metaChip}>{movie.duration} min</Text>
          <Text style={s.metaChip}>{movie.language}</Text>
        </View>

        {movie.director ? <Text style={s.dir}>Director: <Text style={s.dirVal}>{movie.director}</Text></Text> : null}
        {movie.cast?.length > 0 && <Text style={s.dir}>Cast: <Text style={s.dirVal}>{movie.cast.join(', ')}</Text></Text>}

        {movie.description ? (
          <View style={s.descBox}>
            <Text style={s.descLabel}>Synopsis</Text>
            <Text style={s.desc}>{movie.description}</Text>
          </View>
        ) : null}

        {/* Reviews button */}
        <TouchableOpacity style={s.reviewBtn} onPress={() => navigation.navigate('WriteFeedback', { movieId: movie._id, movieTitle: movie.title })}>
          <Text style={s.reviewBtnText}>⭐ Write a Review</Text>
        </TouchableOpacity>

        {/* Screenings */}
        <Text style={s.sectionTitle}>🎟️  Available Screenings</Text>
        {screenings.length === 0 ? (
          <Text style={s.noScreenings}>No screenings scheduled for this movie.</Text>
        ) : (
          screenings.map(sc => (
            <TouchableOpacity
              key={sc._id}
              style={s.screeningCard}
              onPress={() => navigation.navigate('SeatSelection', { screeningId: sc._id })}
            >
              <View style={s.screeningLeft}>
                <Text style={s.hallName}>{sc.hall?.name}</Text>
                <Text style={s.companyName}>{sc.hall?.company?.name}</Text>
                <Text style={s.dateTime}>📅 {sc.date}  🕐 {sc.showtime}</Text>
              </View>
              <View style={s.screeningRight}>
                <Text style={s.price}>Rs. {sc.ticketPrice}</Text>
                <Text style={s.perSeat}>per seat</Text>
                <View style={s.bookNow}><Text style={s.bookNowText}>Book</Text></View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.dark },
  poster: { width: '100%', height: 260 },
  overlay: { position: 'absolute', top: 16, right: 16 },
  ratingBadge: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  ratingText: { color: '#ffd700', fontWeight: 'bold', fontSize: 13 },
  content: { padding: 20 },
  title: { color: C.text, fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  metaChip: { backgroundColor: '#2a2a2a', color: C.muted, fontSize: 12, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  dir: { color: C.muted, fontSize: 13, marginBottom: 4 },
  dirVal: { color: C.text },
  descBox: { backgroundColor: C.card, borderRadius: 12, padding: 14, marginTop: 12 },
  descLabel: { color: C.primary, fontWeight: 'bold', marginBottom: 6, fontSize: 14 },
  desc: { color: C.muted, lineHeight: 22, fontSize: 14 },
  reviewBtn: { backgroundColor: '#2a2a2a', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#444' },
  reviewBtnText: { color: '#ffd700', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  noScreenings: { color: C.muted, textAlign: 'center', padding: 20 },
  screeningCard: { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  screeningLeft: { flex: 1 },
  hallName: { color: C.text, fontWeight: 'bold', fontSize: 15 },
  companyName: { color: C.muted, fontSize: 12, marginTop: 2 },
  dateTime: { color: '#aaa', fontSize: 12, marginTop: 6 },
  screeningRight: { alignItems: 'center' },
  price: { color: C.primary, fontWeight: 'bold', fontSize: 18 },
  perSeat: { color: C.muted, fontSize: 11 },
  bookNow: { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, marginTop: 8 },
  bookNowText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
