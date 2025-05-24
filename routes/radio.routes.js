const express = require('express');
const axios = require('axios');
const router = express.Router();

const STATION_URLS = [
  {
    name: "U80",
    config: "https://api.infomaniak.com/1/radios/players/5b35ac49-f86c-468a-bb31-3da25d03b35f/config",
    meta: "https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover"
  },
  {
    name: "U90",
    config: "https://api.infomaniak.com/1/radios/players/1c30a821-deb0-4025-8faa-0fefd0557e28/config",
    meta: "https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover"
  },
  {
    name: "UDANCE",
    config: "https://api.infomaniak.com/1/radios/players/be7703c7-30d9-4fdd-8ecd-e307585d6eef/config",
    meta: "https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover"
  },
  {
    name: "UPOP",
    config: "https://api.infomaniak.com/1/radios/players/d43b10dc-5d8f-471e-a647-bc70c4d65eec/config",
    meta: "https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover"
  },
  {
    name: "URADIO",
    config: "https://api.infomaniak.com/1/radios/players/7d1cba85-1b19-4113-994a-3e43429eea1b/config",
    meta: "https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover"
  },
  {
    name: "URBAN",
    config: "https://api.infomaniak.com/1/radios/players/e0ad54d5-6e7b-4f26-ad68-c94d942830e9/config",
    meta: "https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover"
  }
];

const cache = new Map();
const trackedUrls = new Set(STATION_URLS.map(s => s.config));

// Update cache with both config and metadata
async function updateCache() {
  for (const station of STATION_URLS) {
    try {
      const [configRes, metaRes] = await Promise.all([
        axios.get(station.config),
        axios.get(station.meta)
      ]);
      const configData = configRes.data && configRes.data.data ? configRes.data.data : {};
      const metaData = metaRes.data || {};

      const resultMap = {
        name: station.name,
        artist: configData.artist || metaData.artist || "Unknown",
        channel_name: configData.display_name || metaData.radio_name || "Unknown",
        channel_thumbnail: configData.thumbnail || metaData.cover || "",
        song_name: configData.title || metaData.title || "Unknown",
        song_cover: configData.cover || metaData.cover || "",
        color: configData.button_color || "",
        play_url: (configData.stations && configData.stations[0] && configData.stations[0].streams && configData.stations[0].streams[0] && configData.stations[0].streams[0].url) || "",
        meta: metaData // include all metadata for more info
      };
      cache.set(station.config, resultMap);
    } catch (e) {
      console.error(`Error updating cache for ${station.name}: ${e.message}`);
    }
  }
}
setInterval(updateCache, 30 * 1000);
updateCache();

router.get('/radio', (req, res) => {
  const responseList = STATION_URLS.map(station => cache.get(station.config) || { name: station.name });
  res.json(responseList);
});

module.exports = router;