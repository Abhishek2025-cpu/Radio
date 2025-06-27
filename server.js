const app = require('./app');
const connectMongo = require('./config/db.mongo');
const express = require("express");
const axios = require("axios");


const PORT = process.env.PORT || 2026;


(async () => {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
