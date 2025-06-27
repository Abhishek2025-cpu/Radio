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
  },
];

// API to get filtered metadata for all stations
router.get('/radio-metadata', async (req, res) => {
  try {
    const results = await Promise.all(
      stations.map(async (station) => {
        try {
          const { data } = await axios.get(station.metadataUrl);

          const metadataArray = Array.isArray(data)
            ? data
            : Array.isArray(data.metadata)
              ? data.metadata
              : [];

          const filteredMetadata = metadataArray.filter((entry, index) =>
            index % 2 === 0 &&
            entry.title &&
            entry.title.trim() !== '-' &&
            entry.title.trim() !== ''
          );

          return {
            name: station.name,
            metadata: filteredMetadata,
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
  } catch (error) {
    console.error('Failed to fetch station metadata:', error.message);
    res.status(500).json({
      error: 'Failed to fetch station metadata',
      details: error.message,
    });
  }
});

module.exports = router;

