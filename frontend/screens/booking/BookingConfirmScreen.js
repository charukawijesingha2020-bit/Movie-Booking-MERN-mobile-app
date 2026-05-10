import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', success: '#10b981', gold: '#fbbf24',
};

const Row = ({ label, value, highlight }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, highlight && s.rowHighlight]}>{value || '—'}</Text>
  </View>
);

export default function BookingConfirmScreen({ route, navigation }) {
  const { booking } = route.params;
  const sc = booking?.screening;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.successRing}>
        <Text style={s.successIcon}>✅</Text>
      </View>
      <Text style={s.title}>Booking Confirmed!</Text>
      <Text style={s.subtitle}>Your seats have been reserved successfully.</Text>

      <View style={s.ticket}>
        <View style={s.ticketHeader}>
          <Text style={s.ticketHeaderLabel}>MOVIE TICKET</Text>
          <Text style={s.ticketHeaderIcon}>🎬</Text>
        </View>

        <View style={s.ticketDivider}>
          <View style={s.notch} />
          <View style={s.dashes} />
          <View style={s.notchRight} />
        </View>

        <View style={s.ticketBody}>
          <Row label="Booking Ref" value={booking?.bookingRef} highlight />
          <Row label="Movie" value={sc?.movie?.title} />
          <Row label="Cinema" value={sc?.hall?.company?.name} />
          <Row label="Hall" value={sc?.hall?.name} />
          <Row label="Date" value={sc?.date} />
          <Row label="Show Time" value={sc?.showtime} />
          <View style={s.separator} />
          <Row label="Seats" value={booking?.seats?.join(', ')} highlight />
          <Row label="Total Paid" value={`Rs. ${booking?.totalPrice}`} highlight />
          <Row label="Status" value={booking?.status?.toUpperCase()} />
        </View>
      </View>

      <TouchableOpacity style={s.btnPrimary} onPress={() => navigation.navigate('MyBookings')}>
        <Text style={s.btnPrimaryText}>View My Tickets</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={() => navigation.navigate('Home')}>
        <Text style={s.btnOutlineText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 24, alignItems: 'center' },
  successRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: T.success + '20', borderWidth: 2, borderColor: T.success, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 16 },
  successIcon: { fontSize: 48 },
  title: { fontSize: 26, fontWeight: '800', color: T.text, marginBottom: 6 },
  subtitle: { color: T.muted, fontSize: 14, marginBottom: 28, textAlign: 'center' },
  ticket: { backgroundColor: T.surface, borderRadius: 20, width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  ticketHeader: { backgroundColor: T.primary, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketHeaderLabel: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 2 },
  ticketHeaderIcon: { fontSize: 24 },
  ticketDivider: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.bg },
  notch: { width: 18, height: 18, borderRadius: 9, backgroundColor: T.bg },
  dashes: { flex: 1, height: 1, borderWidth: 1, borderColor: T.border, borderStyle: 'dashed', marginHorizontal: 4 },
  notchRight: { width: 18, height: 18, borderRadius: 9, backgroundColor: T.bg },
  ticketBody: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  rowLabel: { color: T.muted, fontSize: 13 },
  rowValue: { color: T.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  rowHighlight: { color: T.primary, fontWeight: '800', fontSize: 14 },
  separator: { height: 1, backgroundColor: T.border, marginVertical: 12 },
  btnPrimary: { backgroundColor: T.primary, borderRadius: 16, padding: 17, alignItems: 'center', width: '100%', marginTop: 20 },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOutline: { borderWidth: 1, borderColor: T.border, borderRadius: 16, padding: 15, alignItems: 'center', width: '100%', marginTop: 12 },
  btnOutlineText: { color: T.muted, fontSize: 14, fontWeight: '600' },
});
