import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import api from '../../services/api';

const COLORS = { primary: '#E50914', dark: '#141414', card: '#1a1a1a', text: '#fff', muted: '#aaa', booked: '#444', selected: '#E50914', available: '#2a9d8f' };

export default function SeatSelectionScreen({ route, navigation }) {
  const { screeningId } = route.params;
  const [screening, setScreening] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/screenings/${screeningId}`);
        setScreening(data);
      } catch (e) { Alert.alert('Error', 'Could not load screening'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [screeningId]);

  const rows = screening?.hall?.rows || 0;
  const seatsPerRow = screening?.hall?.seatsPerRow || 0;
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, rows);

  const isBooked = (seatId) => screening?.bookedSeats?.includes(seatId);
  const isSelected = (seatId) => selectedSeats.includes(seatId);

  const toggleSeat = (seatId) => {
    if (isBooked(seatId)) return;
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return Alert.alert('No seats', 'Please select at least one seat');
    setBooking(true);
    try {
      const { data } = await api.post('/bookings', { screeningId, seats: selectedSeats });
      navigation.replace('BookingConfirm', { booking: data });
    } catch (err) {
      Alert.alert('Booking Failed', err?.response?.data?.message || 'Something went wrong');
    } finally { setBooking(false); }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!screening) return <View style={s.center}><Text style={{ color: COLORS.muted }}>Screening not found</Text></View>;

  const totalPrice = selectedSeats.length * (screening?.ticketPrice || 0);

  return (
    <View style={s.container}>
      {/* Movie Info */}
      <View style={s.infoBar}>
        <Text style={s.movieTitle} numberOfLines={1}>{screening.movie?.title}</Text>
        <Text style={s.subInfo}>{screening.hall?.name} • {screening.date} {screening.showtime}</Text>
        <Text style={s.subInfo}>{screening.hall?.company?.name}</Text>
      </View>

      {/* Screen indicator */}
      <View style={s.screenWrap}>
        <View style={s.screen}><Text style={s.screenText}>SCREEN</Text></View>
      </View>

      {/* Seat Grid */}
      <ScrollView contentContainerStyle={s.grid}>
        {rowLabels.split('').map(rowLabel => (
          <View key={rowLabel} style={s.row}>
            <Text style={s.rowLabel}>{rowLabel}</Text>
            {Array.from({ length: seatsPerRow }, (_, i) => {
              const seatId = `${rowLabel}${i + 1}`;
              const booked = isBooked(seatId);
              const selected = isSelected(seatId);
              return (
                <TouchableOpacity
                  key={seatId}
                  style={[s.seat, booked ? s.seatBooked : selected ? s.seatSelected : s.seatAvailable]}
                  onPress={() => toggleSeat(seatId)}
                  disabled={booked}
                >
                  <Text style={[s.seatText, booked ? { color: '#555' } : { color: '#fff' }]}>
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={s.legend}>
        <View style={s.legendItem}><View style={[s.dot, { backgroundColor: COLORS.available }]} /><Text style={s.legendText}>Available</Text></View>
        <View style={s.legendItem}><View style={[s.dot, { backgroundColor: COLORS.selected }]} /><Text style={s.legendText}>Selected</Text></View>
        <View style={s.legendItem}><View style={[s.dot, { backgroundColor: COLORS.booked }]} /><Text style={s.legendText}>Booked</Text></View>
      </View>

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        <View>
          <Text style={s.seatsInfo}>{selectedSeats.length} seat(s): {selectedSeats.join(', ') || '—'}</Text>
          <Text style={s.totalPrice}>Total: Rs. {totalPrice}</Text>
        </View>
        <TouchableOpacity style={[s.bookBtn, booking && { opacity: 0.6 }]} onPress={handleBooking} disabled={booking}>
          {booking ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.bookBtnText}>Confirm Booking</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  infoBar: { backgroundColor: '#1a1a1a', padding: 14, borderBottomWidth: 1, borderBottomColor: '#333' },
  movieTitle: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  subInfo: { color: '#aaa', fontSize: 12, marginTop: 2 },
  screenWrap: { alignItems: 'center', marginVertical: 16 },
  screen: { backgroundColor: '#E50914', width: '70%', height: 8, borderRadius: 4, marginBottom: 4 },
  screenText: { color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 4 },
  grid: { paddingHorizontal: 12, paddingBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rowLabel: { color: '#aaa', width: 22, fontSize: 12, fontWeight: 'bold' },
  seat: { width: 30, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', margin: 3 },
  seatAvailable: { backgroundColor: '#2a9d8f' },
  seatSelected: { backgroundColor: '#E50914' },
  seatBooked: { backgroundColor: '#444' },
  seatText: { fontSize: 10, fontWeight: 'bold' },
  legend: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, gap: 20, borderTopWidth: 1, borderTopColor: '#333' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 4 },
  legendText: { color: '#aaa', fontSize: 12 },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 16, borderTopWidth: 1, borderTopColor: '#333' },
  seatsInfo: { color: '#aaa', fontSize: 12, maxWidth: 180 },
  totalPrice: { color: '#E50914', fontWeight: 'bold', fontSize: 18, marginTop: 2 },
  bookBtn: { backgroundColor: '#E50914', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
