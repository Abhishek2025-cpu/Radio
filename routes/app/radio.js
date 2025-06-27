// routes/radio.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const stations = [
  { name: "U80", id: 8220 },
  { name: "U90", id: 8219 },
  { name: "UDANCE", id: 8218 },
  { name: "UPOP", id: 8217 },
  { name: "URADIO", id: 8216 },
  { name: "URBAN", id: 8215 },
];

router.get("/all-metadata", async (req, res) => {
  try {
    const results = await Promise.all(
      stations.map(async (station) => {
        try {
          const { data } = await axios.get(
            `https://metadata.infomaniak.com/api/radio/${station.id}/metadata-all-cover`
          );

          // Log the raw data structure once
          console.log(`Raw response for ${station.name}:`, JSON.stringify(data, null, 2));

          // Confirm it's an array before filtering
          const filtered =
            Array.isArray(data) &&
            data.filter(
              (entry) => entry.title && entry.title.trim() !== "-"
            );

          return {
            name: station.name,
            metadata: filtered || [],
          };
        } catch (err) {
          console.error(`Error fetching metadata for ${station.name}:`, err.message);
          return {
            name: station.name,
            metadata: [],
          };
        }
      })
    );

    res.json({ stations: results });
  } catch (err) {
    console.error("Critical failure in all-metadata route:", err.message);
    res.status(500).json({ error: "Failed to fetch metadata." });
  }
});

module.exports = router;
