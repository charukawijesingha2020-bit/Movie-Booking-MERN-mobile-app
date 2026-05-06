import axios from 'axios';

// For Android emulator use: http://10.0.2.2:5000/api
// For physical device use your machine's local IP, e.g.: http://192.168.1.X:5000/api
// For Expo Go on device replace with your actual IP address
// Physical device (Expo Go): use your PC's local IP shown in `ipconfig`
// Your Expo is running on 172.20.10.4 — use the same IP for the backend
const API_BASE_URL = 'http://172.20.10.4:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});


export default api;