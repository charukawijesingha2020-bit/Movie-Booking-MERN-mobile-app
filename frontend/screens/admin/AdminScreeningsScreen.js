import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const EMPTY = { movie: '', hall: '', date: '', showtime: '', ticketPrice: '' };

export default function AdminScreeningsScreen() {
  const [screenings, setScreenings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(null); // 'movie' | 'hall'

  const fetchData = useCallback(async () => {
    try {
      const [sc, m, h] = await Promise.all([
        api.get('/screenings/all'),
        api.get('/movies/all'),
        api.get('/halls'),
      ]);
      setScreenings(sc.data);
      setMovies(m.data);
      setHalls(h.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalVisible(true); };
  const openEdit = (sc) => {
    setEditing(sc._id);
    setForm({
      movie: sc.movie?._id || sc.movie,
      hall: sc.hall?._id || sc.hall,
      date: sc.date,
      showtime: sc.showtime,
      ticketPrice: String(sc.ticketPrice),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.movie || !form.hall || !form.date || !form.showtime || !form.ticketPrice)
      return Alert.alert('Validation', 'All fields are required');
    setSaving(true);
    try {
      const payload = { movie: form.movie, hall: form.hall, date: form.date, showtime: form.showtime, ticketPrice: parseFloat(form.ticketPrice) };
      if (editing) await api.put(`/screenings/${editing}`, payload);
      else await api.post('/screenings', payload);
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Screening', 'Remove this screening?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/screenings/${id}`); fetchData(); }
        catch { Alert.alert('Error', 'Delete failed'); }
      }},
    ]);
  };

  const selectedMovieName = movies.find(m => m._id === form.movie)?.title || 'Select Movie *';
  const selectedHallName = halls.find(h => h._id === form.hall)
    ? `${halls.find(h => h._id === form.hall).name} — ${halls.find(h => h._id === form.hall).company?.name}`
    : 'Select Hall *';

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={openAdd}>
        <Text style={s.addBtnText}>+ Assign Movie to Hall</Text>
      </TouchableOpacity>

      <FlatList
        data={screenings}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#3b82f6" />}
        ListEmptyComponent={<Text style={s.empty}>No screenings yet.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardBody}>
              <Text style={s.movieName} numberOfLines={1}>{item.movie?.title}</Text>
              <Text style={s.hallName}>{item.hall?.name} — {item.hall?.company?.name}</Text>
              <Text style={s.meta}>📅 {item.date}  🕐 {item.showtime}</Text>
              <Text style={s.price}>Rs. {item.ticketPrice} per seat  •  {item.bookedSeats?.length || 0} booked</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn} onPress={() => openEdit(item)}>
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(item._id)}>
                <Text style={s.delBtnText}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{editing ? 'Edit Screening' : 'New Screening'}</Text>
            <ScrollView>
              <Text style={s.mLabel}>Movie *</Text>
              <TouchableOpacity style={[s.mInput, { justifyContent: 'center' }]} onPress={() => setPicker('movie')}>
                <Text style={{ color: form.movie ? '#fff' : '#555' }} numberOfLines={1}>{selectedMovieName}</Text>
              </TouchableOpacity>

              <Text style={s.mLabel}>Hall *</Text>
              <TouchableOpacity style={[s.mInput, { justifyContent: 'center' }]} onPress={() => setPicker('hall')}>
                <Text style={{ color: form.hall ? '#fff' : '#555' }} numberOfLines={1}>{selectedHallName}</Text>
              </TouchableOpacity>

              <Text style={s.mLabel}>Date * (YYYY-MM-DD)</Text>
              <TextInput style={s.mInput} placeholder="2025-12-25" placeholderTextColor="#555"
                value={form.date} onChangeText={v => setForm(p => ({ ...p, date: v }))} />

              <Text style={s.mLabel}>Show Time * (HH:MM)</Text>
              <TextInput style={s.mInput} placeholder="14:30" placeholderTextColor="#555"
                value={form.showtime} onChangeText={v => setForm(p => ({ ...p, showtime: v }))} />

              <Text style={s.mLabel}>Ticket Price (Rs.) *</Text>
              <TextInput style={s.mInput} placeholder="500" placeholderTextColor="#555"
                value={form.ticketPrice} onChangeText={v => setForm(p => ({ ...p, ticketPrice: v }))}
                keyboardType="numeric" />
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

      {/* Picker Modal */}
      <Modal visible={!!picker} animationType="fade" transparent>
        <View style={s.overlay}>
          <View style={[s.modalCard, { maxHeight: '70%' }]}>
            <Text style={s.modalTitle}>{picker === 'movie' ? 'Select Movie' : 'Select Hall'}</Text>
            <FlatList
              data={picker === 'movie' ? movies : halls}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.pickerItem} onPress={() => {
                  setForm(p => ({ ...p, [picker]: item._id }));
                  setPicker(null);
                }}>
                  <Text style={[s.pickerText, form[picker] === item._id && { color: '#3b82f6', fontWeight: 'bold' }]}>
                    {picker === 'movie' ? item.title : `${item.name} — ${item.company?.name}`}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={[s.cancelBtn, { marginTop: 10 }]} onPress={() => setPicker(null)}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1b2a', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1a3a5c' },
  cardBody: { flex: 1 },
  movieName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  hallName: { color: '#2a9d8f', fontSize: 12, marginTop: 2 },
  meta: { color: '#aaa', fontSize: 12, marginTop: 4 },
  price: { color: '#e9c46a', fontSize: 12, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#2a9d8f', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  delBtn: { backgroundColor: '#1f0a0a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  delBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#0d1b2a', borderRadius: 18, padding: 20, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 14 },
  mLabel: { color: '#aaa', fontSize: 13, marginBottom: 5, marginTop: 10 },
  mInput: { backgroundColor: '#0f2840', color: '#fff', borderRadius: 8, padding: 11, fontSize: 14, borderWidth: 1, borderColor: '#1a3a5c' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#1a3a5c', borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelBtnText: { color: '#aaa', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 10, padding: 13, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  pickerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a3a5c' },
  pickerText: { color: '#ccc', fontSize: 14 },
});
