// for TextInput placeholder prop
const Placeholders = {
  GPS: {
    AcquiringLocation: "Looking for GPS signal",
    EnterCoordinates: "ie. 12.345678, -123.456789",
    NoPermissions:
      "Check location permissions in Settings. Enter coordinates manually.",
    NoLocation: "Could not determine location. Enter coordinates manually.",
  },
  Settings: {
    Username: "Enter your name",
    Organization: "Enter the organization you belong to (if any)",
  },
  // TODO: RecordScreen placeholders
};

const Labels = {
  TimelineScreen: {
    DownloadedRecords: "Downloaded",
    NoRecords: "No records to display",
    PendingRecords: "Pending",
  },
  StatusBar: {
    NoConnection: "No Internet Connection",
  },
};

// for Alert.alert calls
const Notifications = {
  uploadSuccess: {
    title: "Upload succeeded",
    message: "Thanks for your submission.",
  },
  uploadFailed: {
    title: "Record Saved",
    message: "We will upload it later.",
  },
  invalidCoordinates: {
    title: "Invalid GPS coordinates",
    message:
      'Coordinates must be in "lat, long" format. ie. 12.345678, -123.456789',
  },
};

const RecordDescription = {
  Sample: `I'm Taking a Sample`,
  Sighting: `I'm Reporting a Sighting`,
  AtlasRedDot: `Atlas: Red Dot`,
  AtlasRedDotWithSample: `Atlas: Red Dot with Sample`,
  AtlasBlueDot: `Atlas: Blue Dot`,
  AtlasBlueDotWithSample: `Atlas: Blue Dot with Sample`,
  Undefined: "Undefined",
};

const AtlasDescription = {
  SnowAlgae: "Snow Algae",
  DirtOrDebris: "Dirt or Debris",
  Ash: "Ash",
  WhiteSnow: "White Snow",
  MixOfAlgaeAndDirt: `Mix of Algae and Dirt`,
  ForestOrVegetation: `Forest or Vegetation`,
  Other: `Other (please describe in notes)`,
  Undefined: "Undefined",
};

export {
  Notifications,
  Placeholders,
  Labels,
  RecordDescription,
  AtlasDescription,
};
