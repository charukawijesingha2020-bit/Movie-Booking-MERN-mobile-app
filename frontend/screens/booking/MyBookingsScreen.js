import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', success: '#10b981',
};

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = (bookingId) => {
    Alert.alert('Cancel Booking', 'Are you sure? Seats will be released.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await api.put(`/bookings/${bookingId}/cancel`);
            fetchBookings();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || 'Could not cancel');
          }
        }
      }
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={T.primary} /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={T.primary} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🎟️</Text>
            <Text style={s.emptyTitle}>No bookings yet</Text>
            <Text style={s.emptySub}>Book a movie to see your tickets here</Text>
            <TouchableOpacity style={s.exploreBtn} onPress={() => navigation.navigate('Movies')}>
              <Text style={s.exploreBtnText}>Browse Movies</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const sc = item.screening;
          const isCancelled = item.status === 'cancelled';
          return (
            <View style={[s.card, isCancelled && s.cardCancelled]}>
              <View style={s.cardTop}>
                <View style={[s.statusDot, { backgroundColor: isCancelled ? T.primary : T.success }]} />
                <Text style={s.refText}>#{item.bookingRef}</Text>
                <View style={[s.statusBadge, isCancelled ? s.badgeCancelled : s.badgeConfirmed]}>
                  <Text style={[s.statusText, { color: isCancelled ? T.primary : T.success }]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={s.movieTitle} numberOfLines={1}>{sc?.movie?.title || 'Movie'}</Text>

              <View style={s.detailsGrid}>
                <View style={s.detailBox}>
                  <Text style={s.detailLabel}>Cinema</Text>
                  <Text style={s.detailVal}>{sc?.hall?.company?.name}</Text>
                </View>
                <View style={s.detailBox}>
                  <Text style={s.detailLabel}>Hall</Text>
                  <Text style={s.detailVal}>{sc?.hall?.name}</Text>
                </View>
                <View style={s.detailBox}>
                  <Text style={s.detailLabel}>Date</Text>
                  <Text style={s.detailVal}>{sc?.date}</Text>
                </View>
                <View style={s.detailBox}>
                  <Text style={s.detailLabel}>Time</Text>
                  <Text style={s.detailVal}>{sc?.showtime}</Text>
                </View>
              </View>

              <View style={s.seatsRow}>
                <Text style={s.seatsLabel}>Seats</Text>
                <Text style={s.seatsVal}>{item.seats?.join(', ')}</Text>
              </View>

              <View style={s.cardFooter}>
                <Text style={s.totalPrice}>Rs. {item.totalPrice}</Text>
                {!isCancelled && (
                  <TouchableOpacity style={s.cancelBtn} onPress={() => handleCancel(item._id)}>
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
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
  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { color: T.text, fontSize: 20, fontWeight: '700' },
  emptySub: { color: T.muted, fontSize: 14, marginTop: 6, marginBottom: 24 },
  exploreBtn: { backgroundColor: T.primary, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: T.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: T.border },
  cardCancelled: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  refText: { color: T.muted, fontSize: 12, fontWeight: '600', flex: 1 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeConfirmed: { backgroundColor: T.success + '20' },
  badgeCancelled: { backgroundColor: T.primary + '20' },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  movieTitle: { color: T.text, fontWeight: '800', fontSize: 18, marginBottom: 14 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  detailBox: { width: '47%', backgroundColor: T.elevated, borderRadius: 10, padding: 10 },
  detailLabel: { color: T.muted, fontSize: 11, marginBottom: 4 },
  detailVal: { color: T.text, fontSize: 13, fontWeight: '600' },
  seatsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.elevated, borderRadius: 12, padding: 12, marginBottom: 14 },
  seatsLabel: { color: T.muted, fontSize: 13, marginRight: 8 },
  seatsVal: { color: T.primary, fontWeight: '700', fontSize: 13, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 },
  totalPrice: { color: T.primary, fontWeight: '800', fontSize: 22 },
  cancelBtn: { borderWidth: 1, borderColor: T.primary + '66', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  cancelBtnText: { color: T.primary, fontWeight: '700', fontSize: 13 },
});
