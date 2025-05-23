const ftp = require("basic-ftp");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const BASE_URL = process.env.BASE_URL || "https://podcast.youradio.ma";
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASS = process.env.FTP_PASS;
const BASE_PATH = "/podcasts";

const cache = new Map();

class PodcastFile {
    constructor(url, season, genre, subgenre, timestamp) {
        this.url = url;
        this.season = season;
        this.genre = genre;
        this.subgenre = subgenre;
        this.timestamp = timestamp;
    }
}

const refreshCache = async () => {
  const client = new ftp.Client();
  try {
    console.log("[INFO] Connecting to FTP:", FTP_HOST);
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      secure: false,
    });
    console.log("[INFO] FTP access successful");

    client.trackProgress(info => {
      console.log("Transferred", info.name);
    });

    console.log("[INFO] Connected. Scanning...");
    cache.clear();
    await scanDirectory(client, BASE_PATH, "");
    console.log("[INFO] Cache rebuilt. Total genres:", cache.size);
  } catch (err) {
    console.error("FTP Error:", err);
  } finally {
    client.close();
  }
};


const scanDirectory = async (client, path, category) => {
    console.log(`[DEBUG] Scanning directory: ${path}`);
  const list = await client.list(path);
  if (!list || list.length === 0) {
    console.log(`[DEBUG] No files found in: ${path}`);
    return;
  }

  for (const file of list) {
    if (file.isDirectory) {
      const newCategory = category ? `${category}/${file.name}` : file.name;
      await scanDirectory(client, `${path}/${file.name}`, newCategory);
    } else if (file.name.endsWith(".mp3")) {
      const parts = category.split("/");
      const season = parts.length === 3 ? parts[0] : "No Season";
      const genre = parts.length >= 2 ? parts[parts.length - 2] : "Unknown";
      const subgenre = parts.length >= 1 ? parts[parts.length - 1] : "General";

      let fileUrl = `${BASE_URL}${path}/${file.name}`.replace(/ /g, "%20");

      const timestamp = file.rawModifiedAt
        ? new Date(file.rawModifiedAt)
        : new Date(); // fallback if no timestamp

      if (!cache.has(genre)) cache.set(genre, []);
      cache.get(genre).push({ url: fileUrl, season, genre, subgenre, timestamp });

      console.log(`[FOUND] MP3: ${file.name} | Genre: ${genre} | Category: ${category}`);
    }
  }
};


function getFiles(category, page = 0, size = 10) {
    const files = cache.get(category) || [];
    return files
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(page * size, page * size + size);
}

function getAllFiles() {
    return Array.from(cache.values()).flat();
}

// Initial cache population
refreshCache();

// Refresh every ~16 minutes (1,000,000 ms)
setInterval(refreshCache, 1000000);

module.exports = {
    getFiles,
    getAllFiles,
    refreshCache
};
