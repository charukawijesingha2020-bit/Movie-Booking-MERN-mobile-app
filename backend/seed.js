/**
 * Seed Script — creates admin user + sample data
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./model/User');
const CinemaCompany = require('./model/CinemaCompany');
const Hall = require('./model/Hall');
const Movie = require('./model/Movie');
const Screening = require('./model/Screening');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await CinemaCompany.deleteMany();
    await Hall.deleteMany();
    await Movie.deleteMany();
    await Screening.deleteMany();
    console.log('🗑️  Cleared existing data');

    // --- Admin User ---
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@cinema.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('👤 Admin created:', admin.email);

    // --- Sample User ---
    await User.create({
      name: 'John Doe',
      email: 'user@cinema.com',
      password: 'User@123',
      role: 'user',
    });
    console.log('👤 Sample user created: user@cinema.com');

    // --- Cinema Companies ---
    const milano = await CinemaCompany.create({
      name: 'Milano Movie Center',
      address: '123 Main Street, Colombo',
      phone: '+94 11 234 5678',
      description: 'Premier cinema experience in the heart of Colombo',
      logo: 'https://via.placeholder.com/100x100?text=Milano',
    });

    const starlight = await CinemaCompany.create({
      name: 'Starlight Cinemas',
      address: '456 Galle Road, Kandy',
      phone: '+94 81 234 5678',
      description: 'Your family entertainment destination in Kandy',
      logo: 'https://via.placeholder.com/100x100?text=Starlight',
    });
    console.log('🏢 Companies created: Milano, Starlight');

    // --- Halls ---
    const hall1 = await Hall.create({ name: 'Hall 1 – Gold', company: milano._id, rows: 8, seatsPerRow: 10, description: 'Premium Gold class seating' });
    const hall2 = await Hall.create({ name: 'Hall 2 – Silver', company: milano._id, rows: 10, seatsPerRow: 12, description: 'Comfortable Silver class seating' });
    const hall3 = await Hall.create({ name: 'Main Hall', company: starlight._id, rows: 7, seatsPerRow: 9, description: 'Starlight main hall' });
    const hall4 = await Hall.create({ name: 'VIP Hall', company: starlight._id, rows: 5, seatsPerRow: 6, description: 'Exclusive VIP experience' });
    console.log('🏟️  Halls created');

    // --- Movies ---
    const movie1 = await Movie.create({
      title: 'Interstellar',
      genre: ['Sci-Fi', 'Drama'],
      duration: 169,
      rating: 'PG-13',
      language: 'English',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      poster: 'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      releaseDate: new Date('2014-11-07'),
    });

    const movie2 = await Movie.create({
      title: 'The Dark Knight',
      genre: ['Action', 'Crime', 'Drama'],
      duration: 152,
      rating: 'PG-13',
      language: 'English',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
      poster: 'https://upload.wikimedia.org/wikipedia/en/1/1c/The_Dark_Knight_%282008_film%29.jpg',
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
      releaseDate: new Date('2008-07-18'),
    });

    const movie3 = await Movie.create({
      title: 'Avatar: The Way of Water',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      duration: 192,
      rating: 'PG-13',
      language: 'English',
      description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
      poster: 'https://upload.wikimedia.org/wikipedia/en/5/55/Avatar_The_Way_of_Water_poster.jpg',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
      releaseDate: new Date('2022-12-16'),
    });
    console.log('🎬 Movies created');

    // --- Screenings ---
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await Screening.create({ movie: movie1._id, hall: hall1._id, date: today, showtime: '10:00', ticketPrice: 500 });
    await Screening.create({ movie: movie2._id, hall: hall1._id, date: today, showtime: '14:00', ticketPrice: 500 });
    await Screening.create({ movie: movie3._id, hall: hall2._id, date: today, showtime: '11:00', ticketPrice: 450 });
    await Screening.create({ movie: movie1._id, hall: hall3._id, date: tomorrow, showtime: '15:00', ticketPrice: 400 });
    await Screening.create({ movie: movie2._id, hall: hall4._id, date: today, showtime: '18:00', ticketPrice: 700 });
    await Screening.create({ movie: movie3._id, hall: hall4._id, date: tomorrow, showtime: '20:00', ticketPrice: 700 });
    console.log('🎟️  Screenings created');

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login: admin@cinema.com / Admin@123');
    console.log('User Login:  user@cinema.com  / User@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
