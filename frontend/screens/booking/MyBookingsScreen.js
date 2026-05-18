import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', success: '#10b981',
};

const DetailBox = ({ icon, label, value }) => (
  <View style={s.detailBox}>
    <View style={s.detailLabelRow}>
      <Ionicons name={icon} size={11} color={T.muted} />
      <Text style={s.detailLabel}>{label}</Text>
    </View>
    <Text style={s.detailVal} numberOfLines={1}>{value || '—'}</Text>
  </View>
);

const TABS = ['All', 'Active', 'Cancelled'];

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

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

  const active = bookings.filter(b => b.status !== 'cancelled').length;

  const filtered = bookings.filter(b => {
    if (activeTab === 'Active') return b.status !== 'cancelled';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <View style={s.container}>
      {bookings.length > 0 && (
        <View style={s.summaryBar}>
          <View style={s.summaryItem}>
            <Text style={s.summaryNum}>{bookings.length}</Text>
            <Text style={s.summaryLabel}>Total</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryNum, { color: T.success }]}>{active}</Text>
            <Text style={s.summaryLabel}>Active</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryItem}>
            <Text style={[s.summaryNum, { color: T.primary }]}>{bookings.length - active}</Text>
            <Text style={s.summaryLabel}>Cancelled</Text>
          </View>
        </View>
      )}

      <View style={s.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabItem, activeTab === tab && s.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            {tab === 'Active' && (
              <View style={s.tabBadge}><Text style={s.tabBadgeText}>{active}</Text></View>
            )}
            {tab === 'Cancelled' && bookings.length - active > 0 && (
              <View style={[s.tabBadge, s.tabBadgeCancelled]}><Text style={s.tabBadgeText}>{bookings.length - active}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={T.primary} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="ticket-outline" size={40} color={T.muted} />
            </View>
            <Text style={s.emptyTitle}>No bookings yet</Text>
            <Text style={s.emptySub}>Book a movie to see your tickets here</Text>
            <TouchableOpacity style={s.exploreBtn} onPress={() => navigation.navigate('Movies')}>
              <Ionicons name="film-outline" size={16} color="#fff" />
              <Text style={s.exploreBtnText}>Browse Movies</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const sc = item.screening;
          const isCancelled = item.status === 'cancelled';
          return (
            <View style={[s.card, isCancelled && s.cardCancelled]}>
              {/* Top bar */}
              <View style={[s.cardTopBar, { backgroundColor: isCancelled ? T.primary : T.success }]} />

              <View style={s.cardBody}>
                {/* Header row */}
                <View style={s.cardHeader}>
                  <View style={s.refRow}>
                    <Ionicons name="receipt-outline" size={13} color={T.muted} />
                    <Text style={s.refText}>#{item.bookingRef}</Text>
                  </View>
                  <View style={[s.statusBadge, isCancelled ? s.badgeCancelled : s.badgeConfirmed]}>
                    <View style={[s.statusDot, { backgroundColor: isCancelled ? T.primary : T.success }]} />
                    <Text style={[s.statusText, { color: isCancelled ? T.primary : T.success }]}>
                      {item.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={s.movieTitle} numberOfLines={1}>{sc?.movie?.title || 'Movie'}</Text>

                {/* Details grid */}
                <View style={s.detailsGrid}>
                  <DetailBox icon="business-outline"   label="Cinema" value={sc?.hall?.company?.name} />
                  <DetailBox icon="grid-outline"       label="Hall"   value={sc?.hall?.name} />
                  <DetailBox icon="calendar-outline"   label="Date"   value={sc?.date} />
                  <DetailBox icon="time-outline"       label="Time"   value={sc?.showtime} />
                </View>

                {/* Seats */}
                <View style={s.seatsRow}>
                  <Ionicons name="people-outline" size={14} color={T.primary} />
                  <Text style={s.seatsLabel}>Seats</Text>
                  <Text style={s.seatsVal}>{item.seats?.join(', ')}</Text>
                </View>

                {/* Footer */}
                <View style={s.cardFooter}>
                  <Text style={s.totalPrice}>Rs. {item.totalPrice}</Text>
                  {!isCancelled && (
                    <TouchableOpacity style={s.cancelBtn} onPress={() => handleCancel(item._id)}>
                      <Ionicons name="close-circle-outline" size={14} color={T.primary} />
                      <Text style={s.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
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

  summaryBar: { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, paddingVertical: 14 },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryNum: { color: T.text, fontWeight: '800', fontSize: 20 },
  summaryLabel: { color: T.muted, fontSize: 11, fontWeight: '600' },
  summaryDivider: { width: 1, backgroundColor: T.border },

  emptyWrap: { alignItems: 'center', marginTop: 80 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { color: T.text, fontSize: 20, fontWeight: '700' },
  emptySub: { color: T.muted, fontSize: 14, marginTop: 6, marginBottom: 24, textAlign: 'center' },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13 },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  card: { backgroundColor: T.surface, borderRadius: 20, marginBottom: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  cardCancelled: { opacity: 0.55 },
  cardTopBar: { height: 3 },
  cardBody: { padding: 16 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  refText: { color: T.muted, fontSize: 12, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeConfirmed: { backgroundColor: T.success + '20' },
  badgeCancelled: { backgroundColor: T.primary + '20' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  movieTitle: { color: T.text, fontWeight: '800', fontSize: 18, marginBottom: 14 },

  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  detailBox: { width: '47%', backgroundColor: T.elevated, borderRadius: 10, padding: 10 },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  detailLabel: { color: T.muted, fontSize: 11 },
  detailVal: { color: T.text, fontSize: 13, fontWeight: '600' },

  seatsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.elevated, borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: T.primary + '25' },
  seatsLabel: { color: T.muted, fontSize: 13, marginRight: 4 },
  seatsVal: { color: T.primary, fontWeight: '700', fontSize: 13, flex: 1 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: T.border, paddingTop: 12 },
  totalPrice: { color: T.primary, fontWeight: '800', fontSize: 22 },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: T.primary + '66', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  cancelBtnText: { color: T.primary, fontWeight: '700', fontSize: 13 },

  tabBar: { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: T.primary },
  tabText: { color: T.muted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: T.text, fontWeight: '700' },
  tabBadge: { backgroundColor: T.success + '30', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeCancelled: { backgroundColor: T.primary + '30' },
  tabBadgeText: { color: T.text, fontSize: 11, fontWeight: '700' },
});