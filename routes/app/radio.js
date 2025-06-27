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
      stations.map(async ({ name, url }) => {
        try {
          const response = await axios.get(url, { httpsAgent: agent });
          const data = response.data;

          let metadata = [];

          // Ensure data is an array
          if (Array.isArray(data)) {
            metadata = data.filter(item => item && item.title && item.title !== '-');
          } else if (typeof data === 'object' && data !== null) {
            // In case it's a single object, wrap it in an array
            metadata = [data];
          }

          return { name, metadata };
        } catch (err) {
          console.error(`Fetch error for ${name}: ${err.message}`);
          return { name, metadata: [] };
        }
      })
    );

    res.json({ stations: results });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
