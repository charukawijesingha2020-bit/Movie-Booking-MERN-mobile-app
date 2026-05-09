import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const Stars = ({ rating }) => (
  <Text style={{ fontSize: 14, letterSpacing: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Text key={i} style={{ color: i <= rating ? '#ffd700' : '#444' }}>★</Text>
    ))}
  </Text>
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

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <View style={s.container}>
      {/* Movie selector */}
      <FlatList
        horizontal
        data={movies}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.moviePill, selectedMovie?._id === item._id && s.moviePillActive]}
            onPress={() => selectMovie(item)}
          >
            <Text style={[s.moviePillText, selectedMovie?._id === item._id && s.moviePillTextActive]}
              numberOfLines={1}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Stats bar */}
      {selectedMovie && (
        <View style={s.statsBar}>
          <Text style={s.movieName}>{selectedMovie.title}</Text>
          <View style={s.ratingInfo}>
            {avgRating ? (
              <>
                <Text style={s.avgRating}>{avgRating}</Text>
                <Stars rating={Math.round(avgRating)} />
                <Text style={s.reviewCount}>({reviews.length} reviews)</Text>
              </>
            ) : (
              <Text style={s.noRatings}>No reviews yet</Text>
            )}
          </View>
          <TouchableOpacity
            style={s.writeBtn}
            onPress={() => navigation.navigate('WriteFeedback', { movieId: selectedMovie._id, movieTitle: selectedMovie.title })}
          >
            <Text style={s.writeBtnText}>✍️ Write Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reviews list */}
      <FlatList
        style={{ flex: 1 }}
        data={reviews}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMovies(); }} tintColor="#E50914" />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyIcon}>⭐</Text>
            <Text style={s.emptyText}>No reviews for this movie yet</Text>
            <Text style={s.emptySubText}>Be the first to leave a review!</Text>
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
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  moviePill: { backgroundColor: '#2a2a2a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, maxWidth: 160 },
  moviePillActive: { backgroundColor: '#E50914' },
  moviePillText: { color: '#aaa', fontSize: 13 },
  moviePillTextActive: { color: '#fff', fontWeight: 'bold' },
  statsBar: { backgroundColor: '#1a1a1a', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  movieName: { color: '#fff', fontWeight: 'bold', fontSize: 17, marginBottom: 6 },
  ratingInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  avgRating: { color: '#ffd700', fontWeight: 'bold', fontSize: 22 },
  reviewCount: { color: '#aaa', fontSize: 13 },
  noRatings: { color: '#aaa', fontSize: 13 },
  writeBtn: { backgroundColor: '#E50914', borderRadius: 10, padding: 10, alignItems: 'center' },
  writeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptySubText: { color: '#aaa', fontSize: 13, marginTop: 4 },
  reviewCard: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E50914', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  reviewerInfo: { flex: 1 },
  reviewerName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  reviewDate: { color: '#555', fontSize: 11 },
  reviewComment: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  adminReply: { backgroundColor: '#2a2a2a', borderRadius: 8, padding: 10, marginTop: 10, borderLeftWidth: 3, borderLeftColor: '#E50914' },
  adminReplyLabel: { color: '#E50914', fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  adminReplyText: { color: '#ccc', fontSize: 13 },
});