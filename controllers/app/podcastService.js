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

// Normalize and fix old domain
const fixUrl = (url) => {
  return url.replace("https://podcast.youradio.ma", "https://v2.uradio.ma").replace(/ /g, "%20");
};

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
  console.log(`[DEBUG] Scanning directory: ${dirPath}`);
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
      const finalUrl = fixUrl(`${BASE_URL}${relativePath}`);

      const timestamp = file.rawModifiedAt ? new Date(file.rawModifiedAt) : new Date();

      // Store in memory cache
      if (!cache.has(genre)) cache.set(genre, []);
      cache.get(genre).push({ url: finalUrl, season, genre, subgenre, timestamp });

      // Sync to MongoDB safely
      try {
        await Podcast.findOneAndUpdate(
          { url: finalUrl },
          {
            $set: { season, genre, subgenre, timestamp },
            $setOnInsert: { url: finalUrl },
          },
          { upsert: true, new: true }
        );
        console.log(`[SYNCED] ${file.name} => ${finalUrl}`);
      } catch (err) {
        if (err.code === 11000) {
          console.warn(`[DUPLICATE] Skipped existing podcast: ${finalUrl}`);
        } else {
          console.error("[DB ERROR]", err);
        }
      }
    }
  }
};

// One-time URL normalization script on boot
(async () => {
  try {
    const result = await Podcast.updateMany(
      { url: { $regex: /^https:\/\/podcast\.youradio\.ma/ } },
      [
        {
          $set: {
            url: {
              $replaceOne: {
                input: "$url",
                find: "https://podcast.youradio.ma",
                replacement: "https://v2.uradio.ma"
              }
            }
          }
        }
      ]
    );
    console.log("Fixed old podcast URLs:", result.modifiedCount);
  } catch (err) {
    console.error("[MIGRATION ERROR]", err);
  }
})();

function getFiles(category, page = 0, size = 10) {
  const files = cache.get(category) || [];
  return files
    .sort((a, b) => b.timestamp - a.timestamp)
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
