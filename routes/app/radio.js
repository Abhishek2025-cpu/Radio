const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ family: 4 });

const stations = [
  {
    name: 'U80',
    url: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover',
    streamUrl: 'https://u80.ice.infomaniak.ch/u80-128.aac',
  },
  {
    name: 'U90',
    url: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover',
    streamUrl: 'https://u90.ice.infomaniak.ch/u90-128.aac',
  },
  {
    name: 'UDANCE',
    url: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover',
    streamUrl: 'https://udance.ice.infomaniak.ch/udance-128.aac',
  },
  {
    name: 'UPOP',
    url: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover',
    streamUrl: 'https://upop.ice.infomaniak.ch/upop-128.aac',
  },
  {
    name: 'URADIO',
    url: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover',
    streamUrl: 'https://uradio-aac.ice.infomaniak.ch/uradio.aac',
  },
  {
    name: 'URBAN',
    url: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover',
    streamUrl: 'https://urban.ice.infomaniak.ch/urban-128.aac',
  },
];

router.get('/stations', async (req, res) => {
  try {
    const results = await Promise.all(
      stations.map(async ({ name, url, streamUrl }) => {
        try {
          const response = await axios.get(url, { httpsAgent: agent });
          const data = response.data;

          let metadata = [];

          if (Array.isArray(data)) {
            metadata = data.filter(item => item && item.title && item.title !== '-');
          } else if (typeof data === 'object' && data !== null) {
            metadata = [data];
          }

          return { name, streamUrl, metadata };
        } catch (err) {
          console.error(`Fetch error for ${name}:`, err.message);
          return { name, streamUrl, metadata: [] };
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
