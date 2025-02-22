import { getAlgaeColorPickerItem } from "../Color";
import { AlgaeColorDescription } from "../../constants/Strings";

describe("Algae Color test suite", () => {
  test("getAlgaeColorPickerItem values", () => {
    let cur = getAlgaeColorPickerItem("Select a color");
    expect(cur.label).toEqual(AlgaeColorDescription.Select);

    cur = getAlgaeColorPickerItem("Red");
    expect(cur.label).toEqual(AlgaeColorDescription.Red);

    cur = getAlgaeColorPickerItem("Pink");
    expect(cur.label).toEqual(AlgaeColorDescription.Pink);

    cur = getAlgaeColorPickerItem("Grey");
    expect(cur.label).toEqual(AlgaeColorDescription.Grey);

    cur = getAlgaeColorPickerItem("Green");
    expect(cur.label).toEqual(AlgaeColorDescription.Green);

    cur = getAlgaeColorPickerItem("Yellow");
    expect(cur.label).toEqual(AlgaeColorDescription.Yellow);

    cur = getAlgaeColorPickerItem("Orange");
    expect(cur.label).toEqual(AlgaeColorDescription.Orange);

    cur = getAlgaeColorPickerItem("Other");
    expect(cur.label).toEqual(AlgaeColorDescription.Other);
  });

  test("getAlgaeColorPickerItem Select a color", () => {
    expect(getAlgaeColorPickerItem("garbage" as AlgaeColor).label).toEqual(
      AlgaeColorDescription.Other
    );
  });
});
