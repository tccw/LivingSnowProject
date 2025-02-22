import React from "react";
import { Platform, ViewPropTypes } from "react-native";
import PropTypes from "prop-types";
import * as Icon from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { isSample } from "../record/Record";
import { AlgaeRecordTypePropType } from "../record/PropTypes";
import TestIds from "../constants/TestIds";

function StockIcon({ name, size, style, color, testID }) {
  return (
    <Icon.Ionicons
      name={name}
      size={size}
      style={style}
      color={color}
      testID={testID}
    />
  );
}

StockIcon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  style: ViewPropTypes.style,
  color: PropTypes.string,
  testID: PropTypes.string.isRequired,
};

StockIcon.defaultProps = {
  size: 32,
  style: undefined,
  color: Colors.tabIconDefault,
};

function RecordIcon({ type }: { type: AlgaeRecordType }) {
  let name = Platform.OS === "ios" ? "ios-eye" : "md-eye";
  let color = "skyblue";
  let testID = TestIds.Icons.SightingIcon;

  if (isSample(type)) {
    name = Platform.OS === "ios" ? "ios-flask" : "md-flask";
    color = "lightcoral";
    testID = TestIds.Icons.SampleIcon;
  }

  return <StockIcon name={name} size={48} color={color} testID={testID} />;
}

RecordIcon.propTypes = {
  type: AlgaeRecordTypePropType.isRequired,
};

function PictureIcon() {
  return (
    <StockIcon
      name={Platform.OS === "ios" ? "ios-image" : "md-image"}
      color="green"
      size={48}
      testID={TestIds.Icons.PictureIcon}
    />
  );
}

function DeleteIcon() {
  return (
    <StockIcon
      name={Platform.OS === "ios" ? "ios-trash-outline" : "md-trash-outline"}
      color="darkred"
      testID={TestIds.Icons.DeleteIcon}
    />
  );
}

function EditIcon() {
  return (
    <StockIcon
      name={Platform.OS === "ios" ? "ios-open-outline" : "md-open-outline"}
      color="green"
      testID={TestIds.Icons.EditIcon}
    />
  );
}

function ScrollTopIcon() {
  return (
    <StockIcon
      size={48}
      name={
        Platform.OS === "ios"
          ? "ios-chevron-up-circle-outline"
          : "md-chevron-up-circle-outline"
      }
      color="black"
      testID={TestIds.Icons.ScrollTopIcon}
    />
  );
}

function SnowIcon({ style }) {
  return (
    <StockIcon
      style={style}
      name={Platform.OS === "ios" ? "ios-snow" : "md-snow"}
      testID={TestIds.Icons.SnowIcon}
    />
  );
}

SnowIcon.propTypes = {
  style: ViewPropTypes.style,
};

SnowIcon.defaultProps = {
  style: {},
};

export {
  EditIcon,
  DeleteIcon,
  PictureIcon,
  RecordIcon,
  ScrollTopIcon,
  SnowIcon,
  StockIcon,
};
