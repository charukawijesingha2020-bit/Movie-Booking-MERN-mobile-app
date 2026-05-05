import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  return (
    <View style={s.container}>
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
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('SeatSelection', { screeningId: item._id })}
          >
            <View style={s.movieInfo}>
              <Text style={s.movieTitle}>{item.movie?.title}</Text>
              <Text style={s.genre}>{item.movie?.genre?.join(', ')} • {item.movie?.duration} min</Text>
              <Text style={s.dateTime}>📅 {item.date}   🕐 {item.showtime}</Text>
            </View>
            <View style={s.right}>
              <Text style={s.price}>Rs. {item.ticketPrice}</Text>
              <Text style={s.perSeat}>per seat</Text>
              <Text style={s.booked}>{item.bookedSeats?.length || 0} booked</Text>
              <View style={s.bookBtn}><Text style={s.bookBtnText}>Select</Text></View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  header: { backgroundColor: '#1a1a1a', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  hallName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  companyName: { color: '#aaa', fontSize: 14, marginTop: 2, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  stat: { backgroundColor: '#2a2a2a', borderRadius: 10, padding: 12, alignItems: 'center', flex: 1 },
  statNum: { color: '#E50914', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#aaa', fontSize: 11, marginTop: 2 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', padding: 16 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  movieInfo: { flex: 1 },
  movieTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  genre: { color: '#aaa', fontSize: 12, marginTop: 3 },
  dateTime: { color: '#888', fontSize: 12, marginTop: 6 },
  right: { alignItems: 'center', minWidth: 80 },
  price: { color: '#E50914', fontWeight: 'bold', fontSize: 17 },
  perSeat: { color: '#aaa', fontSize: 10 },
  booked: { color: '#888', fontSize: 10, marginTop: 3 },
  bookBtn: { backgroundColor: '#E50914', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
