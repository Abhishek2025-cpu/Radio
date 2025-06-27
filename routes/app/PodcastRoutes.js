const express = require('express');
const ftp = require('basic-ftp');
const cron = require('node-cron');
const router = express.Router();

const BASE_URL = "https://podcast.youradio.ma";
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASS = process.env.FTP_PASS;

const PODCAST_PATHS = [
      "/podcasts/L AFTER U/MOHAMED RAMADAN/",
    "/podcasts/RAMADAN/LE BEFTOUR/ACH TARY/",
    "/podcasts/RAMADAN/LE BEFTOUR/DOP AMINE/",
    "/podcasts/RAMADAN/LE BEFTOUR/L'ACTU GAMING/",
    "/podcasts/RAMADAN/LE BEFTOUR/L'INTEGRALE/",
    "/podcasts/RAMADAN/LE BEFTOUR/LES 3 INFOS/",
    "/podcasts/RAMADAN/LE BEFTOUR/STORY CHEFTEHA/",
    "/podcasts/RAMADAN/LE BEFTOUR/WACH KANET FERASSEK/",
    "/podcasts/U MORNING/ACH TARY/",
    "/podcasts/U MORNING/COMEDY CHKOUN/",
    "/podcasts/U MORNING/DOP AMINE/",
    "/podcasts/U MORNING/INA ARTISTE DAREHA/",
    "/podcasts/U MORNING/INSOLITE/",
    "/podcasts/U MORNING/L'ACTU GAMING/",
    "/podcasts/U MORNING/L'INTEGRALE/",
    "/podcasts/U MORNING/LE9A SOUA2L/",
    "/podcasts/U MORNING/LES 3 INFOS/",
    "/podcasts/U MORNING/MAGHATEYE9CH/",
    "/podcasts/U MORNING/MOUJAZ RIADI/",
    "/podcasts/U MORNING/SONDAGE/",
    "/podcasts/U MORNING/TOP & FLOP/",
    "/podcasts/U MORNING/TRADEASY/",
    "/podcasts/U MORNING/TROLL DU JOUR/",
    "/podcasts/U MORNING/VRAI OU FAUX/",
    "/podcasts/U MORNING/WACH KANET FERASSEK/"

];

const cache = new Map();

async function scanFTPDirectory(client, path, categoryPath) {
    const files = await client.list(path);
    for (const file of files) {
        if (file.isDirectory) {
            await scanFTPDirectory(client, `${path}${file.name}/`, categoryPath ? `${categoryPath}/${file.name}` : file.name);
        } else if (file.name.endsWith('.mp3')) {
            const parts = categoryPath.split('/');
            const season = parts.length === 3 ? parts[0] : "No Season";
            const genre = parts.length >= 2 ? parts[parts.length - 2] : "Unknown";
            const subgenre = parts.length >= 1 ? parts[parts.length - 1] : "General";

            const fileUrl = `${BASE_URL}${path}${file.name}`.replace(/ /g, "%20");

            const podcast = {
                url: fileUrl,
                season,
                genre,
                subgenre,
                timestamp: new Date(file.rawModifiedAt || file.modifiedAt || Date.now())
            };

            if (!cache.has(genre)) cache.set(genre, []);
            cache.get(genre).push(podcast);
        }
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
        for (const path of PODCAST_PATHS) {
            await scanFTPDirectory(client, path, path.replace('/podcasts/', '').replace(/\/$/, ''));
        }

        console.log("Podcast cache refreshed");
    } catch (err) {
        console.error("Error during FTP scan:", err);
    } finally {
        client.close();
    }
}

// Refresh every 17 minutes
cron.schedule('*/17 * * * *', refreshCache);
refreshCache(); // run once on startup

// Routes
router.get('/podcast/latest', async (req, res) => {
    const client = new ftp.Client();
    const latestList = [];

    try {
        await client.access({
            host: FTP_HOST,
            user: FTP_USER,
            password: FTP_PASS,
            secure: false
        });

        for (const path of PODCAST_PATHS) {
            const files = await client.list(path);
            const mp3Files = files.filter(f => f.name.endsWith('.mp3'));
            if (mp3Files.length > 0) {
                const latest = mp3Files.sort((a, b) => b.modifiedAt - a.modifiedAt)[0];
                latestList.push({
                    name: latest.name,
                    url: `${BASE_URL}${path}${latest.name}`.replace(/ /g, "%20"),
                    modified: latest.modifiedAt
                });
            }
        }

        res.json(latestList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch latest podcasts" });
    } finally {
        client.close();
    }
});

router.get('/podcast/:category', (req, res) => {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 500;

    const data = cache.get(category) || [];
    const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const paginated = sorted.slice(page * size, (page + 1) * size);

    res.json(paginated);
});

router.get('/podcast/all', (req, res) => {
    const all = Array.from(cache.values()).flat();
    res.json(all);
});

// ✅ Proper CommonJS export
module.exports = router;
