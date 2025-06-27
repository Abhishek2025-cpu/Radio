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

router.get('/radio-metadata', async (req, res) => {
  try {
    const stationResults = await Promise.all(stations.map(async (st) => {
      try {
        const { data } = await axios.get(st.metadataUrl);
        console.log(`\n📡 RAW DATA for ${st.name}:\n`, data);

        const arr = Array.isArray(data) ? data
          : Array.isArray(data.metadata) ? data.metadata
          : null;

        console.log(`➡️ Parsed array for ${st.name}:`, Array.isArray(arr) ? arr.length : arr);

        const filtered = Array.isArray(arr) ? arr.filter((e,i) => i%2===0 && e.title?.trim() && e.title !== '-') : [];
        console.log(`✅ Filtered count for ${st.name}:`, filtered.length);

        return { name: st.name, metadata: filtered };
      } catch (e) {
        console.error(`❌ Error fetching ${st.name}:`, e.message);
        return { name: st.name, metadata: [] };
      }
    }));

    res.json({ stations: stationResults });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = router;
