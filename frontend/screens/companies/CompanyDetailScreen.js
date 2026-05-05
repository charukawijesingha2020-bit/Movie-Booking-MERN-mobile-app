import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import api from '../../services/api';

export default function CompanyDetailScreen({ route, navigation }) {
  const { companyId, companyName } = route.params;
  const [company, setCompany] = useState(null);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [c, h] = await Promise.all([
          api.get(`/companies/${companyId}`),
          api.get(`/halls/company/${companyId}`),
        ]);
        setCompany(c.data);
        setHalls(h.data);
      } catch (e) { Alert.alert('Error', 'Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [companyId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#E50914" /></View>;

  return (
    <View style={s.container}>
      {/* Company Info Header */}
      <View style={s.header}>
        <View style={s.iconCircle}><Text style={s.iconText}>{company?.name?.charAt(0)}</Text></View>
        <Text style={s.name}>{company?.name}</Text>
        <Text style={s.address}>📍 {company?.address}</Text>
        {company?.phone ? <Text style={s.phone}>📞 {company.phone}</Text> : null}
        {company?.description ? <Text style={s.desc}>{company.description}</Text> : null}
      </View>

      <Text style={s.sectionTitle}>🏟️  Halls ({halls.length})</Text>

      <FlatList
        data={halls}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={s.empty}>No halls found for this company.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.hallCard}
            onPress={() => navigation.navigate('HallDetail', { hallId: item._id, hallName: item.name })}
          >
            <View style={s.hallIcon}><Text style={s.hallIconText}>🎭</Text></View>
            <View style={s.hallInfo}>
              <Text style={s.hallName}>{item.name}</Text>
              <Text style={s.hallMeta}>{item.rows} rows × {item.seatsPerRow} seats = {item.rows * item.seatsPerRow} total</Text>
              {item.description ? <Text style={s.hallDesc}>{item.description}</Text> : null}
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#333' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E50914', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  iconText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  address: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  phone: { color: '#aaa', fontSize: 13, marginBottom: 4 },
  desc: { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 6 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 14 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  hallCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  hallIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  hallIconText: { fontSize: 22 },
  hallInfo: { flex: 1 },
  hallName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  hallMeta: { color: '#E50914', fontSize: 12, marginTop: 3 },
  hallDesc: { color: '#aaa', fontSize: 12, marginTop: 3 },
  chevron: { color: '#aaa', fontSize: 24 },
});
