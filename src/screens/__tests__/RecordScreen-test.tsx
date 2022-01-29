import React from "react";
import { Alert } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import RecordScreen from "../RecordScreen";
import { RecordType } from "../../record/Record";
import {
  AtlasType,
  getAtlasPickerItem,
  getAllAtlasPickerItems,
} from "../../record/Atlas";
import { AppSettings, setAppSettings } from "../../../AppSettings";
import TestIds from "../../constants/TestIds";

const isAtlasVisible = (queryByText) => queryByText("Atlas Surface Data");
const isTubeIdVisible = (queryByText) => queryByText("Tube Id");

let renderer;
const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

describe("RecordScreen test suite", () => {
  beforeEach(() => {
    renderer = render(<RecordScreen navigation={navigation} />);
  });

  test("renders", () => {
    const { getByTestId } = renderer;
    fireEvent.press(getByTestId("calendar-pressable"));
    fireEvent(getByTestId("calendar"), "onDayPress", {
      dateString: "2022-01-01",
    });
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  describe("Record type picker tests", () => {
    test("Sample selected", () => {
      const { queryByText } = renderer;
      expect(isAtlasVisible(queryByText)).toBeFalsy();
      expect(isTubeIdVisible(queryByText)).toBeTruthy();
    });

    test("Sighting selected", () => {
      const { getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId("record-type-picker"),
        "onValueChange",
        RecordType.Sighting
      );
      expect(isAtlasVisible(queryByText)).toBeFalsy();
      expect(isTubeIdVisible(queryByText)).toBeFalsy();
    });
  });

  describe("GPS coordinate tests", () => {
    test("with Expo.Location", () => {
      const { getByTestId, queryByTestId } = renderer;
      const spy = jest.fn();
      jest.spyOn(Alert, "alert").mockImplementationOnce(
        (title, message, buttons) =>
          // @ts-ignore
          spy(buttons[1]) // No button
      );

      fireEvent.press(getByTestId(TestIds.GPS.gpsManualPressableTestId));
      expect(queryByTestId(TestIds.GPS.gpsManualInputTestId)).toBeNull();
      expect(spy).toHaveBeenLastCalledWith({ text: "No", style: "cancel" });
    });

    test("manual with confirmation", () => {
      const { getByDisplayValue, getByTestId } = renderer;
      const testCoordinates = "123.456, -98.765";
      jest.spyOn(Alert, "alert").mockImplementationOnce(
        (title, message, buttons) =>
          // @ts-ignore
          buttons[0].onPress() // Yes button
      );

      fireEvent.press(getByTestId(TestIds.GPS.gpsManualPressableTestId));
      fireEvent.changeText(
        getByTestId(TestIds.GPS.gpsManualInputTestId),
        testCoordinates
      );
      expect(getByDisplayValue(testCoordinates)).not.toBeNull();

      // pressable modal shouldn't be 1. visible, 2. prompt again, or 3. reset coordinates
      fireEvent.press(getByTestId(TestIds.GPS.gpsManualInputTestId));
      expect(getByDisplayValue(testCoordinates)).not.toBeNull();
    });

    test("manual without confirmation", async () => {
      const testCoordinates = "123.456, -98.765";
      const spy = jest.fn();
      jest.spyOn(Alert, "alert").mockImplementationOnce(() => spy());

      setAppSettings({ showGpsWarning: false } as AppSettings);

      const { getByDisplayValue, getByTestId, queryByTestId } = render(
        <RecordScreen navigation={navigation} />
      );

      expect(queryByTestId(TestIds.GPS.gpsManualInputTestId)).toBeNull();
      fireEvent.press(getByTestId(TestIds.GPS.gpsManualPressableTestId));

      expect(queryByTestId(TestIds.GPS.gpsManualPressableTestId)).toBeNull();
      fireEvent.changeText(
        getByTestId(TestIds.GPS.gpsManualInputTestId),
        testCoordinates
      );

      expect(getByDisplayValue(testCoordinates)).not.toBeNull();
      expect(spy).not.toBeCalled();
    });
  });

  describe("Atlas picker tests", () => {
    const recordSelectorTestId = "record-type-picker";
    const atlastSelectorTestId = "atlas-type-picker";

    test("Red Dot", () => {
      const { getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasRedDot
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeFalsy();
    });

    test("Red Dot with Sample", () => {
      const { getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasRedDotWithSample
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeTruthy();
    });

    test("Blue Dot", () => {
      const { getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasBlueDot
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeFalsy();
    });

    test("Blue Dot with Sample", () => {
      const { getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasRedDotWithSample
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeTruthy();
    });

    test("Red Dot surface picker", () => {
      const { getByDisplayValue, getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasRedDot
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeFalsy();

      const atlasTypes = getAllAtlasPickerItems();
      atlasTypes.forEach((item) => {
        fireEvent(
          getByTestId(atlastSelectorTestId),
          "onValueChange",
          item.value
        );
        expect(getByDisplayValue(item.label)).toBeTruthy();
      });
    });

    test("Red Dot with Sample surface picker", () => {
      const { getByDisplayValue, getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasRedDotWithSample
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeTruthy();

      const atlasTypes = [
        getAtlasPickerItem(AtlasType.SnowAlgae),
        getAtlasPickerItem(AtlasType.MixOfAlgaeAndDirt),
      ];
      atlasTypes.forEach((item) => {
        fireEvent(
          getByTestId(atlastSelectorTestId),
          "onValueChange",
          item.value
        );
        expect(getByDisplayValue(item.label)).toBeTruthy();
      });
    });

    test("Blue Dot surface picker", () => {
      const { getByDisplayValue, getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasBlueDot
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeFalsy();

      const atlasTypes = getAllAtlasPickerItems();
      atlasTypes.forEach((item) => {
        fireEvent(
          getByTestId(atlastSelectorTestId),
          "onValueChange",
          item.value
        );
        expect(getByDisplayValue(item.label)).toBeTruthy();
      });
    });

    test("Blue Dot with Sample surface picker", () => {
      const { getByDisplayValue, getByTestId, queryByText } = renderer;
      fireEvent(
        getByTestId(recordSelectorTestId),
        "onValueChange",
        RecordType.AtlasBlueDotWithSample
      );
      expect(isAtlasVisible(queryByText)).toBeTruthy();
      expect(isTubeIdVisible(queryByText)).toBeTruthy();

      const atlasTypes = [
        getAtlasPickerItem(AtlasType.SnowAlgae),
        getAtlasPickerItem(AtlasType.MixOfAlgaeAndDirt),
      ];
      atlasTypes.forEach((item) => {
        fireEvent(
          getByTestId(atlastSelectorTestId),
          "onValueChange",
          item.value
        );
        expect(getByDisplayValue(item.label)).toBeTruthy();
      });
    });
  });

  describe("TextInput tests", () => {
    test("TubeId", () => {
      const { getByPlaceholderText, getByDisplayValue } = renderer;
      const tubeId = getByPlaceholderText(
        "Leave blank if the tube does not have an id"
      );
      const expected = "123-456";

      fireEvent.changeText(tubeId, expected);
      expect(getByDisplayValue(expected)).not.toBeNull();
    });

    test("Location Description", () => {
      const { getByPlaceholderText, getByDisplayValue } = renderer;
      const location = getByPlaceholderText(
        "ie: Blue Lake, North Cascades, WA"
      );
      const expected = "Excelsior Pass on High Divide Trail";

      fireEvent.changeText(location, expected);
      expect(getByDisplayValue(expected)).not.toBeNull();
    });

    test("Notes", () => {
      const { getByPlaceholderText, getByDisplayValue } = renderer;
      const notes = getByPlaceholderText("ie. algae growing on glacial ice");
      const expected = "Frozen lake in a cold place with runnels of red snow";

      fireEvent.changeText(notes, expected);
      expect(getByDisplayValue(expected)).not.toBeNull();
    });
  });

  test.todo("Photos");
});
