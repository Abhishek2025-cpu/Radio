const ftp = require("basic-ftp");
const mongoose = require('mongoose');
const Show = require('./models/mongo/show');
const Episode = require('./models/mongo/episode');

// Your FTP and DB credentials should be in a .env file
require('dotenv').config();

const FTP_CONFIG = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    secure: false
};

const BASE_URL = "https://podcast.youradio.ma";

async function syncPodcasts() {
    console.log("Starting FTP sync...");
    await mongoose.connect(process.env.MONGO_URI);

    const client = new ftp.Client();
    try {
        await client.access(FTP_CONFIG);
        console.log("FTP Connected.");

        // 1. Get all shows defined in our database
        const allShows = await Show.find();
        console.log(`Found ${allShows.length} shows to scan.`);

        for (const show of allShows) {
            console.log(`Scanning path for show "${show.name}": ${show.ftpPath}`);
            try {
                const files = await client.list(show.ftpPath);

                for (const file of files) {
                    if (file.type === ftp.FileType.File && file.name.endsWith(".mp3")) {
                        const fileUrl = `${BASE_URL}${show.ftpPath}${file.name}`.replace(/ /g, "%20");
                        
                        // 2. Use "upsert" to create or update the episode
                        // This prevents duplicates and updates timestamp if the file is re-uploaded
                        await Episode.findOneAndUpdate(
                            { url: fileUrl }, // Find episode by its unique URL
                            {
                                $set: {
                                    title: file.name.replace(".mp3", ""),
                                    show: show._id,
                                    publishedAt: file.rawModifiedAt,
                                },
                            },
                            { upsert: true } // IMPORTANT: Creates the document if it doesn't exist
                        );
                    }
                }
                 console.log(`Finished scanning for "${show.name}".`);
            } catch (pathError) {
                console.error(`Error listing files for path ${show.ftpPath}:`, pathError.message);
                // Continue to the next show even if one path fails
            }
        }

    } catch (err) {
        console.error("FTP Sync failed:", err);
    } finally {
        if (client.closed === false) {
            client.close();
        }
        await mongoose.disconnect();
        console.log("FTP sync finished. Connections closed.");
    }
}

// Run the sync
syncPodcasts();