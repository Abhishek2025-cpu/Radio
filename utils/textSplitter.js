function splitTextByCharLength(text, charLimit = 300) {
  if (!text || typeof text !== 'string') return [];

  const words = text.trim().split(/\s+/);
  const chunks = [];
  let chunk = '';

  for (const word of words) {
    if ((chunk + ' ' + word).trim().length <= charLimit) {
      chunk += (chunk ? ' ' : '') + word;
    } else {
      if (chunk) chunks.push(chunk);
      chunk = word;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

module.exports = splitTextByCharLength;