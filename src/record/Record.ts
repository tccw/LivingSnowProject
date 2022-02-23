import { AtlasType } from "./Atlas";
import { RecordDescription } from "../constants/Strings";

type RecordTypePickerItem = {
  value: AlgaeRecordType;
  label: string;
};

// specific format for RNPickerSelect
const recordTypePickerItems: RecordTypePickerItem[] = [
  { value: "Sample", label: RecordDescription.Sample },
  { value: "Sighting", label: RecordDescription.Sighting },
  { value: "Atlas: Red Dot", label: RecordDescription.AtlasRedDot },
  {
    value: "Atlas: Red Dot with Sample",
    label: RecordDescription.AtlasRedDotWithSample,
  },
  { value: "Atlas: Blue Dot", label: RecordDescription.AtlasBlueDot },
  {
    value: "Atlas: Blue Dot with Sample",
    label: RecordDescription.AtlasBlueDotWithSample,
  },
];

const getAllRecordTypePickerItems = (): RecordTypePickerItem[] =>
  recordTypePickerItems;

const getRecordTypePickerItem = (
  type: AlgaeRecordType
): RecordTypePickerItem => {
  const result = recordTypePickerItems.find((cur) => cur.value === type);

  if (result === undefined) {
    return { value: "Undefined", label: RecordDescription.Undefined };
  }

  return result;
};

const isSample = (type: AlgaeRecordType): boolean =>
  Array<AlgaeRecordType>(
    "Sample",
    "Atlas: Red Dot with Sample",
    "Atlas: Blue Dot with Sample"
  ).includes(type);

const isAtlas = (type: AlgaeRecordType): boolean =>
  Array<AlgaeRecordType>(
    "Atlas: Red Dot",
    "Atlas: Red Dot with Sample",
    "Atlas: Blue Dot",
    "Atlas: Blue Dot with Sample"
  ).includes(type);

// TODO: makeExampleRecord should also be used to seed RecordScreen (ie. no more "no records to display")
// BUGBUG: photoUris need alignment (new signature below)
// const makeExampleRecords = (type: RecordType): Record => ({
const makeExampleRecord = (type: AlgaeRecordType) => {
  const atlasType: AtlasType = isAtlas(type)
    ? AtlasType.SnowAlgae
    : AtlasType.Undefined;

  return {
    id: 1234,
    type,
    name: "test name",
    date: new Date("2021-09-16T00:00:00"),
    organization: "test org",
    latitude: -123.456,
    longitude: 96.96,
    tubeId: isSample(type) ? "LAB-1337" : "",
    locationDescription: "test location",
    notes: "test notes",
    atlasType,
    photoUris: "46;23;",
  };
};

// needed for JSON.parse, otherwise date property will become string
// TODO: add test for photoUris key
const recordReviver = (key: string, value: any): any => {
  if (key === "date") {
    return new Date(value);
  }

  return value;
};

// TODO: see if this can be made generic; jsonToRecord<T> = (json: string): T
const jsonToRecord = (json: string): AlgaeRecord | AlgaeRecord[] =>
  JSON.parse(json, recordReviver);

// want to display date in YYYY-MM-DD format
const recordDateFormat = (date: Date): string => {
  const dayNum: number = date.getDate();
  let day: string = `${dayNum}`;

  if (dayNum < 10) {
    day = `0${dayNum}`;
  }

  const monthNum: number = date.getMonth() + 1;
  let month: string = `${monthNum}`;

  if (monthNum < 10) {
    month = `0${monthNum}`;
  }

  return `${date.getFullYear()}-${month}-${day}`;
};

export {
  getRecordTypePickerItem,
  getAllRecordTypePickerItems,
  makeExampleRecord,
  isSample,
  isAtlas,
  jsonToRecord,
  recordDateFormat,
};
