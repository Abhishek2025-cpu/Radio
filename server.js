const app = require('./app');
const connectMongo = require('./config/db.mongo');
const express = require("express");
const axios = require("axios");


const PORT = process.env.PORT || 2026;


(async () => {
  await connectMongo();

  const metadataEndpoints = {
  U80: "https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover",
  U90: "https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover",
  UDANCE: "https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover",
  UPOP: "https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover",
  URADIO: "https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover",
  URBAN: "https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover",
};

const configEndpoints = {
  U80: "https://api.infomaniak.com/1/radios/players/5b35ac49-f86c-468a-bb31-3da25d03b35f/config",
  U90: "https://api.infomaniak.com/1/radios/players/1c30a821-deb0-4025-8faa-0fefd0557e28/config",
  UDANCE: "https://api.infomaniak.com/1/radios/players/be7703c7-30d9-4fdd-8ecd-e307585d6eef/config",
  UPOP: "https://api.infomaniak.com/1/radios/players/d43b10dc-5d8f-471e-a647-bc70c4d65eec/config",
  URADIO: "https://api.infomaniak.com/1/radios/players/7d1cba85-1b19-4113-994a-3e43429eea1b/config",
  URBAN: "https://api.infomaniak.com/1/radios/players/e0ad54d5-6e7b-4f26-ad68-c94d942830e9/config",
};

app.get("/api/radio-info/:station", async (req, res) => {
  const station = req.params.station.toUpperCase();

  if (!metadataEndpoints[station] || !configEndpoints[station]) {
    return res.status(404).json({ result: "error", message: "Invalid station name" });
  }

  try {
    const [metaRes, configRes] = await Promise.all([
      axios.get(metadataEndpoints[station]),
      axios.get(configEndpoints[station]),
    ]);

    const meta = metaRes.data;
    const config = configRes.data.data;

    const response = {
      result: "success",
      station,
      metadata: {
        date: meta.date,
        title: meta.title,
        microtime: meta.microtime,
        cover: meta.cover,
        duration: meta.duration,
      },
      config: {
        artist: config.artist,
        display_name: config.display_name,
        cover: config.cover,
        background_color: config.background_color,
        button_color: config.button_color,
        language: config.language,
        stream_urls: config.stations?.[0]?.streams?.map(s => s.url) || [],
        timeline: config.timeline || [],
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ result: "error", message: "Failed to fetch data" });
  }
});


  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
