const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./config/db.mongo');
connectDB();
const { getFiles, getAllFiles } = require("./controllers/app/podcastService");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const siteBannerRoutes = require('./routes/site/banner.routes');
const appBannerRoutes = require('./routes/app/banner.routes');

// GET files by genre/category with pagination
app.get("/api/podcasts", (req, res) => {
    const { category = "Unknown", page = 0, size = 10 } = req.query;
    const files = getFiles(category, parseInt(page), parseInt(size));
    res.json({ category, page: +page, size: +size, count: files.length, files });
});

// GET all files
app.get("/api/podcasts/all", (req, res) => {
    const files = getAllFiles();
    res.json({ total: files.length, files });
});

app.use('/api/app', appBannerRoutes);
app.use('/api/site', siteBannerRoutes);
app.use('/api/form', require('./routes/app/FormSubmit'));




module.exports = app;