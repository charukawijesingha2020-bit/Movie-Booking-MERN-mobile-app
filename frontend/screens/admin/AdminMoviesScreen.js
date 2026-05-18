import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const EMPTY_FORM = { title: '', genre: '', duration: '', rating: 'PG-13', language: 'English', description: '', poster: '', director: '', cast: '' };

export default function AdminMoviesScreen() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMovies = useCallback(async () => {
    try {
      const { data } = await api.get('/movies/all');
      setMovies(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchMovies(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalVisible(true); };
  const openEdit = (movie) => {
    setEditing(movie._id);
    setForm({
      title: movie.title, genre: movie.genre?.join(', '), duration: String(movie.duration),
      rating: movie.rating || 'PG-13', language: movie.language || 'English',
      description: movie.description || '', poster: movie.poster || '',
      director: movie.director || '', cast: movie.cast?.join(', ') || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.genre.trim() || !form.duration)
      return Alert.alert('Validation', 'Title, genre, and duration are required');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        genre: form.genre.split(',').map(g => g.trim()).filter(Boolean),
        duration: parseInt(form.duration),
        rating: form.rating,
        language: form.language,
        description: form.description,
        poster: form.poster,
        director: form.director,
        cast: form.cast.split(',').map(c => c.trim()).filter(Boolean),
      };
      if (editing) await api.put(`/movies/${editing}`, payload);
      else await api.post('/movies', payload);
      setModalVisible(false);
      fetchMovies();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = (id, title) => {
    Alert.alert('Delete Movie', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/movies/${id}`); fetchMovies(); }
        catch (err) { Alert.alert('Error', 'Delete failed'); }
      }},
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={openAdd}>
        <Text style={s.addBtnText}>+ Add Movie</Text>
      </TouchableOpacity>

      <FlatList
        data={movies}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMovies(); }} tintColor="#3b82f6" />}
        ListEmptyComponent={<Text style={s.empty}>No movies yet. Add one!</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardMeta}>{item.genre?.join(', ')} • {item.duration} min • {item.rating}</Text>
              <Text style={s.cardLang}>{item.language}</Text>
              {!item.isActive && <Text style={s.inactive}>INACTIVE</Text>}
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn} onPress={() => openEdit(item)}>
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(item._id, item.title)}>
                <Text style={s.delBtnText}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{editing ? 'Edit Movie' : 'Add Movie'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: 'Title *', key: 'title', placeholder: 'e.g. Interstellar' },
                { label: 'Genre * (comma separated)', key: 'genre', placeholder: 'e.g. Sci-Fi, Drama' },
                { label: 'Duration (min) *', key: 'duration', placeholder: '169', keyboard: 'numeric' },
                { label: 'Rating', key: 'rating', placeholder: 'PG-13' },
                { label: 'Language', key: 'language', placeholder: 'English' },
                { label: 'Poster URL', key: 'poster', placeholder: 'https://...' },
                { label: 'Director', key: 'director', placeholder: 'Christopher Nolan' },
                { label: 'Cast (comma separated)', key: 'cast', placeholder: 'Actor 1, Actor 2' },
              ].map(f => (
                <View key={f.key}>
                  <Text style={s.mLabel}>{f.label}</Text>
                  <TextInput
                    style={s.mInput}
                    placeholder={f.placeholder}
                    placeholderTextColor="#555"
                    value={form[f.key]}
                    onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                    keyboardType={f.keyboard || 'default'}
                  />
                </View>
              ))}
              <Text style={s.mLabel}>Description</Text>
              <TextInput
                style={[s.mInput, { height: 80 }]}
                placeholder="Movie synopsis..."
                placeholderTextColor="#555"
                value={form.description}
                onChangeText={v => setForm(p => ({ ...p, description: v }))}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  addBtn: { backgroundColor: '#3b82f6', margin: 12, borderRadius: 10, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d1b2a', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1a3a5c' },
  cardLeft: { flex: 1 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cardMeta: { color: '#aaa', fontSize: 12, marginTop: 3 },
  cardLang: { color: '#666', fontSize: 11, marginTop: 2 },
  inactive: { color: '#ef4444', fontSize: 11, marginTop: 2, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#2a9d8f', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  delBtn: { backgroundColor: '#1f0a0a', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  delBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#0d1b2a', borderRadius: 18, padding: 20, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 14 },
  mLabel: { color: '#aaa', fontSize: 13, marginBottom: 5, marginTop: 10 },
  mInput: { backgroundColor: '#0f2840', color: '#fff', borderRadius: 8, padding: 11, fontSize: 14, borderWidth: 1, borderColor: '#1a3a5c' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#1a3a5c', borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelBtnText: { color: '#aaa', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 10, padding: 13, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
