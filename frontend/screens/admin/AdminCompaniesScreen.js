import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import api from '../../services/api';

const EMPTY = { name: '', address: '', phone: '', description: '', logo: '' };

export default function AdminCompaniesScreen() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchCompanies(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalVisible(true); };
  const openEdit = (c) => {
    setEditing(c._id);
    setForm({ name: c.name, address: c.address, phone: c.phone || '', description: c.description || '', logo: c.logo || '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim())
      return Alert.alert('Validation', 'Name and address are required');
    setSaving(true);
    try {
      if (editing) await api.put(`/companies/${editing}`, form);
      else await api.post('/companies', form);
      setModalVisible(false);
      fetchCompanies();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Company', `Delete "${name}"? All halls linked to this company must also be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/companies/${id}`); fetchCompanies(); }
        catch (err) { Alert.alert('Error', 'Delete failed'); }
      }},
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.addBtn} onPress={openAdd}>
        <Text style={s.addBtnText}>+ Add Cinema Company</Text>
      </TouchableOpacity>

      <FlatList
        data={companies}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCompanies(); }} tintColor="#E50914" />}
        ListEmptyComponent={<Text style={s.empty}>No companies yet.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.iconCircle}><Text style={s.iconText}>{item.name.charAt(0)}</Text></View>
            <View style={s.cardBody}>
              <Text style={s.cardTitle}>{item.name}</Text>
              <Text style={s.cardMeta} numberOfLines={1}>📍 {item.address}</Text>
              {item.phone ? <Text style={s.cardMeta}>📞 {item.phone}</Text> : null}
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
            <Text style={s.modalTitle}>{editing ? 'Edit Company' : 'Add Company'}</Text>
            <ScrollView>
              {[
                { label: 'Company Name *', key: 'name', placeholder: 'Milano Movie Center' },
                { label: 'Address *', key: 'address', placeholder: '123 Main Street, Colombo' },
                { label: 'Phone', key: 'phone', placeholder: '+94 11 234 5678' },
                { label: 'Logo URL', key: 'logo', placeholder: 'https://...' },
              ].map(f => (
                <View key={f.key}>
                  <Text style={s.mLabel}>{f.label}</Text>
                  <TextInput style={s.mInput} placeholder={f.placeholder} placeholderTextColor="#555"
                    value={form[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))} />
                </View>
              ))}
              <Text style={s.mLabel}>Description</Text>
              <TextInput style={[s.mInput, { height: 70 }]} placeholder="Company description..."
                placeholderTextColor="#555" value={form.description}
                onChangeText={v => setForm(p => ({ ...p, description: v }))}
                multiline textAlignVertical="top" />
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
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  addBtn: { backgroundColor: '#E50914', margin: 12, borderRadius: 10, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a' },
  iconCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E50914', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  cardBody: { flex: 1 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cardMeta: { color: '#aaa', fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#2a9d8f', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  delBtn: { backgroundColor: '#5a1a1a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  delBtnText: { color: '#E50914', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#1a1a1a', borderRadius: 18, padding: 20, maxHeight: '85%' },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 14 },
  mLabel: { color: '#aaa', fontSize: 13, marginBottom: 5, marginTop: 10 },
  mInput: { backgroundColor: '#2a2a2a', color: '#fff', borderRadius: 8, padding: 11, fontSize: 14, borderWidth: 1, borderColor: '#333' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 13, alignItems: 'center' },
  cancelBtnText: { color: '#aaa', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#E50914', borderRadius: 10, padding: 13, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
});
