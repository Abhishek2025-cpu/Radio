// server.js

// Core Modules
const express = require('express');
const cors = require('cors');
const http = require("http");
require('dotenv').config();

// Initialize App
const app = express();
const server = http.createServer(app);

// --- MIDDLEWARE ---
// Middleware should be defined at the TOP, before routes
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.send('CORS enabled for all origins (*)');
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- DATABASE & SOCKETS ---
const connectDB = require('./config/db.mongo');
const socket = require("./sockets/sockets");
const io = socket.init(server);
connectDB();

// --- CRON JOBS & SCHEDULERS ---
require('./cron/voteResetJob');
require('./services/scheduler');

// --- ROUTES ---
// Import all your route files here
const radioStationsRoutes = require("./routes/app/radioStationRoutes");
const artistRoutes = require('./routes/app/artistRoutes');
const podcastRoutes = require('./routes/app/podcast.routes'); // The one and only podcast route file
const siteBannerRoutes = require('./routes/site/banner.routes');
const appBannerRoutes = require('./routes/app/banner.routes');
const newsRoutes = require('./routes/app/news.routes');
const radioRoutes = require('./routes/app/radio');
const formSubmitRoutes = require('./routes/app/FormSubmit');
const votingRoutes = require('./routes/site/votingRoutes');

// Use the routes with their base paths
app.use('/api/podcasts', podcastRoutes); // Using the clean file
app.use("/api/radio-stations", radioStationsRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/app/news', newsRoutes);
app.use('/api/radio', radioRoutes);
app.use('/api/app/banners', appBannerRoutes);
app.use('/api/site/banners', siteBannerRoutes);
app.use('/api/forms', formSubmitRoutes);
app.use('/api/websites/voting', votingRoutes);


// --- SOCKET.IO CONNECTION HANDLING ---
io.on("connection", (socket) => {
  console.log("🟢 Client connected via socket");
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

module.exports = app;