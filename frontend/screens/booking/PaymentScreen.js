import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';


const T = {
  bg: '#000000', surface: '#0d1b2a', elevated: '#0f2840',
  border: '#1a3a5c', primary: '#1e56a0', text: '#f1f5f9',
  muted: '#64748b', subtle: '#94a3b8', success: '#10b981',
  inputBg: '#0f2840', error: '#ef4444', gold: '#c8aa6e',
  cardBg: '#0d1b2a', cardBorder: '#1a3a5c',
};

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

// Detect card network by BIN prefix (standard IIN ranges).
const getCardType = (number) => {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  return null;
};

const validate = ({ cardNumber, expiry, cvv, cardHolder }) => {
  const digits = cardNumber.replace(/\s/g, '');
  if (digits.length !== 16) return 'Card number must be 16 digits';
  const [mm, yy] = expiry.split('/');
  if (!mm || !yy || mm.length !== 2 || yy.length !== 2) return 'Expiry must be MM/YY';
  const month = parseInt(mm, 10);
  const year = parseInt('20' + yy, 10);
  const now = new Date();
  if (month < 1 || month > 12) return 'Invalid expiry month';
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
    return 'Card has expired';
  if (cvv.length < 3) return 'CVV must be 3 or 4 digits';
  if (cardHolder.trim().length < 2) return 'Please enter cardholder name';
  return null;
};

// Live credit card visual
const CardPreview = ({ cardNumber, expiry, cardHolder, cardType }) => {
  const raw = cardNumber.replace(/\s/g, '').padEnd(16, '•');
  const maskedDisplay = [raw.slice(0, 4), raw.slice(4, 8), raw.slice(8, 12), raw.slice(12, 16)].join('  ');

  return (
    <View style={s.cardPreview}>
      <View style={s.cardGlowCircle1} />
      <View style={s.cardGlowCircle2} />
      <View style={s.cardTopRow}>
        <View style={s.chip}>
          <View style={s.chipLine} />
          <View style={s.chipLine} />
          <View style={s.chipLine} />
        </View>
        {cardType ? (
          <Text style={s.cardNetworkText}>{cardType}</Text>
        ) : (
          <Ionicons name="wifi-outline" size={20} color="rgba(255,255,255,0.3)" style={{ transform: [{ rotate: '90deg' }] }} />
        )}
      </View>
      <Text style={s.cardNumber}>{maskedDisplay}</Text>
      <View style={s.cardBottomRow}>
        <View>
          <Text style={s.cardMeta}>CARD HOLDER</Text>
          <Text style={s.cardValue} numberOfLines={1}>
            {cardHolder.trim() || 'YOUR NAME'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.cardMeta}>EXPIRES</Text>
          <Text style={s.cardValue}>{expiry || 'MM/YY'}</Text>
        </View>
      </View>
    </View>
  );
};

// Booking step progress bar
const StepBar = () => (
  <View style={s.stepRow}>
    {['Seats', 'Payment', 'Confirm'].map((label, i) => (
      <React.Fragment key={label}>
        <View style={s.stepItem}>
          <View style={[s.stepDot, i === 0 && s.stepDotDone, i === 1 && s.stepDotActive]}>
            {i === 0
              ? <Ionicons name="checkmark" size={12} color="#fff" />
              : <Text style={s.stepDotNum}>{i + 1}</Text>
            }
          </View>
          <Text style={[s.stepLabel, i === 1 && s.stepLabelActive]}>{label}</Text>
        </View>
        {i < 2 && <View style={[s.stepConnector, i === 0 && s.stepConnectorDone]} />}
      </React.Fragment>
    ))}
  </View>
);

export default function PaymentScreen({ route, navigation }) {
  const { screeningId, seats, totalPrice, screeningInfo } = route.params;

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [processing, setProcessing] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [focused, setFocused] = useState(null);

  const cardType = getCardType(cardNumber);

  const handlePay = async () => {
    const error = validate({ cardNumber, expiry, cvv, cardHolder });
    if (error) { setFieldError(error); return; }
    setFieldError('');
    setProcessing(true);

    // Artificial delay to mimic a real payment gateway round-trip.
    await new Promise(r => setTimeout(r, 1800));

    try {
      // Combine timestamp (base-36) with random suffix to make the reference unique without a DB sequence.
      const paymentRef = 'PAY' + Date.now().toString(36).toUpperCase() +
        Math.random().toString(36).substr(2, 4).toUpperCase();

      const { data } = await api.post('/bookings', {
        screeningId, seats, paymentRef,
        paymentMethod: 'card',
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
      });

      navigation.replace('BookingConfirm', { booking: data });
    } catch (err) {
      Alert.alert('Payment Failed', err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const inputRowStyle = (field) => [s.inputRow, focused === field && s.inputRowFocused];
  const iconColor = (field) => focused === field ? T.primary : T.muted;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        <StepBar />

        {/* Live Card Preview */}
        <CardPreview cardNumber={cardNumber} expiry={expiry} cardHolder={cardHolder} cardType={cardType} />

        {/* Accepted card types */}
        <View style={s.acceptedRow}>
          <Text style={s.acceptedLabel}>Accepted:</Text>
          {['VISA', 'MC', 'AMEX', 'MAESTRO'].map(b => (
            <View key={b} style={s.cardBadge}>
              <Text style={s.cardBadgeText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="receipt-outline" size={16} color={T.primary} />
            <Text style={s.sectionTitle}>Order Summary</Text>
          </View>
          <View style={s.summaryBox}>
            <View style={s.summaryAccent} />
            <View style={s.summaryInner}>
              <Text style={s.summaryMovie} numberOfLines={1}>{screeningInfo?.movieTitle || 'Movie'}</Text>
              <View style={s.summaryMeta}>
                <Ionicons name="location-outline" size={13} color={T.muted} />
                <Text style={s.summaryDetail}>{screeningInfo?.cinema} • {screeningInfo?.hall}</Text>
              </View>
              <View style={s.summaryMeta}>
                <Ionicons name="time-outline" size={13} color={T.muted} />
                <Text style={s.summaryDetail}>{screeningInfo?.date}  {screeningInfo?.showtime}</Text>
              </View>
              <View style={s.summaryDivider} />
              <View style={s.summaryRow}>
                <View style={s.seatChip}>
                  <Ionicons name="people-outline" size={13} color={T.primary} />
                  <Text style={s.seatChipText}>{seats.join(', ')}</Text>
                </View>
                <Text style={s.seatCount}>{seats.length} × Rs. {screeningInfo?.ticketPrice}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total Amount</Text>
                <Text style={s.summaryTotal}>Rs. {totalPrice}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card Details */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="card-outline" size={16} color={T.primary} />
            <Text style={s.sectionTitle}>Card Details</Text>
          </View>

          {/* Card Number */}
          <View style={s.inputGroup}>
            <Text style={s.label}>Card Number</Text>
            <View style={inputRowStyle('cardNumber')}>
              <Ionicons name="card-outline" size={18} color={iconColor('cardNumber')} style={s.prefixIcon} />
              <TextInput
                style={s.inputInner}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={T.muted}
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={v => setCardNumber(formatCardNumber(v))}
                onFocus={() => setFocused('cardNumber')}
                onBlur={() => setFocused(null)}
                maxLength={19}
              />
              {cardType && (
                <View style={s.networkTag}>
                  <Text style={s.networkTagText}>{cardType}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Expiry + CVV row */}
          <View style={s.row}>
            <View style={[s.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={s.label}>Expiry Date</Text>
              <View style={inputRowStyle('expiry')}>
                <Ionicons name="calendar-outline" size={18} color={iconColor('expiry')} style={s.prefixIcon} />
                <TextInput
                  style={s.inputInner}
                  placeholder="MM/YY"
                  placeholderTextColor={T.muted}
                  keyboardType="numeric"
                  value={expiry}
                  onChangeText={v => setExpiry(formatExpiry(v))}
                  onFocus={() => setFocused('expiry')}
                  onBlur={() => setFocused(null)}
                  maxLength={5}
                />
              </View>
            </View>
            <View style={[s.inputGroup, { flex: 1 }]}>
              <Text style={s.label}>CVV</Text>
              <View style={inputRowStyle('cvv')}>
                <Ionicons name="lock-closed-outline" size={18} color={iconColor('cvv')} style={s.prefixIcon} />
                <TextInput
                  style={s.inputInner}
                  placeholder="•••"
                  placeholderTextColor={T.muted}
                  keyboardType="numeric"
                  value={cvv}
                  onChangeText={v => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                  onFocus={() => setFocused('cvv')}
                  onBlur={() => setFocused(null)}
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={s.inputGroup}>
            <Text style={s.label}>Cardholder Name</Text>
            <View style={inputRowStyle('name')}>
              <Ionicons name="person-outline" size={18} color={iconColor('name')} style={s.prefixIcon} />
              <TextInput
                style={s.inputInner}
                placeholder="Name on card"
                placeholderTextColor={T.muted}
                autoCapitalize="words"
                value={cardHolder}
                onChangeText={setCardHolder}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {fieldError ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={16} color={T.error} />
              <Text style={s.errorText}>{fieldError}</Text>
            </View>
          ) : null}
        </View>

        {/* Security badges */}
        <View style={s.securityRow}>
          {[
            { icon: 'shield-checkmark', label: 'SSL Encrypted' },
            { icon: 'lock-closed', label: 'Secure Pay' },
            { icon: 'checkmark-circle', label: 'PCI Compliant' },
          ].map(({ icon, label }) => (
            <View key={label} style={s.secBadge}>
              <Ionicons name={icon} size={13} color={T.success} />
              <Text style={s.secBadgeText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Pay Button */}
        <TouchableOpacity
          style={[s.payBtn, processing && s.payBtnProcessing]}
          onPress={handlePay}
          disabled={processing}
          activeOpacity={0.85}
        >
          <View style={s.payBtnSheen} />
          {processing ? (
            <View style={s.payBtnInner}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={s.payBtnText}>Processing...</Text>
            </View>
          ) : (
            <View style={s.payBtnInner}>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={s.payBtnText}>Pay Rs. {totalPrice}</Text>
              <Ionicons name="arrow-forward-circle" size={20} color="rgba(255,255,255,0.65)" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={s.cancelHint}>Free cancellation before showtime</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { paddingBottom: 44 },

  // ── Step bar ──
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: 18, paddingBottom: 22 },
  stepItem: { alignItems: 'center', gap: 5 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: T.elevated, borderWidth: 1.5, borderColor: T.border, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: T.primary, borderColor: T.primary },
  stepDotDone: { backgroundColor: T.success, borderColor: T.success },
  stepDotNum: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepLabel: { color: T.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
  stepLabelActive: { color: T.text, fontWeight: '800' },
  stepConnector: { flex: 1, height: 1.5, backgroundColor: T.border, marginHorizontal: 6, marginBottom: 18 },
  stepConnectorDone: { backgroundColor: T.success },

  // ── Card Preview ──
  cardPreview: {
    marginHorizontal: 20, height: 188, borderRadius: 22,
    backgroundColor: T.cardBg, padding: 22, overflow: 'hidden',
    marginBottom: 14, borderWidth: 1, borderColor: T.cardBorder,
    shadowColor: T.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 18, elevation: 10,
  },
  cardGlowCircle1: { position: 'absolute', top: -50, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(30,86,160,0.12)' },
  cardGlowCircle2: { position: 'absolute', bottom: -40, left: -20, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(99,102,241,0.06)' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chip: { width: 42, height: 32, backgroundColor: T.gold, borderRadius: 6, justifyContent: 'space-around', paddingVertical: 7, paddingHorizontal: 5 },
  chipLine: { height: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  cardNetworkText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5, opacity: 0.9 },
  cardNumber: { color: '#fff', fontSize: 19, fontWeight: '600', letterSpacing: 3.5, marginBottom: 24 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: 1.8, marginBottom: 3 },
  cardValue: { color: '#fff', fontWeight: '700', fontSize: 13, maxWidth: 150 },

  // ── Accepted cards ──
  acceptedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 22 },
  acceptedLabel: { color: T.muted, fontSize: 12 },
  cardBadge: { borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  cardBadgeText: { color: T.subtle, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  // ── Sections ──
  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { color: T.text, fontSize: 15, fontWeight: '700' },

  // ── Summary ──
  summaryBox: { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  summaryAccent: { height: 3, backgroundColor: T.primary },
  summaryInner: { padding: 16 },
  summaryMovie: { color: T.text, fontSize: 17, fontWeight: '800', marginBottom: 9 },
  summaryMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  summaryDetail: { color: T.muted, fontSize: 13 },
  summaryDivider: { height: 1, backgroundColor: T.border, marginVertical: 13 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seatChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.primary + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: T.primary + '35' },
  seatChipText: { color: T.primary, fontSize: 13, fontWeight: '600' },
  seatCount: { color: T.muted, fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: T.elevated, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  totalLabel: { color: T.subtle, fontSize: 13, fontWeight: '600' },
  summaryTotal: { color: T.primary, fontSize: 20, fontWeight: '800' },

  // ── Inputs ──
  inputGroup: { marginBottom: 14 },
  label: { color: T.subtle, fontSize: 12, fontWeight: '600', marginBottom: 7, letterSpacing: 0.3 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.inputBg, borderRadius: 12, borderWidth: 1.5, borderColor: T.border },
  inputRowFocused: { borderColor: T.primary, shadowColor: T.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 6 },
  prefixIcon: { paddingLeft: 14 },
  inputInner: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, color: T.text, fontSize: 15 },
  networkTag: { marginRight: 12, backgroundColor: T.elevated, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: T.border },
  networkTagText: { color: T.subtle, fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row' },

  // ── Error ──
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.error + '18', borderRadius: 10, padding: 12, gap: 8, marginTop: 4, borderWidth: 1, borderColor: T.error + '35' },
  errorText: { color: T.error, fontSize: 13, flex: 1 },

  // ── Security badges ──
  securityRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 22, paddingHorizontal: 20 },
  secBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.success + '12', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1, borderColor: T.success + '28' },
  secBadgeText: { color: T.success, fontSize: 11, fontWeight: '600' },

  // ── Pay button ──
  payBtn: {
    marginHorizontal: 20, backgroundColor: T.primary, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', overflow: 'hidden',
    shadowColor: T.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 9,
  },
  payBtnProcessing: { opacity: 0.72 },
  payBtnSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.09)', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  payBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  cancelHint: { color: T.muted, fontSize: 12, textAlign: 'center', marginTop: 16 },
});
