const fs = require('fs');
const path = require('path');
const saveBase64File = require('../../utils/saveBase64File');

function saveBase64File(base64Data, folder = 'uploads') {
  const matches = base64Data.match(/^data:(image|video)\/(\w+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 format');

  const type = matches[1]; // image or video
  const ext = matches[2];  // png, jpg, mp4, etc.
  const buffer = Buffer.from(matches[3], 'base64');

  const dir = path.join(__dirname, '..', folder, type);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${type}-${Date.now()}.${ext}`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${type}/${filename}`; // or full URL if needed
}

module.exports = saveBase64File;
