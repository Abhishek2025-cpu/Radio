const ftp = require("basic-ftp");

class PodcastService {
  
  constructor() {
    // Credentials and config are fine.
    this.BASE_URL = "https://podcast.youradio.ma";
    this.FTP_HOST = "ftp.yourserver.com";
    this.FTP_USER = "ftpuser";
    this.FTP_PASS = "P@ssw0rd2022";

    // This is the list of directories we care about.
    this.PODCAST_PATHS = [
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

    

    // The cache will be our single source of truth.
    // Let's store all podcasts in a single flat array for easier processing.
    this.cache = [];
    this.isRefreshing = false; // A flag to prevent concurrent refreshes

    // Initial cache refresh and set up interval.
    // Use a longer interval in production, e.g., 5-15 minutes (300000 - 900000 ms)
    this.refreshCache();
    setInterval(() => this.refreshCache(), 600000); // Refresh every 10 minutes
  }

  async connectFTP() {
    const client = new ftp.Client(30000); // 30 second timeout
    // It's good practice to add a timeout to the client itself.
    client.ftp.verbose = false; // Set to true for detailed FTP logs during debugging
    try {
        await client.access({
            host: this.FTP_HOST,
            user: this.FTP_USER,
            password: this.FTP_PASS,
            secure: false // Use 'implicit' or true for FTPS
        });
    } catch(err) {
        console.error(`FTP connection failed: ${err.message}`);
        throw err;
    }
    return client;
  }

  async refreshCache() {
    if (this.isRefreshing) {
      console.log("Cache refresh already in progress. Skipping.");
      return;
    }

    console.log("Starting cache refresh...");
    this.isRefreshing = true;
    let client; // Define client here to use in finally block

    try {
      client = await this.connectFTP();
      const newCache = [];

      // Instead of recursively scanning everything, only scan the paths you need.
      // This is much faster and more targeted.
      for (const dir of this.PODCAST_PATHS) {
        // Remove trailing slash if it exists, for consistency
        const cleanDir = dir.endsWith('/') ? dir.slice(0, -1) : dir;
        const list = await client.list(dir);

        for (const file of list) {
          if (file.type === ftp.FileType.File && file.name.endsWith(".mp3")) {
            // Let's extract categories from the path
            const pathParts = cleanDir.replace('/podcasts/', '').split('/');
            const season = pathParts.length > 1 ? pathParts[0] : "General";
            const genre = pathParts.length > 1 ? pathParts[1] : "Unknown";
            const subgenre = pathParts.length > 2 ? pathParts[2] : "General";

            const fileUrl = `${this.BASE_URL}${dir}${file.name}`.replace(/ /g, "%20");
            newCache.push({
              url: fileUrl,
              path: dir,
              name: file.name,
              season,
              genre,
              subgenre,
              timestamp: file.modifiedAt || new Date()
            });
          }
        }
      }

      // Atomically replace the old cache with the new one
      this.cache = newCache.sort((a, b) => b.timestamp - a.timestamp);
      console.log(`Cache refresh complete. Found ${this.cache.length} podcasts.`);

    } catch (err) {
      // The original error `Timeout (control socket)` will be caught here.
      console.error("Error refreshing cache:", err.message);
    } finally {
      // Ensure the client connection is always closed.
      if (client && client.closed === false) {
        client.close();
      }
      this.isRefreshing = false;
    }
  }

  // Reads from the fast cache, no FTP connection needed.
  getFilesByCategory(category, page, size) {
    // The category parameter now refers to the 'genre' field
    return this.cache
      .filter(p => p.genre.toLowerCase() === category.toLowerCase())
      .slice(page * size, page * size + size);
  }

  // Reads from the fast cache, no FTP connection needed.
  getAllFiles() {
    return this.cache;
  }
  
  // *** REWRITTEN to use the cache - This is the key change ***
  // This function is now instant and reliable.
  getLatestFiles() {
    // Use a Map to find the single latest file for each unique path.
    const latestByPath = new Map();

    for (const podcast of this.cache) {
      // If we haven't seen this path before, or if the current podcast is newer
      // than the one we have stored for this path, update it.
      if (!latestByPath.has(podcast.path) || podcast.timestamp > latestByPath.get(podcast.path).timestamp) {
        latestByPath.set(podcast.path, podcast);
      }
    }

    // Return the values from the map, sorted by most recent first.
    return Array.from(latestByPath.values())
        .sort((a, b) => b.timestamp - a.timestamp);
  }
}

module.exports = PodcastService;