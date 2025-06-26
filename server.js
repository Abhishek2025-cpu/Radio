const app = require('./app');
const connectMongo = require('./config/db.mongo');
const express = require("express");
const axios = require("axios");


const PORT = process.env.PORT || 2026;


(async () => {
  await connectMongo();
  const stationVisibility = {
  U80: true,
  U90: true,
  UDANCE: true,
  UPOP: true,
  URADIO: true,
  URBAN: true,
};


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
    const visible = stationVisibility[station.name]; // Get visibility

    const [metadata, config] = await Promise.all([
      fetchData(station.metadataUrl),
      fetchData(station.configUrl),
    ]);

    if (
      !metadata?.success ||
      !Array.isArray(metadata.data) ||
      !config?.result === 'success' ||
      !config.data
    ) {
      results.push({ name: station.name, visible, error: 'Fetch failed or invalid structure' });
      continue;
    }

    const configData = config.data;
    const latestTrack = configData.timeline?.[1] || {};
    const latestMeta = metadata.data?.[1] || {};

    let title = latestTrack.artist || '';
    let artist = latestTrack.title || '';
    if (!title && !artist && latestMeta.title?.includes(' - ')) {
      const parts = latestMeta.title.split(' - ');
      artist = parts[0]?.trim();
      title = parts[1]?.trim();
    }

    results.push({
      name: station.name,
      title: title || 'Unknown Title',
      artist: artist || 'Unknown Artist',
      cover: latestMeta.cover || '',
      thumbnail: configData.stations?.[0]?.thumbnail || '',
      station_url: configData.stations?.[0]?.streams?.[0]?.url || '',
      button_color: configData.button_color || '',
      date: latestMeta.date || null,
      microtime: latestMeta.microtime || null,
      duration: latestMeta.duration || null,
      visible, // Add visibility here
    });
  }

  res.json({ result: 'success', data: results });
});


app.patch('/api/radios/visibility', (req, res) => {
  const { name, visible } = req.body;

  if (typeof name !== 'string' || typeof visible !== 'boolean') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (!stationVisibility.hasOwnProperty(name)) {
    return res.status(404).json({ error: 'Station not found' });
  }

  stationVisibility[name] = visible;
  res.json({ message: `Visibility updated for ${name}`, visible });
});





  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
