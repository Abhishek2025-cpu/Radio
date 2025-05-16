const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./config/db.mongo');
connectDB();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const siteBannerRoutes = require('./routes/site/banner.routes');
const appBannerRoutes = require('./routes/app/banner.routes');

app.use('/api/site/banners', siteBannerRoutes);
app.use('/api/app/banners', appBannerRoutes);



module.exports = app;