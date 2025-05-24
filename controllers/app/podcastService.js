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

async function refreshCache() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        await client.access({
            host: FTP_HOST,
            user: FTP_USER,
            password: FTP_PASS,
            secure: false
        });

        cache.clear();
        console.log("[INFO] Refreshing podcast cache...");
        await scanDirectory(client, BASE_PATH, "");
    } catch (err) {
        console.error("[FTP ERROR]", err);
    } finally {
        client.close();
    }
}

async function scanDirectory(client, currentPath, category) {
    const list = await client.list(currentPath);
    for (const file of list) {
        const fullPath = path.posix.join(currentPath, file.name);
        if (file.isDirectory) {
            const newCategory = category ? `${category}/${file.name}` : file.name;
            await scanDirectory(client, fullPath, newCategory);
        } else if (file.name.endsWith(".mp3")) {
            const parts = category.split("/").filter(Boolean);
            const season = parts.length === 3 ? parts[0] : "No Season";
            const genre = parts.length >= 2 ? parts[parts.length - 2] : "Unknown";
            const subgenre = parts.length >= 1 ? parts[parts.length - 1] : "General";

            let fileUrl = `${BASE_URL}${fullPath}`.replace(/ /g, "%20");

            const podcast = new PodcastFile(
                fileUrl,
                season,
                genre,
                subgenre,
                new Date(file.rawModifiedAt || file.modifiedAt || Date.now())
            );

            if (!cache.has(genre)) {
                cache.set(genre, []);
            }
            cache.get(genre).push(podcast);
        }
    }
}

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
