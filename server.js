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

const fetchData = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
    return null;
  }
};

app.get('/api/radios', async (req, res) => {
  const results = [];

  for (const station of stations) {
    const [metadata, config] = await Promise.all([
      fetchData(station.metadataUrl),
      fetchData(station.configUrl),
    ]);

    if (!metadata?.timeline || !Array.isArray(metadata.timeline) ||
        !config || config.result !== 'success') {
      results.push({ name: station.name, error: 'Fetch failed or invalid structure' });
      continue;
    }

    const trackInfo = metadata.timeline[0]?.current?.track;

    if (!trackInfo) {
      console.warn(`⚠️ No track info for ${station.name}:`, metadata.timeline[0]);
    }

    results.push({
      name: station.name,
      title: trackInfo?.title || 'Unknown Title',
      artist: trackInfo?.subtitle || 'Unknown Artist',
      cover: trackInfo?.cover || config.data.cover || '',
      thumbnail: config.data.thumbnail || '',
      station_url: config.data.stations?.[0]?.streams?.[0]?.url || '',
      button_color: config.data.button_color || '',
      date: null,
      microtime: trackInfo?.microtime || null,
      duration: trackInfo?.duration || null,
    });
  }

  res.json({ result: 'success', data: results });
});


app.use('/api/podcasts', podcastRoutes);



  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
