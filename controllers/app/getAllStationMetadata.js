const axios = require('axios');

const stations = [
  {
    name: 'U80',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover'
  },
  {
    name: 'U90',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover'
  },
  {
    name: 'UDANCE',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover'
  },
  {
    name: 'UPOP',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover'
  },
  {
    name: 'URADIO',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover'
  },
  {
    name: 'URBAN',
    metadataUrl: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover'
  }
];

exports.getAllRadioStationMetadata = async (req, res) => {
  try {
    const stationResults = await Promise.all(
      stations.map(async (station) => {
        const response = await axios.get(station.metadataUrl);

        // Make sure response.data.metadata is an array
        const metadataArray = Array.isArray(response.data.metadata)
          ? response.data.metadata
          : [];

        const filtered = metadataArray.filter((item, index) => {
          return index % 2 === 0 && item.title && item.title.trim() !== '-';
        });

        return {
          name: station.name,
          metadata: filtered
        };
      })
    );

    res.status(200).json({ stations: stationResults });
  } catch (error) {
    console.error('❌ Error fetching radio metadata:', error.message);
    res.status(500).json({
      error: 'Failed to fetch station metadata',
      details: error.message
    });
  }
};
