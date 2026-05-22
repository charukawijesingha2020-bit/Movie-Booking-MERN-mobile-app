import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, ScrollView, RefreshControl, Image,
} from 'react-native';
import api from '../../services/api';

const EMPTY = { name: '', company: '', rows: '', seatsPerRow: '', description: '', image: '' };


export default function AdminHallsScreen() {
  const [halls, setHalls] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([api.get('/halls'), api.get('/companies')]);
      setHalls(h.data);
      setCompanies(c.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalVisible(true); };
  const openEdit = (hall) => {
    setEditing(hall._id);
    setForm({
      name: hall.name,
      company: hall.company?._id || hall.company,
      rows: String(hall.rows),
      seatsPerRow: String(hall.seatsPerRow),
      description: hall.description || '',
      image: hall.image || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.company || !form.rows || !form.seatsPerRow)
      return Alert.alert('Validation', 'Name, company, rows and seats per row are required');
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), company: form.company, rows: parseInt(form.rows), seatsPerRow: parseInt(form.seatsPerRow), description: form.description, image: form.image.trim() || undefined };
      if (editing) await api.put(`/halls/${editing}`, payload);
      else await api.post('/halls', payload);
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Hall', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/halls/${id}`); fetchData(); }
        catch { Alert.alert('Error', 'Delete failed'); }
      }},
    ]);
  };

  const selectedCompanyName = companies.find(c => c._id === form.company)?.name || 'Select Company *';

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={openAdd}>
        <Text style={s.addBtnText}>+ Add Hall</Text>
      </TouchableOpacity>

      <FlatList
        data={halls}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#3b82f6" />}
        ListEmptyComponent={<Text style={s.empty}>No halls yet.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={s.cardThumb} resizeMode="cover" />
            ) : (
              <View style={[s.cardThumb, s.cardThumbFallback]}>
                <Text style={{ fontSize: 20 }}>🎭</Text>
              </View>
            )}
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>{item.name}</Text>
              <Text style={s.cardCompany}>{item.company?.name}</Text>
              <Text style={s.cardMeta}>{item.rows} rows × {item.seatsPerRow} seats = <Text style={s.totalHighlight}>{item.rows * item.seatsPerRow}</Text> total</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.editBtn} onPress={() => openEdit(item)}>
                <Text style={s.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(item._id, item.name)}>
                <Text style={s.delBtnText}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{editing ? 'Edit Hall' : 'Add Hall'}</Text>
            <ScrollView>
              <Text style={s.mLabel}>Hall Name *</Text>
              <TextInput style={s.mInput} placeholder="e.g. Hall 1 – Gold" placeholderTextColor="#555"
                value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />

              {/* Company Picker */}
              <Text style={s.mLabel}>Cinema Company *</Text>
              <TouchableOpacity style={[s.mInput, { justifyContent: 'center' }]} onPress={() => setCompanyPickerOpen(true)}>
                <Text style={{ color: form.company ? '#fff' : '#555' }}>{selectedCompanyName}</Text>
              </TouchableOpacity>

              <Text style={s.mLabel}>Rows *</Text>
              <TextInput style={s.mInput} placeholder="e.g. 8" placeholderTextColor="#555" keyboardType="numeric"
                value={form.rows} onChangeText={v => setForm(p => ({ ...p, rows: v }))} />

              <Text style={s.mLabel}>Seats Per Row *</Text>
              <TextInput style={s.mInput} placeholder="e.g. 10" placeholderTextColor="#555" keyboardType="numeric"
                value={form.seatsPerRow} onChangeText={v => setForm(p => ({ ...p, seatsPerRow: v }))} />

              <Text style={s.mLabel}>Description</Text>
              <TextInput style={[s.mInput, { height: 60 }]} placeholder="Optional description..." placeholderTextColor="#555"
                value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} multiline textAlignVertical="top" />

              <Text style={s.mLabel}>Hall Image URL</Text>
              <TextInput style={s.mInput} placeholder="https://..." placeholderTextColor="#555"
                value={form.image} onChangeText={v => setForm(p => ({ ...p, image: v }))}
                autoCapitalize="none" keyboardType="url" />
              {form.image ? (
                <Image source={{ uri: form.image }} style={s.imagePreview} resizeMode="cover" />
              ) : null}

              {form.rows && form.seatsPerRow ? (
                <Text style={s.totalSeats}>Total Seats: {parseInt(form.rows || 0) * parseInt(form.seatsPerRow || 0)}</Text>
              ) : null}
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

      {/* Company Picker Modal */}
      <Modal visible={companyPickerOpen} animationType="fade" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { maxHeight: '60%' }]}>
            <Text style={s.modalTitle}>Select Company</Text>
            <FlatList
              data={companies}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.pickerItem} onPress={() => { setForm(p => ({ ...p, company: item._id })); setCompanyPickerOpen(false); }}>
                  <Text style={[s.pickerItemText, form.company === item._id && { color: '#3b82f6', fontWeight: 'bold' }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={s.cancelBtn} onPress={() => setCompanyPickerOpen(false)}>
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1b2a', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1a3a5c', gap: 12 },
  cardThumb: { width: 52, height: 52, borderRadius: 8 },
  cardThumbFallback: { backgroundColor: '#0f2840', justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  imagePreview: { width: '100%', height: 140, borderRadius: 10, marginTop: 10, backgroundColor: '#0f2840' },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cardCompany: { color: '#aaa', fontSize: 12, marginTop: 2 },
  cardMeta: { color: '#888', fontSize: 12, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#2a9d8f', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  delBtn: { backgroundColor: '#1f0a0a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  delBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#0d1b2a', borderRadius: 18, padding: 20, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 14 },
  mLabel: { color: '#aaa', fontSize: 13, marginBottom: 5, marginTop: 10 },
  mInput: { backgroundColor: '#0f2840', color: '#fff', borderRadius: 8, padding: 11, fontSize: 14, borderWidth: 1, borderColor: '#1a3a5c' },
  totalSeats: { color: '#2a9d8f', fontWeight: 'bold', fontSize: 14, textAlign: 'center', marginTop: 12 },
  totalHighlight: { color: '#3b82f6', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#1a3a5c', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { color: '#aaa', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 10, padding: 13, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  pickerItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a3a5c' },
  pickerItemText: { color: '#ccc', fontSize: 15 },
});
