import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24',
};

const LABELS = ['', '😞 Poor', '😐 Fair', '🙂 Good', '😊 Very Good', '🤩 Excellent!'];

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
      Alert.alert('Thank you!', 'Your review has been submitted.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not submit review');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.movieBanner}>
          <Text style={s.bannerLabel}>REVIEWING</Text>
          <Text style={s.movieTitle}>{movieTitle}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Your Rating</Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} style={s.starBtn}>
                <Text style={[s.starText, { color: i <= rating ? T.gold : T.border }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <View style={s.ratingLabelWrap}>
              <Text style={s.ratingLabel}>{LABELS[rating]}</Text>
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Your Review</Text>
          <TextInput
            style={s.textArea}
            placeholder="Share your thoughts about this movie..."
            placeholderTextColor={T.muted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={s.charCount}>{comment.length} / 500</Text>
        </View>

        <TouchableOpacity style={[s.submitBtn, loading && s.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Submit Review</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: T.bg },
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20 },
  movieBanner: { backgroundColor: T.surface, borderRadius: 16, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: T.border, borderLeftWidth: 4, borderLeftColor: T.primary },
  bannerLabel: { color: T.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  movieTitle: { color: T.text, fontSize: 20, fontWeight: '800' },
  section: { marginBottom: 24 },
  sectionLabel: { color: T.subtle, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },
  starsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  starBtn: { padding: 4 },
  starText: { fontSize: 44 },
  ratingLabelWrap: { alignSelf: 'flex-start', backgroundColor: T.gold + '22', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  ratingLabel: { color: T.gold, fontSize: 14, fontWeight: '700' },
  textArea: { backgroundColor: T.surface, color: T.text, borderRadius: 14, padding: 16, fontSize: 14, minHeight: 130, borderWidth: 1, borderColor: T.border },
  charCount: { color: T.muted, fontSize: 12, textAlign: 'right', marginTop: 8 },
  submitBtn: { backgroundColor: T.primary, borderRadius: 16, padding: 17, alignItems: 'center', marginBottom: 12 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { alignItems: 'center', padding: 14 },
  cancelBtnText: { color: T.muted, fontSize: 14, fontWeight: '600' },
});
