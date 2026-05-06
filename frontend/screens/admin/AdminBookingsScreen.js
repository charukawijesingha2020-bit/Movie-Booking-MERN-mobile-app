import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Alert, Modal, TextInput, TouchableOpacity, RefreshControl,
} from 'react-native';
import api from '../../services/api';

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyModal, setReplyModal] = useState(null);  // { reviewId, currentReply }
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, []);

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  return (
    <View style={s.container}>
      {/* Summary strip */}
      <View style={s.summaryBar}>
        <View style={s.summaryItem}>
          <Text style={s.summaryValue}>{bookings.length}</Text>
          <Text style={s.summaryLabel}>Total Bookings</Text>
        </View>
        <View style={s.summaryItem}>
          <Text style={[s.summaryValue, { color: '#2a9d8f' }]}>
            {bookings.filter(b => b.status === 'confirmed').length}
          </Text>
          <Text style={s.summaryLabel}>Confirmed</Text>
        </View>
        <View style={s.summaryItem}>
          <Text style={[s.summaryValue, { color: '#E50914' }]}>
            {bookings.filter(b => b.status === 'cancelled').length}
          </Text>
          <Text style={s.summaryLabel}>Cancelled</Text>
        </View>
        <View style={s.summaryItem}>
          <Text style={[s.summaryValue, { color: '#e9c46a', fontSize: 15 }]}>
            Rs.{totalRevenue}
          </Text>
          <Text style={s.summaryLabel}>Revenue</Text>
        </View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor="#E50914" />}
        ListEmptyComponent={<Text style={s.empty}>No bookings yet.</Text>}
        renderItem={({ item }) => {
          const sc = item.screening;
          const isCancelled = item.status === 'cancelled';
          return (
            <View style={[s.card, isCancelled && { opacity: 0.6 }]}>
              {/* Header */}
              <View style={s.cardHeader}>
                <Text style={s.refText}>{item.bookingRef}</Text>
                <View style={[s.badge, isCancelled ? s.badgeCancelled : s.badgeConfirmed]}>
                  <Text style={s.badgeText}>{item.status?.toUpperCase()}</Text>
                </View>
              </View>

              {/* User */}
              <View style={s.row}>
                <Text style={s.rowLabel}>👤 User</Text>
                <Text style={s.rowVal}>{item.user?.name} ({item.user?.email})</Text>
              </View>

              {/* Movie */}
              <View style={s.row}>
                <Text style={s.rowLabel}>🎬 Movie</Text>
                <Text style={s.rowVal} numberOfLines={1}>{sc?.movie?.title}</Text>
              </View>

              {/* Hall & Company */}
              <View style={s.row}>
                <Text style={s.rowLabel}>🏟️ Hall</Text>
                <Text style={s.rowVal}>{sc?.hall?.name} — {sc?.hall?.company?.name}</Text>
              </View>

              {/* Date/Time */}
              <View style={s.row}>
                <Text style={s.rowLabel}>📅 Show</Text>
                <Text style={s.rowVal}>{sc?.date}  {sc?.showtime}</Text>
              </View>

              {/* Seats */}
              <View style={s.row}>
                <Text style={s.rowLabel}>💺 Seats</Text>
                <Text style={[s.rowVal, { color: '#E50914', fontWeight: 'bold' }]}>{item.seats?.join(', ')}</Text>
              </View>

              {/* Total */}
              <View style={s.footer}>
                <Text style={s.dateCreated}>
                  Booked: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
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
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  summaryBar: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 14, borderBottomWidth: 1, borderBottomColor: '#333' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  summaryLabel: { color: '#aaa', fontSize: 10, marginTop: 2 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  refText: { color: '#888', fontSize: 12, fontWeight: '600' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeConfirmed: { backgroundColor: '#1a3d2a' },
  badgeCancelled: { backgroundColor: '#3d1a1a' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 7 },
  rowLabel: { color: '#666', fontSize: 12, width: 70 },
  rowVal: { color: '#ccc', fontSize: 12, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2a2a2a', paddingTop: 10, marginTop: 6 },
  dateCreated: { color: '#555', fontSize: 11 },
  totalPrice: { color: '#e9c46a', fontWeight: 'bold', fontSize: 16 },
});
