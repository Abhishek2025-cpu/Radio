// const express = require('express');
// const router = express.Router();
// const FTP = require('basic-ftp');
// const { PODCAST_PATHS, ftpConfig, BASE_URL } = require('./ftpService');
// const { getAllFiles, getFilesByGenre } = require('./ftpService');

// router.get('/all', (req, res) => res.json(getAllFiles()));

// router.get('/:category', (req, res) => {
//   const { category } = req.params;
//   const page = Number(req.query.page) || 0;
//   const size = Number(req.query.size) || 500;
//   res.json(getFilesByGenre(category, page, size));
// });

// router.get('/latest', async (req, res) => {
//   const client = new FTP.Client();
//   const latest = [];

//   try {
//     await client.access(ftpConfig);

//     for (const ftpPath of PODCAST_PATHS) {
//       const list = await client.list(ftpPath);
//       const mp3s = list.filter(i => i.name.endsWith('.mp3'));
//       if (mp3s.length) {
//         const file = mp3s.sort((a, b) => b.modifiedAt - a.modifiedAt)[0];
//         const url = `${BASE_URL}${ftpPath}${file.name}`.replace(/ /g, '%20');
//         latest.push({ path: ftpPath, name: file.name, url });
//       }
//     }

//     res.json(latest);
//   } catch (err) {
//     console.error("fetch latest failed:", err);
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.close();
//   }
// });

// module.exports = router;
