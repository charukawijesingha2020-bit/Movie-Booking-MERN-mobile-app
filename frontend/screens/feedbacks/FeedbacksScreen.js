import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24',
};

const Stars = ({ rating, size = 13 }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Ionicons key={i} name={i <= rating ? 'star' : 'star-outline'} size={size} color={i <= rating ? T.gold : T.border} />
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

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? reviews.filter(r => r.rating === star).length / reviews.length : 0,
  }));

  return (
    <View style={s.container}>
      {/* Movie selector */}
      <FlatList
        horizontal
        data={movies}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 14, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.moviePill, selectedMovie?._id === item._id && s.moviePillActive]}
            onPress={() => selectMovie(item)}
          >
            <Text
              style={[s.moviePillText, selectedMovie?._id === item._id && s.moviePillTextActive]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Stats bar */}
      {selectedMovie && (
        <View style={s.statsBar}>
          <View style={s.statsLeft}>
            <Text style={s.statsMovieName} numberOfLines={1}>{selectedMovie.title}</Text>
            {avgRating ? (
              <View style={s.statsRatingRow}>
                <Text style={s.avgNum}>{avgRating}</Text>
                <View style={s.statsRatingRight}>
                  <Stars rating={Math.round(avgRating)} />
                  <Text style={s.reviewCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
                </View>
              </View>
            ) : (
              <Text style={s.noRatings}>No reviews yet — be first!</Text>
            )}
          </View>

          {/* Rating distribution mini-bars */}
          {avgRating && (
            <View style={s.distCol}>
              {ratingDist.map(({ star, pct }) => (
                <View key={star} style={s.distRow}>
                  <Text style={s.distStar}>{star}</Text>
                  <View style={s.distBarBg}>
                    <View style={[s.distBarFill, { width: `${pct * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={s.writeBtn}
            onPress={() => navigation.navigate('WriteFeedback', { movieId: selectedMovie._id, movieTitle: selectedMovie.title })}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={s.writeBtnText}>Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reviews list */}
      <FlatList
        style={{ flex: 1 }}
        data={reviews}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMovies(); }} tintColor={T.primary} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Ionicons name="star-outline" size={48} color={T.border} style={{ marginBottom: 12 }} />
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
              <View style={s.dateBadge}>
                <Ionicons name="calendar-outline" size={11} color={T.muted} />
                <Text style={s.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={s.reviewComment}>{item.comment}</Text>
            {item.adminReply ? (
              <View style={s.adminReply}>
                <View style={s.adminReplyHeader}>
                  <Ionicons name="film-outline" size={13} color={T.primary} />
                  <Text style={s.adminReplyLabel}>Cinema replied</Text>
                </View>
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

  statsBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, padding: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.border, gap: 12 },
  statsLeft: { flex: 1 },
  statsMovieName: { color: T.text, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  statsRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avgNum: { color: T.gold, fontWeight: '800', fontSize: 28 },
  statsRatingRight: { gap: 3 },
  reviewCount: { color: T.muted, fontSize: 12 },
  noRatings: { color: T.muted, fontSize: 13 },

  distCol: { width: 80, gap: 3 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distStar: { color: T.muted, fontSize: 9, width: 8 },
  distBarBg: { flex: 1, height: 4, backgroundColor: T.border, borderRadius: 2, overflow: 'hidden' },
  distBarFill: { height: '100%', backgroundColor: T.gold, borderRadius: 2 },

  writeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  writeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { color: T.text, fontWeight: '700', fontSize: 16 },
  emptySub: { color: T.muted, fontSize: 13, marginTop: 6 },

  reviewCard: { backgroundColor: T.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  reviewerInfo: { flex: 1, gap: 4 },
  reviewerName: { color: T.text, fontWeight: '700', fontSize: 14 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewDate: { color: T.muted, fontSize: 11 },
  reviewComment: { color: T.subtle, fontSize: 14, lineHeight: 22 },

  adminReply: { backgroundColor: T.elevated, borderRadius: 10, padding: 12, marginTop: 12, borderLeftWidth: 3, borderLeftColor: T.primary },
  adminReplyHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  adminReplyLabel: { color: T.primary, fontWeight: '700', fontSize: 12 },
  adminReplyText: { color: T.subtle, fontSize: 13 },
});
