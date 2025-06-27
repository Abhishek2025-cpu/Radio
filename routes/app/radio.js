const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ family: 4 });

const stations = [
  { name: 'U80', url: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover' },
  { name: 'U90', url: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover' },
  { name: 'UDANCE', url: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover' },
  { name: 'UPOP', url: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover' },
  { name: 'URADIO', url: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover' },
  { name: 'URBAN', url: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover' },
];

router.get('/stations', async (req, res) => {
  try {
    const results = await Promise.all(
      stations.map(async (station) => {
        try {
          const { data } = await axios.get(station.url, { httpsAgent: agent });
          const metadata = Array.isArray(data)
            ? data.filter((item, index) => index % 2 === 0 && item.title?.trim() !== '-')
            : [];
          return { name: station.name, metadata };
        } catch (err) {
          console.error(`Failed to fetch ${station.name}: ${err.message}`);
          return { name: station.name, metadata: [] };
        }
      })
    );
    res.json({ stations: results });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected server error', message: err.message });
  }
});

module.exports = router;
