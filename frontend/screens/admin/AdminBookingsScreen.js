import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const T = {
  bg: '#000000', surface: '#0d1b2a', elevated: '#0f2840',
  border: '#1a3a5c', primary: '#3b82f6', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', success: '#10b981', danger: '#e50914',
};

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, []);

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={T.primary} /></View>;

  return (
    <View style={s.container}>
      <View style={s.summaryBar}>
        {[
          { label: 'Total', value: bookings.length, color: T.text },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: T.success },
          { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: T.danger },
          { label: 'Revenue', value: `Rs.${totalRevenue}`, color: T.primary },
        ].map(item => (
          <View key={item.label} style={s.summaryItem}>
            <Text style={[s.summaryValue, { color: item.color }]}>{item.value}</Text>
            <Text style={s.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={T.primary} />}
        ListEmptyComponent={<Text style={s.empty}>No bookings yet.</Text>}
        renderItem={({ item }) => {
          const sc = item.screening;
          const isCancelled = item.status === 'cancelled';
          return (
            <View style={[s.card, isCancelled && s.cardCancelled]}>
              <View style={s.cardTop}>
                <View style={[s.statusDot, { backgroundColor: isCancelled ? T.danger : T.success }]} />
                <Text style={s.refText}>#{item.bookingRef}</Text>
                <View style={[s.badge, isCancelled ? s.badgeCancelled : s.badgeConfirmed]}>
                  <Text style={[s.badgeText, { color: isCancelled ? T.danger : T.success }]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={s.movieTitle} numberOfLines={1}>{sc?.movie?.title}</Text>

              <View style={s.infoGrid}>
                <View style={s.infoItem}>
                  <Text style={s.infoLabel}>User</Text>
                  <Text style={s.infoVal} numberOfLines={1}>{item.user?.name}</Text>
                </View>
                <View style={s.infoItem}>
                  <Text style={s.infoLabel}>Hall</Text>
                  <Text style={s.infoVal} numberOfLines={1}>{sc?.hall?.name}</Text>
                </View>
                <View style={s.infoItem}>
                  <Text style={s.infoLabel}>Date</Text>
                  <Text style={s.infoVal}>{sc?.date}</Text>
                </View>
                <View style={s.infoItem}>
                  <Text style={s.infoLabel}>Time</Text>
                  <Text style={s.infoVal}>{sc?.showtime}</Text>
                </View>
              </View>

              <View style={s.seatsRow}>
                <Text style={s.seatsLabel}>Seats: </Text>
                <Text style={s.seatsVal}>{item.seats?.join(', ')}</Text>
              </View>

              <View style={s.cardFooter}>
                <Text style={s.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={s.totalPrice}>Rs. {item.totalPrice}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },
  summaryBar: { flexDirection: 'row', backgroundColor: T.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontWeight: '800', fontSize: 17 },
  summaryLabel: { color: T.muted, fontSize: 10, marginTop: 3, fontWeight: '600' },
  empty: { color: T.muted, textAlign: 'center', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: T.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border },
  cardCancelled: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  refText: { color: T.muted, fontSize: 12, fontWeight: '600', flex: 1 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeConfirmed: { backgroundColor: T.success + '20' },
  badgeCancelled: { backgroundColor: T.danger + '20' },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  movieTitle: { color: T.text, fontWeight: '800', fontSize: 16, marginBottom: 12 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  infoItem: { width: '47%', backgroundColor: T.elevated, borderRadius: 10, padding: 10 },
  infoLabel: { color: T.muted, fontSize: 11, marginBottom: 3 },
  infoVal: { color: T.text, fontSize: 13, fontWeight: '600' },
  seatsRow: { flexDirection: 'row', backgroundColor: T.elevated, borderRadius: 10, padding: 10, marginBottom: 12 },
  seatsLabel: { color: T.muted, fontSize: 13 },
  seatsVal: { color: T.primary, fontWeight: '700', fontSize: 13, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: T.border, paddingTop: 10 },
  dateText: { color: T.muted, fontSize: 11 },
  totalPrice: { color: T.primary, fontWeight: '800', fontSize: 18 },
});
