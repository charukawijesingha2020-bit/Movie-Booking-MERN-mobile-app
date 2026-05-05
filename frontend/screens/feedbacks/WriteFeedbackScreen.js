import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import api from '../../services/api';

const STAR_COUNT = 5;

export default function WriteFeedbackScreen({ route, navigation }) {
  const { movieId, movieTitle } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert('Rating required', 'Please select a star rating.');
    if (!comment.trim()) return Alert.alert('Comment required', 'Please write a comment.');
    setLoading(true);
    try {
      await api.post('/reviews', { movieId, rating, comment: comment.trim() });
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not submit review');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.movieBanner}>
          <Text style={s.bannerLabel}>Reviewing</Text>
          <Text style={s.movieTitle}>{movieTitle}</Text>
        </View>

        {/* Star Rating */}
        <Text style={s.label}>Your Rating</Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <TouchableOpacity key={i} onPress={() => setRating(i)} style={s.star}>
              <Text style={[s.starText, i <= rating ? s.starActive : s.starInactive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={s.ratingLabel}>
            {['', '😞 Poor', '😐 Fair', '🙂 Good', '😊 Very Good', '🤩 Excellent!'][rating]}
          </Text>
        )}

        {/* Comment */}
        <Text style={s.label}>Your Review</Text>
        <TextInput
          style={s.textArea}
          placeholder="Share your thoughts about this movie..."
          placeholderTextColor="#555"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={s.charCount}>{comment.length}/500</Text>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Submit Review</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#141414' },
  container: { flex: 1, backgroundColor: '#141414' },
  content: { padding: 20 },
  movieBanner: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#E50914' },
  bannerLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  movieTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  label: { color: '#ccc', fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 8 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  star: { padding: 4 },
  starText: { fontSize: 40 },
  starActive: { color: '#ffd700' },
  starInactive: { color: '#333' },
  ratingLabel: { color: '#ffd700', fontSize: 15, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  textArea: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 12, padding: 14, fontSize: 14, minHeight: 130, borderWidth: 1, borderColor: '#333', marginBottom: 6 },
  charCount: { color: '#555', fontSize: 12, textAlign: 'right', marginBottom: 24 },
  btn: { backgroundColor: '#E50914', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { alignItems: 'center', padding: 14, marginTop: 10 },
  cancelBtnText: { color: '#aaa', fontSize: 14 },
});
