import { AtlasType } from "./Atlas";

enum RecordType {
  Undefined = -1,
  Sample,
  Sighting,
  AtlasRedDot,
  AtlasRedDotWithSample,
  AtlasBlueDot,
  AtlasBlueDotWithSample,
  Max,
}

type RecordTypePickerItem = {
  value: RecordType;
  label: string;
};

// specific format for RNPickerSelect
const RecordTypePickerItems: RecordTypePickerItem[] = [
  { value: RecordType.Sample, label: `I'm Taking a Sample` },
  { value: RecordType.Sighting, label: `I'm Reporting a Sighting` },
  { value: RecordType.AtlasRedDot, label: `Atlas: Red Dot` },
  {
    value: RecordType.AtlasRedDotWithSample,
    label: `Atlas: Red Dot with Sample`,
  },
  { value: RecordType.AtlasBlueDot, label: `Atlas: Blue Dot` },
  {
    value: RecordType.AtlasBlueDotWithSample,
    label: `Atlas: Blue Dot with Sample`,
  },
];

// TODO: remove this, update database, and break old clients :)
const LegacyRecordTypeValues: string[] = [
  "Sample",
  "Sighting",
  "AtlasRedDot",
  "AtlasRedDotWithSample",
  "AtlasBlueDot",
  "AtlasBlueDotWithSample",
];

const translateToLegacyRecordType = (type: RecordType): string =>
  LegacyRecordTypeValues[type];

const getAllRecordTypePickerItems = (): RecordTypePickerItem[] =>
  RecordTypePickerItems;

const getRecordTypePickerItem = (type: RecordType): RecordTypePickerItem =>
  type > RecordType.Undefined && type < RecordType.Max
    ? RecordTypePickerItems[type]
    : { value: RecordType.Undefined, label: "Undefined" };

type Record = {
  id: string;
  type: RecordType;
  name?: string;
  organization?: string;
  date: Date;
  latitude: number | undefined;
  longitude: number | undefined;
  tubeId?: string;
  locationDescription?: string;
  notes?: string;
  photoUris?: string;
  atlasType: AtlasType;
};

/*
TODO: when Record type is unified (type, atlasType, and photoUris need alignment)
const makeExampleRecords = (type: RecordType): Record => ({
  id: uuidv4(),
  type,
  name: "Example Name",
  organization: "Example Organization",
  date: new Date(),
  latitude: 123.456789,
  longitude: -90.987654,
  tubeId: isSample(type) ? "JSX-1337" : "",
  locationDescription: "Example Location Description",
  notes: "Example Notes",
  photoUris: "",
  atlasType: AtlasType.SnowAlgae
});
*/

// BUGBUG: because legacy record type = string, but we will change to enum and break old clients :)
// So, Downloaded records => record.type = string, Pending\Saved records => record.type = RecordType
const isSample = (type: RecordType): boolean =>
  [
    RecordType.Sample,
    RecordType.AtlasRedDotWithSample,
    RecordType.AtlasBlueDotWithSample,
    "Sample",
    "AtlasRedDotWithSample",
    "AtlasBlueDotWithSample",
  ].includes(type);

// BUGBUG: because legacy record type = string, but we will change to enum and break old clients :)
// So, Downloaded records => record.type = string, Pending\Saved records => record.type = RecordType
const isAtlas = (type: RecordType | string): boolean =>
  [
    RecordType.AtlasRedDot,
    RecordType.AtlasRedDotWithSample,
    RecordType.AtlasBlueDot,
    RecordType.AtlasBlueDotWithSample,
    "AtlasRedDot",
    "AtlasRedDotWithSample",
    "AtlasBlueDot",
    "AtlasBlueDotWithSample",
  ].includes(type);

export {
  RecordType,
  Record,
  translateToLegacyRecordType,
  getRecordTypePickerItem,
  getAllRecordTypePickerItems,
  isSample,
  isAtlas,
};
