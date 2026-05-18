import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';

// User Screens
import HomeScreen from '../screens/HomeScreen';
import MovieListScreen from '../screens/movies/MovieListScreen';
import MovieDetailScreen from '../screens/movies/MovieDetailScreen';
import CompanyDetailScreen from '../screens/companies/CompanyDetailScreen';
import HallDetailScreen from '../screens/halls/HallDetailScreen';
import SeatSelectionScreen from '../screens/booking/SeatSelectionScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';

// Feedback
import FeedbacksScreen from '../screens/feedbacks/FeedbacksScreen';
import WriteFeedbackScreen from '../screens/feedbacks/WriteFeedbackScreen';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminMoviesScreen from '../screens/admin/AdminMoviesScreen';
import AdminCompaniesScreen from '../screens/admin/AdminCompaniesScreen';
import AdminHallsScreen from '../screens/admin/AdminHallsScreen';
import AdminScreeningsScreen from '../screens/admin/AdminScreeningsScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = { primary: '#1e56a0', adminPrimary: '#3b82f6', dark: '#000000', card: '#0d1b2a', border: '#1a3a5c', text: '#f1f5f9', muted: '#64748b' };

// ─── Auth Stack ───────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    </Stack.Navigator>
  );
}

// ─── User Tab Navigator ───────────────────────────────────────
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = { Home: 'home', Movies: 'film', MyBookings: 'ticket', Reviews: 'chatbubble' };
          const name = icons[route.name] + (focused ? '' : '-outline');
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border, height: 60, paddingBottom: 8 },
        headerStyle: { backgroundColor: COLORS.dark, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '🎬 CineBook' }} />
      <Tab.Screen name="Movies" component={MovieListScreen} options={{ title: 'Movies' }} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Tickets' }} />
      <Tab.Screen name="Reviews" component={FeedbacksScreen} options={{ title: 'Reviews' }} />
    </Tab.Navigator>
  );
}

// ─── Admin Tab Navigator ──────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            AdminDash: 'grid', AdminMovies: 'film', AdminCompanies: 'business',
            AdminHalls: 'layers', AdminScreenings: 'calendar', AdminBookings: 'list'
          };
          const name = icons[route.name] + (focused ? '' : '-outline');
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.adminPrimary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border, height: 60, paddingBottom: 8 },
        headerStyle: { backgroundColor: COLORS.dark, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
      })}
    >
      <Tab.Screen name="AdminDash" component={AdminDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="AdminMovies" component={AdminMoviesScreen} options={{ title: 'Movies' }} />
      <Tab.Screen name="AdminCompanies" component={AdminCompaniesScreen} options={{ title: 'Companies' }} />
      <Tab.Screen name="AdminHalls" component={AdminHallsScreen} options={{ title: 'Halls' }} />
      <Tab.Screen name="AdminScreenings" component={AdminScreeningsScreen} options={{ title: 'Screenings' }} />
      <Tab.Screen name="AdminBookings" component={AdminBookingsScreen} options={{ title: 'Bookings' }} />
    </Tab.Navigator>
  );
}

// ─── Main App Navigator ───────────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Block navigation until AsyncStorage has been read; prevents a flash of the auth screen.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.text, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) return <AuthStack />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Route to different tab sets based on the user's role. */}
      {user.role === 'admin' ? (
        <Stack.Screen name="AdminMain" component={AdminTabs} />
      ) : (
        <Stack.Screen name="UserMain" component={UserTabs} />
      )}
      {/* Shared stack screens */}
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen}
        options={{ headerShown: true, title: 'Movie Details', headerStyle: { backgroundColor: COLORS.dark }, headerTintColor: COLORS.text }} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen}
        options={{ headerShown: true, title: 'Cinema', headerStyle: { backgroundColor: COLORS.dark }, headerTintColor: COLORS.text }} />
      <Stack.Screen name="HallDetail" component={HallDetailScreen}
        options={{ headerShown: true, title: 'Hall Screenings', headerStyle: { backgroundColor: COLORS.dark }, headerTintColor: COLORS.text }} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen}
        options={{ headerShown: true, title: 'Select Seats', headerStyle: { backgroundColor: COLORS.dark }, headerTintColor: COLORS.text }} />
      <Stack.Screen name="Payment" component={PaymentScreen}
        options={{ headerShown: true, title: 'Payment', headerStyle: { backgroundColor: COLORS.dark }, headerTintColor: COLORS.text }} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen}
        options={{ headerShown: true, title: 'Booking Confirmed', headerStyle: { backgroundColor: COLORS.dark }, headerTintColor: COLORS.text }} />
      <Stack.Screen name="WriteFeedback" component={WriteFeedbackScreen}
        options={{ headerShown: true, title: 'Write a Review', headerStyle: { backgroundColor: COLORS.dark }, headerTintColor: COLORS.text }} />
    </Stack.Navigator>
  );
}
