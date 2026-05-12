import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24',
};

const Stars = ({ rating }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={{ fontSize: 13, color: i <= rating ? T.gold : T.border }}>★</Text>
    ))}
  </View>
);

export default function FeedbacksScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = useCallback(async () => {
    try {
      const { data } = await api.get('/movies');
      setMovies(data);
      if (data.length > 0) {
        setSelectedMovie(data[0]);
        const { data: reviewData } = await api.get(`/reviews/movie/${data[0]._id}`);
        setReviews(reviewData);
      }
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchReviews = async (movieId) => {
    try {
      const { data } = await api.get(`/reviews/movie/${movieId}`);
      setReviews(data);
    } catch (e) { console.log(e); }
  };

  const selectMovie = (movie) => {
    setSelectedMovie(movie);
    fetchReviews(movie._id);
  };

  useEffect(() => { fetchMovies(); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={T.primary} /></View>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <View style={s.container}>
      <FlatList
        horizontal
        data={movies}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 14, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.moviePill, selectedMovie?._id === item._id && s.moviePillActive]}
            onPress={() => selectMovie(item)}>
            <Text style={[s.moviePillText, selectedMovie?._id === item._id && s.moviePillTextActive]}
              numberOfLines={1}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />






      {selectedMovie && (
        <View style={s.statsBar}>
          <View style={s.statsLeft}>
            <Text style={s.statsMovieName} numberOfLines={1}>{selectedMovie.title}</Text>
            {avgRating ? (
              <View style={s.statsRating}>
                <Text style={s.avgRatingNum}>{avgRating}</Text>
                <View>
                  <Stars rating={Math.round(avgRating)} />
                  <Text style={s.reviewCount}>{reviews.length} reviews</Text>
                </View>
              </View>
            ) : (
              <Text style={s.noRatings}>No reviews yet — be first!</Text>
            )}
          </View>
          <TouchableOpacity style={s.writeBtn}
            onPress={() => navigation.navigate('WriteFeedback', { movieId: selectedMovie._id, movieTitle: selectedMovie.title })}>
            <Text style={s.writeBtnText}>✍️ Review</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        style={{ flex: 1 }}
        data={reviews}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMovies(); }} tintColor={T.primary} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>⭐</Text>
            <Text style={s.emptyTitle}>No reviews yet</Text>
            <Text style={s.emptySub}>Be the first to leave a review!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.reviewCard}>
            <View style={s.reviewHeader}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{item.user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
              </View>
              <View style={s.reviewerInfo}>
                <Text style={s.reviewerName}>{item.user?.name}</Text>
                <Stars rating={item.rating} />
              </View>
              <Text style={s.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={s.reviewComment}>{item.comment}</Text>
            {item.adminReply ? (
              <View style={s.adminReply}>
                <Text style={s.adminReplyLabel}>🎬 Cinema replied:</Text>
                <Text style={s.adminReplyText}>{item.adminReply}</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg },
  moviePill: { backgroundColor: T.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, maxWidth: 160, borderWidth: 1, borderColor: T.border },
  moviePillActive: { backgroundColor: T.primary, borderColor: T.primary },
  moviePillText: { color: T.muted, fontSize: 13, fontWeight: '600' },
  moviePillTextActive: { color: '#fff', fontWeight: '700' },
  statsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, padding: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.border },
  statsLeft: { flex: 1, marginRight: 12 },
  statsMovieName: { color: T.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  statsRating: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avgRatingNum: { color: T.gold, fontWeight: '800', fontSize: 28 },
  reviewCount: { color: T.muted, fontSize: 12, marginTop: 2 },
  noRatings: { color: T.muted, fontSize: 13 },
  writeBtn: { backgroundColor: T.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  writeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: T.text, fontWeight: '700', fontSize: 16 },
  emptySub: { color: T.muted, fontSize: 13, marginTop: 6 },
  reviewCard: { backgroundColor: T.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  reviewerInfo: { flex: 1, gap: 4 },
  reviewerName: { color: T.text, fontWeight: '700', fontSize: 14 },
  reviewDate: { color: T.muted, fontSize: 11 },
  reviewComment: { color: T.subtle, fontSize: 14, lineHeight: 22 },
  adminReply: { backgroundColor: T.elevated, borderRadius: 10, padding: 12, marginTop: 12, borderLeftWidth: 3, borderLeftColor: T.primary },
  adminReplyLabel: { color: T.primary, fontWeight: '700', fontSize: 12, marginBottom: 4 },
  adminReplyText: { color: T.subtle, fontSize: 13 },
});
