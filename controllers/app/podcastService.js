const ftp = require("basic-ftp");
const dotenv = require("dotenv");
const path = require("path");
const Podcast = require("../../models/mongo/Podcast");

dotenv.config();

// Use the secure domain with valid SSL cert
const BASE_URL = process.env.BASE_URL || "https://v2.uradio.ma";
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASS = process.env.FTP_PASS;
const BASE_PATH = "/podcasts";

const cache = new Map();

// Optional dynamic URL sanitizer (in case older entries use wrong domain)
const fixUrl = (url) => {
  return url.replace("https://podcast.youradio.ma", "https://v2.uradio.ma");
};

const refreshCache = async () => {
  const client = new ftp.Client();
  try {
    console.log("[INFO] Connecting to FTP:", FTP_HOST);
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASS,
      secure: false, // true if your FTP supports FTPS
    });
    console.log("[INFO] FTP access successful");

    client.trackProgress(info => {
      console.log("[PROGRESS] Transferred", info.name);
    });

    cache.clear();
    await scanDirectory(client, BASE_PATH, "");
    console.log("[INFO] Cache rebuilt. Total genres:", cache.size);
  } catch (err) {
    console.error("[ERROR] FTP Error:", err.message);
  } finally {
    client.close();
  }
};

const scanDirectory = async (client, dirPath, category) => {
  console.log(`[SCAN] Scanning directory: ${dirPath}`);
  const list = await client.list(dirPath);
  if (!list || list.length === 0) return;

  for (const file of list) {
    if (file.isDirectory) {
      const newCategory = category ? `${category}/${file.name}` : file.name;
      await scanDirectory(client, `${dirPath}/${file.name}`, newCategory);
    } else if (file.name.endsWith(".mp3")) {
      const parts = category.split("/");
      const season = parts.length === 3 ? parts[0] : "No Season";
      const genre = parts.length >= 2 ? parts[parts.length - 2] : "Unknown";
      const subgenre = parts.length >= 1 ? parts[parts.length - 1] : "General";

      const relativePath = `${dirPath}/${file.name}`;
      const encodedUrl = `${BASE_URL}${relativePath}`.replace(/ /g, "%20");
      const secureUrl = fixUrl(encodedUrl); // Just in case the old domain slips in

      const timestamp = file.rawModifiedAt ? new Date(file.rawModifiedAt) : new Date();

      // Update in-memory cache
      if (!cache.has(genre)) cache.set(genre, []);
      cache.get(genre).push({
        url: secureUrl,
        season,
        genre,
        subgenre,
        timestamp,
      });

      // Sync to MongoDB
      await Podcast.updateOne(
        { url: secureUrl },
        {
          $set: {
            season,
            genre,
            subgenre,
            timestamp,
          },
        },
        { upsert: true }
      );

      console.log(`[SYNCED] ${file.name} => ${genre}/${subgenre}`);
    }
  }
};

function getFiles(category, page = 0, size = 10) {
  const files = cache.get(category) || [];
  return files
    .sort((a, b) => b.timestamp - a.timestamp) // latest first
    .slice(page * size, page * size + size);
}

function getAllFiles() {
  return Array.from(cache.values()).flat();
}

// Initial run on boot
refreshCache();

// Re-sync every 16 minutes
setInterval(refreshCache, 1000 * 60 * 16);

module.exports = {
  getFiles,
  getAllFiles,
  refreshCache,
};
