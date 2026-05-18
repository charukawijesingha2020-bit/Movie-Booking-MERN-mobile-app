import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Image, ScrollView,
} from 'react-native';
import api from '../../services/api';

export default function HallDetailScreen({ route, navigation }) {
  const { hallId } = route.params;
  const [hall, setHall] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [h, sc] = await Promise.all([
          api.get(`/halls/${hallId}`),
          api.get(`/screenings/hall/${hallId}`),
        ]);
        setHall(h.data);
        setScreenings(sc.data);
      } catch (e) { Alert.alert('Error', 'Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [hallId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1e56a0" /></View>;

  return (
    <View style={s.container}>
      {hall?.image ? (
        <Image source={{ uri: hall.image }} style={s.hallBanner} resizeMode="cover" />
      ) : null}

      <View style={s.header}>
        <Text style={s.hallName}>{hall?.name}</Text>
        <Text style={s.companyName}>{hall?.company?.name}</Text>
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statNum}>{hall?.rows}</Text><Text style={s.statLabel}>Rows</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{hall?.seatsPerRow}</Text><Text style={s.statLabel}>Seats/Row</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{(hall?.rows || 0) * (hall?.seatsPerRow || 0)}</Text><Text style={s.statLabel}>Total</Text></View>
        </View>
      </View>

      <Text style={s.sectionTitle}>🎬 Screenings</Text>

      <FlatList
        data={screenings}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={s.empty}>No screenings scheduled in this hall.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            {/* Movie info row — tapping navigates to full movie details */}
            <TouchableOpacity
              style={s.movieRow}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('MovieDetail', { movieId: item.movie?._id })}
            >
              {item.movie?.poster ? (
                <Image source={{ uri: item.movie.poster }} style={s.poster} resizeMode="cover" />
              ) : (
                <View style={[s.poster, s.posterFallback]}>
                  <Text style={s.posterFallbackText}>🎬</Text>
                </View>
              )}
              <View style={s.movieInfo}>
                <Text style={s.movieTitle} numberOfLines={2}>{item.movie?.title}</Text>
                <Text style={s.genre} numberOfLines={1}>{item.movie?.genre?.join(', ')}</Text>
                <Text style={s.meta}>{item.movie?.duration} min  •  {item.movie?.rating}</Text>
                <View style={s.detailsLink}>
                  <Text style={s.detailsLinkText}>View Details  →</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Screening info row */}
            <View style={s.screeningRow}>
              <View style={s.dateTimeBlock}>
                <Text style={s.dateTime}>📅  {item.date}</Text>
                <Text style={s.dateTime}>🕐  {item.showtime}</Text>
                <Text style={s.booked}>{item.bookedSeats?.length || 0} seats booked</Text>
              </View>
              <View style={s.priceBlock}>
                <Text style={s.price}>Rs. {item.ticketPrice}</Text>
                <Text style={s.perSeat}>per seat</Text>
                <TouchableOpacity
                  style={s.bookBtn}
                  onPress={() => navigation.navigate('SeatSelection', { screeningId: item._id })}
                >
                  <Text style={s.bookBtnText}>Select Seats</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },

  hallBanner: { width: '100%', height: 180, backgroundColor: '#0f2840' },
  header: { backgroundColor: '#0d1b2a', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1a3a5c' },
  hallName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  companyName: { color: '#aaa', fontSize: 14, marginTop: 2, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { backgroundColor: '#0f2840', borderRadius: 10, padding: 12, alignItems: 'center', flex: 1 },
  statNum: { color: '#1e56a0', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 11, marginTop: 2 },

  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', padding: 16 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 40, fontSize: 15 },

  card: {
    backgroundColor: '#0d1b2a',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1a3a5c',
    overflow: 'hidden',
  },

  /* Movie section */
  movieRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a3a5c',
  },
  poster: {
    width: 80,
    height: 112,
    borderRadius: 8,
    backgroundColor: '#0f2840',
  },
  posterFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterFallbackText: { fontSize: 28 },
  movieInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  movieTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, lineHeight: 21 },
  genre: { color: '#aaa', fontSize: 12 },
  meta: { color: '#888', fontSize: 12 },
  detailsLink: { marginTop: 6 },
  detailsLinkText: { color: '#1e56a0', fontSize: 12, fontWeight: '600' },

  /* Screening row */
  screeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateTimeBlock: { gap: 3 },
  dateTime: { color: '#ccc', fontSize: 13 },
  booked: { color: '#666', fontSize: 11, marginTop: 4 },
  priceBlock: { alignItems: 'flex-end', gap: 2 },
  price: { color: '#1e56a0', fontWeight: 'bold', fontSize: 18 },
  perSeat: { color: '#888', fontSize: 10 },
  bookBtn: {
    backgroundColor: '#1e56a0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 6,
  },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});