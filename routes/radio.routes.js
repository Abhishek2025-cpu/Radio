const express = require('express');
const axios = require('axios');
const router = express.Router();

const STATION_URLS = [
  "https://api.infomaniak.com/1/radios/players/5b35ac49-f86c-468a-bb31-3da25d03b35f/config",
  "https://api.infomaniak.com/1/radios/players/1c30a821-deb0-4025-8faa-0fefd0557e28/config",
  "https://api.infomaniak.com/1/radios/players/be7703c7-30d9-4fdd-8ecd-e307585d6eef/config",
  "https://api.infomaniak.com/1/radios/players/d43b10dc-5d8f-471e-a647-bc70c4d65eec/config",
  "https://api.infomaniak.com/1/radios/players/7d1cba85-1b19-4113-994a-3e43429eea1b/config",
  "https://api.infomaniak.com/1/radios/players/e0ad54d5-6e7b-4f26-ad68-c94d942830e9/config"
];

const cache = new Map();
const trackedUrls = new Set(STATION_URLS);

async function updateCache() {
  for (const apiUrl of trackedUrls) {
    try {
      const response = await axios.get(apiUrl);
      const body = response.data;
      if (!body || !body.data) continue;
      const data = body.data;
      const resultMap = {
        artist: data.artist || "Unknown",
        channel_name: data.display_name || "Unknown",
        channel_thumbnail: data.thumbnail || "",
        song_name: data.title || "Unknown",
        song_cover: data.cover || "",
        color: data.button_color || "",
        play_url: (data.stations && data.stations[0] && data.stations[0].streams && data.stations[0].streams[0] && data.stations[0].streams[0].url) || ""
      };
      cache.set(apiUrl, resultMap);
    } catch (e) {
      console.error(`Error updating cache for ${apiUrl}: ${e.message}`);
    }
  }
}
setInterval(updateCache, 30 * 1000);
updateCache();

router.get('/radio', (req, res) => {
  const responseList = STATION_URLS.map(url => cache.get(url) || {});
  res.json(responseList);
});

module.exports = router;