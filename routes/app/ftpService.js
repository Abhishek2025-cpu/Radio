// const FTP = require('basic-ftp');
// const path = require('path');
// require('dotenv').config();
// const { CronJob } = require('cron'); 



// const PODCAST_PATHS = [
//   "/podcasts/L AFTER U/MOHAMED RAMADAN/",
//   "/podcasts/RAMADAN/LE BEFTOUR/ACH TARY/",

//   "/podcasts/U MORNING/WACH KANET FERASSEK/"
// ];

// const ftpConfig = {
//   host: process.env.FTP_HOST,
//   user: process.env.FTP_USER,
//   password: process.env.FTP_PASS,
//   secure: false
// };

// const BASE_URL = process.env.BASE_URL;
// const cache = {}; // genre => [fileObj]

// async function refreshCache() {
//   const client = new FTP.Client();
//   try {
//     await client.access(ftpConfig);
//     for (const fullPath of PODCAST_PATHS) {
//       await scanPath(client, fullPath, fullPath);
//     }
//   } catch (err) {
//     console.error("FTP refresh error:", err);
//   } finally {
//     client.close();
//   }
// }

// async function scanPath(client, ftpPath, categoryRoot) {
//   let list;
//   try {
//     list = await client.list(ftpPath);
//   } catch {
//     return;
//   }

//   for (const item of list) {
//     const remote = path.posix.join(ftpPath, item.name);
//     const relative = ftpPath.slice(categoryRoot.lastIndexOf('/') + 1)
//       ? ftpPath.slice(categoryRoot.lastIndexOf('/') + 1)
//       : remote.slice(categoryRoot.length);

//     if (item.isDirectory) {
//       await scanPath(client, remote, categoryRoot);
//     } else if (item.name.endsWith(".mp3")) {
//       const parts = relative.split('/').filter(p => p);
//       const season = parts[0] || 'No Season';
//       const genre = parts[1] || 'Unknown';
//       const subgenre = parts[2] || 'General';
//       const fileUrl = `${BASE_URL}${remote}`.replace(/ /g, '%20');
//       const fileObj = {
//         url: fileUrl,
//         season,
//         genre,
//         subgenre,
//         timestamp: item.modifiedAt || new Date()
//       };
//       cache[genre] = cache[genre] || [];
//       cache[genre].push(fileObj);
//     }
//   }
// }

// function getAllFiles() {
//   const all = [];
//   Object.values(cache).forEach(arr => all.push(...arr));
//   return all;
// }

// function getFilesByGenre(genre, page=0, size=500) {
//   const arr = cache[genre] || [];
//   return arr
//     .sort((a, b) => b.timestamp - a.timestamp)
//     .slice(page * size, (page + 1) * size);
// }

// new CronJob('*/10 * * * * *', refreshCache).start(); 
// refreshCache();


// module.exports = { getAllFiles, getFilesByGenre, refreshCache, PODCAST_PATHS, ftpConfig, BASE_URL };
