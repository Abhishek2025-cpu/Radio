const ftp = require("basic-ftp");
const path = require("path");

class PodcastService {
  constructor() {
    this.BASE_PATH = "/podcasts";
    this.BASE_URL = "https://podcast.youradio.ma";
    this.FTP_HOST = "ftp.yourserver.com";
    this.FTP_USER = "ftpuser";
    this.FTP_PASS = "P@ssw0rd2022";
    this.cache = new Map();
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
      //... add the rest
    ];

    this.refreshCache();
    setInterval(() => this.refreshCache(), 1000000);
  }

  async connectFTP() {
    const client = new ftp.Client();
    await client.access({
      host: this.FTP_HOST,
      user: this.FTP_USER,
      password: this.FTP_PASS,
      passive: true
    });
    return client;
  }

  async refreshCache() {
    try {
      const client = await this.connectFTP();
      this.cache.clear();
      await this.scanDirectory(client, this.BASE_PATH, "");
      client.close();
    } catch (err) {
      console.error("Error refreshing cache:", err);
    }
  }

  async scanDirectory(client, dir, categoryPath) {
    const files = await client.list(dir);
    for (const file of files) {
      if (file.type === ftp.FileType.Directory) {
        const newPath = path.posix.join(dir, file.name);
        const newCategory = categoryPath ? `${categoryPath}/${file.name}` : file.name;
        await this.scanDirectory(client, newPath, newCategory);
      } else if (file.name.endsWith(".mp3")) {
        const parts = categoryPath.split("/");
        const season = parts.length === 3 ? parts[0] : "No Season";
        const genre = parts.length >= 2 ? parts[parts.length - 2] : "Unknown";
        const subgenre = parts.length >= 1 ? parts[parts.length - 1] : "General";

        const fileUrl = `${this.BASE_URL}${dir}/${file.name}`.replace(/ /g, "%20");
        const podcast = {
          url: fileUrl,
          season,
          genre,
          subgenre,
          timestamp: file.modifiedAt || new Date()
        };

        if (!this.cache.has(genre)) this.cache.set(genre, []);
        this.cache.get(genre).push(podcast);
      }
    }
  }

  getFilesByCategory(category, page, size) {
    const files = this.cache.get(category) || [];
    return files
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(page * size, page * size + size);
  }

  getAllFiles() {
    return Array.from(this.cache.values()).flat();
  }

  async getLatestFiles() {
    const client = await this.connectFTP();
    const latest = [];

    for (const dir of this.PODCAST_PATHS) {
      const list = await client.list(dir);
      const mp3Files = list.filter(f => f.name.endsWith(".mp3"));
      const latestFile = mp3Files.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt))[0];

      if (latestFile) {
        latest.push({
          path: dir,
          name: latestFile.name,
          modifiedAt: latestFile.modifiedAt,
          url: `${this.BASE_URL}${dir}${latestFile.name}`.replace(/ /g, "%20")
        });
      }
    }

    client.close();
    return latest;
  }
}

module.exports = PodcastService;
