import axios from 'axios';

// For Android emulator use: http://10.0.2.2:5000/api
// For physical device use your machine's local IP, e.g.: http://192.168.1.X:5000/api
// For Expo Go on device replace with your actual IP address
const API_BASE_URL = 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export default api;