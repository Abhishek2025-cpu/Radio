const express = require('express');
const cors = require('cors');
const http = require("http");
const app = express();
require('dotenv').config();
require('./cron/voteResetJob');

const connectDB = require('./config/db.mongo');
const socket = require("./sockets/sockets");
const radioStationsRoutes = require("./routes/app/radioStationRoutes");
const artistRoutes = require('./routes/app/artistRoutes');
const server = http.createServer(app);
const io = socket.init(server);
connectDB();
const { getFiles, getAllFiles } = require("./controllers/app/podcastService");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const siteBannerRoutes = require('./routes/site/banner.routes');
const appBannerRoutes = require('./routes/app/banner.routes');
const newsRoutes = require('./routes/app/news.routes');
const podcast = require('./routes/app/PodcastRoutes');
const radioRoutes = require('./routes/app/radio'); 
app.use('/api', radioRoutes);


io.on("connection", (socket) => {
  console.log("🟢 Client connected via socket");

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});








app.use('/api/app', newsRoutes);
app.use("/api/radio-stations", radioStationsRoutes);
app.use('/api',podcast);

app.use('/api/app', appBannerRoutes);
app.use('/api/site', siteBannerRoutes);
app.use('/api/form', require('./routes/app/FormSubmit'));
app.use('/api/artists', artistRoutes);




module.exports = app;