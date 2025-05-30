const express = require('express');
const cors = require('cors');
const http = require("http");
const app = express();
require('dotenv').config();
const connectDB = require('./config/db.mongo');
const socket = require("./sockets/sockets");

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
const podcastService = require('./controllers/app/podcastService');

io.on("connection", (socket) => {
  console.log("🟢 Client connected via socket");

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});








app.get('/debug/podcasts', (req, res) => {
  res.json({ files: podcastService.getAllFiles() });
});
// GET files by genre/category with pagination
app.get("/api/podcasts", (req, res) => {
    const { category, page = 0, size = 10 } = req.query;
    let files;
    if (category) {
        files = getFiles(category, parseInt(page), parseInt(size));
    } else {
        files = getAllFiles().slice(page * size, (page + 1) * size);
    }
    res.json({ category: category || "all", page: +page, size: +size, count: files.length, files });
});

// GET all files
app.get("/api/podcasts/all", (req, res) => {
    const files = getAllFiles();
    res.json({ total: files.length, files });
});

const radioRoutes = require('./routes/radio.routes');
app.use('/api', radioRoutes);
app.use('/api/app', newsRoutes);

app.use('/api/app', appBannerRoutes);
app.use('/api/site', siteBannerRoutes);
app.use('/api/form', require('./routes/app/FormSubmit'));




module.exports = app;