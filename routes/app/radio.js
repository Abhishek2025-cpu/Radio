const express = require('express');
const axios = require('axios');

const router = express.Router();

const stations = [
  {
    name: 'U80',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover'
  },
  {
    name: 'U90',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover'
  },
  {
    name: 'UDANCE',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover'
  },
  {
    name: 'UPOP',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover'
  },
  {
    name: 'URADIO',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover'
  },
  {
    name: 'URBAN',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover'
  }
];

router.get('/station-metadata', async (req, res) => {
  try {
    const results = await Promise.all(
      stations.map(async (station) => {
        try {
          const response = await axios.get(station.metadataUrl);

          const metadata = Array.isArray(response.data)
            ? response.data.filter((item, index) => index % 2 === 0 && item.title && item.title.trim() !== '-')
            : [];

          return {
            name: station.name,
            metadata
          };
        } catch (err) {
          console.error(`Error fetching metadata for ${station.name}:`, err.message);
          return {
            name: station.name,
            metadata: []
          };
        }
      })
    );

    res.json({ stations: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch station metadata', details: err.message });
  }
});

module.exports = router;
