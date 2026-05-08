import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../../services/api';

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
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking? Seats will be released.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await api.put(`/bookings/${bookingId}/cancel`);
            fetchBookings();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || 'Could not cancel booking');
          }
        }
      }
    ]);
  };



  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor="#E50914" />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>🎟️</Text>
            <Text style={s.emptyText}>No bookings yet</Text>
            <Text style={s.emptySubText}>Book a movie to see your tickets here</Text>
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
              {/* Header */}
              <View style={s.cardHeader}>
                <Text style={s.movieTitle} numberOfLines={1}>{sc?.movie?.title || 'Movie'}</Text>
                <View style={[s.statusBadge, isCancelled ? s.statusCancelled : s.statusConfirmed]}>
                  <Text style={s.statusText}>{item.status?.toUpperCase()}</Text>
                </View>
              </View>

              {/* Details */}
              <View style={s.detailsRow}>
                <View style={s.detailItem}>
                  <Text style={s.detailLabel}>Cinema</Text>
                  <Text style={s.detailVal}>{sc?.hall?.company?.name}</Text>
                </View>
                <View style={s.detailItem}>
                  <Text style={s.detailLabel}>Hall</Text>
                  <Text style={s.detailVal}>{sc?.hall?.name}</Text>
                </View>
              </View>

              <View style={s.detailsRow}>
                <View style={s.detailItem}>
                  <Text style={s.detailLabel}>Date</Text>
                  <Text style={s.detailVal}>{sc?.date}</Text>
                </View>
                <View style={s.detailItem}>
                  <Text style={s.detailLabel}>Time</Text>
                  <Text style={s.detailVal}>{sc?.showtime}</Text>
                </View>
              </View>

              <View style={s.seatsRow}>
                <Text style={s.seatsLabel}>Seats: </Text>
                <Text style={s.seatsVal}>{item.seats?.join(', ')}</Text>
              </View>

              <View style={s.footer}>
                <View>
                  <Text style={s.refText}>Ref: {item.bookingRef}</Text>
                  <Text style={s.priceText}>Rs. {item.totalPrice}</Text>
                </View>
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
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  emptySubText: { color: '#aaa', fontSize: 14, marginTop: 6 },
  exploreBtn: { backgroundColor: '#E50914', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#333' },
  cardCancelled: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  movieTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, flex: 1, marginRight: 8 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusConfirmed: { backgroundColor: '#1a6b3c' },
  statusCancelled: { backgroundColor: '#5a1a1a' },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  detailsRow: { flexDirection: 'row', marginBottom: 8 },
  detailItem: { flex: 1 },
  detailLabel: { color: '#666', fontSize: 11 },
  detailVal: { color: '#ccc', fontSize: 13, fontWeight: '500', marginTop: 2 },
  seatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 10, backgroundColor: '#2a2a2a', borderRadius: 8, padding: 10 },
  seatsLabel: { color: '#aaa', fontSize: 13 },
  seatsVal: { color: '#E50914', fontWeight: 'bold', fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2a2a2a', paddingTop: 10, marginTop: 4 },
  refText: { color: '#666', fontSize: 11 },
  priceText: { color: '#E50914', fontWeight: 'bold', fontSize: 18, marginTop: 2 },
  cancelBtn: { borderWidth: 1, borderColor: '#E50914', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  cancelBtnText: { color: '#E50914', fontWeight: 'bold', fontSize: 13 },
});
