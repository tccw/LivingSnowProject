import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FirstRunScreen from "../FirstRunScreen";

test("validates Welcome Screen navigation", () => {
  const navigation = {
    navigate: jest.fn(),
  };

  const { getByText, toJSON } = render(
    <FirstRunScreen navigation={navigation} />
  );
  fireEvent.press(getByText("Let's get started!"));
  expect(navigation.navigate).toBeCalledWith("Timeline");
  expect(toJSON()).toMatchSnapshot();
});
