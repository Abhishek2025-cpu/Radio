const app = require('./app');
const connectMongo = require('./config/db.mongo');
const express = require("express");
const axios = require("axios");
const podcastRoutes = require('./routes/app/PodcastRoutes');

const PORT = process.env.PORT || 2026;


(async () => {
  await connectMongo();
const stations = [
  {
    name: 'U80',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover',
    configUrl: 'https://api.infomaniak.com/1/radios/players/5b35ac49-f86c-468a-bb31-3da25d03b35f/config',
  },
  {
    name: 'U90',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover',
    configUrl: 'https://api.infomaniak.com/1/radios/players/1c30a821-deb0-4025-8faa-0fefd0557e28/config',
  },
  {
    name: 'UDANCE',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover',
    configUrl: 'https://api.infomaniak.com/1/radios/players/be7703c7-30d9-4fdd-8ecd-e307585d6eef/config',
  },
  {
    name: 'UPOP',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover',
    configUrl: 'https://api.infomaniak.com/1/radios/players/d43b10dc-5d8f-471e-a647-bc70c4d65eec/config',
  },
  {
    name: 'URADIO',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover',
    configUrl: 'https://api.infomaniak.com/1/radios/players/7d1cba85-1b19-4113-994a-3e43429eea1b/config',
  },
  {
    name: 'URBAN',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover',
    configUrl: 'https://api.infomaniak.com/1/radios/players/e0ad54d5-6e7b-4f26-ad68-c94d942830e9/config',
  },
];

// Helper function to fetch data from a URL
const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error.message);
    return null;
  }
};

// API endpoint to get consolidated radio metadata
app.get('/api/radios', async (req, res) => {
  const results = [];

  for (const station of stations) {
    const [metadata, config] = await Promise.all([
      fetchData(station.metadataUrl),
      fetchData(station.configUrl),
    ]);

    if (!metadata || !config || config.result !== 'success') {
      results.push({ name: station.name, error: 'Fetch failed' });
      continue;
    }

    console.log(`---- [${station.name}] metadata:`, metadata);

    let track = {};
    if (Array.isArray(metadata.timeline) && metadata.timeline.length > 0) {
      const tl = metadata.timeline[0];
      track = tl.current?.track || tl;
    }

    const title = track.title || metadata.title || 'Unknown Title';
    const artist = track.artist || metadata.artist || 'Unknown Artist';
    const cover = track.cover || metadata.cover || config.data.cover || '';
    const thumbnail = config.data.thumbnail || '';
    const station_url = config.data.stations?.[0]?.streams?.[0]?.url || '';
    const button_color = config.data.button_color || '';
    const date = track.date || metadata.date || null;
    const duration = track.duration || metadata.duration || null;

    results.push({
      name: station.name,
      title,
      artist,
      cover,
      thumbnail,
      station_url,
      button_color,
      date,
      microtime: track.microtime || metadata.microtime || null,
      duration,
    });
  }

  res.json({ result: 'success', data: results });
});


app.use('/api/podcasts', podcastRoutes);



  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
