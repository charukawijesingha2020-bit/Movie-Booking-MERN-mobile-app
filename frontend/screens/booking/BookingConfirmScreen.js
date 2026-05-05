import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function BookingConfirmScreen({ route, navigation }) {
  const { booking } = route.params;
  const sc = booking?.screening;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Success Icon */}
      <View style={s.iconWrap}>
        <Text style={s.icon}>✅</Text>
      </View>
      <Text style={s.title}>Booking Confirmed!</Text>
      <Text style={s.subtitle}>Your seats have been reserved successfully.</Text>

      {/* Ticket Card */}
      <View style={s.ticket}>
        <View style={s.ticketHeader}>
          <Text style={s.ticketHeaderText}>🎬 MOVIE TICKET</Text>
        </View>

        <View style={s.ticketBody}>
          <Row label="Booking Ref" value={booking?.bookingRef} highlight />
          <Row label="Movie" value={sc?.movie?.title} />
          <Row label="Cinema" value={sc?.hall?.company?.name} />
          <Row label="Hall" value={sc?.hall?.name} />
          <Row label="Date" value={sc?.date} />
          <Row label="Show Time" value={sc?.showtime} />

          <View style={s.divider} />

          <Row label="Seats" value={booking?.seats?.join(', ')} highlight />
          <Row label="Total Paid" value={`Rs. ${booking?.totalPrice}`} highlight />
          <Row label="Status" value={booking?.status?.toUpperCase()} />
        </View>
      </View>

      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('MyBookings')}>
        <Text style={s.btnText}>View My Bookings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={() => navigation.navigate('Home')}>
        <Text style={s.btnOutlineText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Row = ({ label, value, highlight }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, highlight && s.rowHighlight]}>{value || '—'}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  content: { padding: 24, alignItems: 'center' },
  iconWrap: { marginTop: 20, marginBottom: 12 },
  icon: { fontSize: 64 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle: { color: '#aaa', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  ticket: { backgroundColor: '#1a1a1a', borderRadius: 18, width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  ticketHeader: { backgroundColor: '#E50914', padding: 14, alignItems: 'center' },
  ticketHeaderText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 2 },
  ticketBody: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  rowLabel: { color: '#888', fontSize: 13 },
  rowValue: { color: '#fff', fontSize: 13, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  rowHighlight: { color: '#E50914', fontWeight: 'bold', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 12 },
  btn: { backgroundColor: '#E50914', borderRadius: 12, padding: 16, alignItems: 'center', width: '100%', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnOutline: { borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 14, alignItems: 'center', width: '100%', marginTop: 12 },
  btnOutlineText: { color: '#aaa', fontSize: 14 },
});
