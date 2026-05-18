import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const T = {
  bg: '#09090f', surface: '#13131f', elevated: '#1c1c2e',
  border: '#252536', primary: '#e50914', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', gold: '#fbbf24', success: '#10b981',
};

const RATING_META = [
  null,
  { label: 'Poor',      icon: 'sad-outline',     color: T.primary },
  { label: 'Fair',      icon: 'remove-circle-outline', color: '#f97316' },
  { label: 'Good',      icon: 'happy-outline',   color: '#eab308' },
  { label: 'Very Good', icon: 'thumbs-up-outline', color: '#84cc16' },
  { label: 'Excellent', icon: 'star',             color: T.success },
];

const MAX_CHARS = 500;

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

  const meta = rating > 0 ? RATING_META[rating] : null;
  const charPct = comment.length / MAX_CHARS;
  const charColor = charPct > 0.9 ? T.primary : charPct > 0.7 ? '#f59e0b' : T.success;

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Movie banner */}
        <View style={s.movieBanner}>
          <View style={s.bannerAccent} />
          <View style={s.bannerContent}>
            <View style={s.bannerIconWrap}>
              <Ionicons name="film-outline" size={20} color={T.primary} />
            </View>
            <View style={s.bannerText}>
              <Text style={s.bannerLabel}>REVIEWING</Text>
              <Text style={s.movieTitle} numberOfLines={2}>{movieTitle}</Text>
            </View>
          </View>
        </View>

        {/* Star rating */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Your Rating</Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} style={s.starBtn} activeOpacity={0.7}>
                <Ionicons
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={44}
                  color={i <= rating ? T.gold : T.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          {meta && (
            <View style={[s.ratingFeedback, { borderColor: meta.color + '40', backgroundColor: meta.color + '12' }]}>
              <Ionicons name={meta.icon} size={18} color={meta.color} />
              <Text style={[s.ratingFeedbackText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          )}
        </View>

        {/* Comment */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Your Review</Text>
          <View style={s.textAreaWrap}>
            <TextInput
              style={s.textArea}
              placeholder="Share your thoughts about this movie..."
              placeholderTextColor={T.muted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={MAX_CHARS}
            />
          </View>
          {/* Char count with progress bar */}
          <View style={s.charRow}>
            <View style={s.charBarBg}>
              <View style={[s.charBarFill, { width: `${charPct * 100}%`, backgroundColor: charColor }]} />
            </View>
            <Text style={[s.charCount, { color: charColor }]}>{comment.length} / {MAX_CHARS}</Text>
          </View>
        </View>

        {/* Tips */}
        <View style={s.tipsBox}>
          <Ionicons name="information-circle-outline" size={14} color={T.muted} />
          <Text style={s.tipsText}>Helpful reviews mention story, acting, and overall experience.</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, (loading || rating === 0 || !comment.trim()) && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <View style={s.submitBtnSheen} />
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={s.submitBtnInner}>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={s.submitBtnText}>Submit Review</Text>
            </View>
          )}
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

  movieBanner: { backgroundColor: T.surface, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  bannerAccent: { height: 3, backgroundColor: T.primary },
  bannerContent: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  bannerIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: T.primary + '18', borderWidth: 1, borderColor: T.primary + '35', justifyContent: 'center', alignItems: 'center' },
  bannerText: { flex: 1 },
  bannerLabel: { color: T.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  movieTitle: { color: T.text, fontSize: 18, fontWeight: '800' },

  section: { marginBottom: 24 },
  sectionLabel: { color: T.subtle, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },

  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  starBtn: { padding: 4 },

  ratingFeedback: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  ratingFeedbackText: { fontSize: 14, fontWeight: '700' },

  textAreaWrap: { backgroundColor: T.surface, borderRadius: 14, borderWidth: 1.5, borderColor: T.border, overflow: 'hidden' },
  textArea: { color: T.text, fontSize: 14, padding: 16, minHeight: 130 },
  charRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  charBarBg: { flex: 1, height: 3, backgroundColor: T.border, borderRadius: 2, overflow: 'hidden' },
  charBarFill: { height: '100%', borderRadius: 2 },
  charCount: { fontSize: 12, fontWeight: '600', minWidth: 60, textAlign: 'right' },

  tipsBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: T.elevated, borderRadius: 12, padding: 12, marginBottom: 20 },
  tipsText: { color: T.muted, fontSize: 12, flex: 1, lineHeight: 18 },

  submitBtn: { backgroundColor: T.primary, borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginBottom: 12, overflow: 'hidden', shadowColor: T.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  submitBtnDisabled: { opacity: 0.55 },
  submitBtnSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.08)', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  cancelBtn: { alignItems: 'center', padding: 14 },
  cancelBtnText: { color: T.muted, fontSize: 14, fontWeight: '600' },
});