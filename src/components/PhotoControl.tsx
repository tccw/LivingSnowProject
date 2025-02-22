import React, { useCallback } from "react";
import { Image, LogBox, Pressable, StyleSheet, Text, View } from "react-native";
import PropTypes from "prop-types";
import { formInputStyles } from "../styles/FormInput";
import TestIds from "../constants/TestIds";
import { PictureIcon } from "./Icons";

// because we pass a callback in params, more info from the following links
// follow links for best practices, look at Context
// https://reactnavigation.org/docs/troubleshooting/#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
// https://reactnavigation.org/docs/params/
// https://reactnavigation.org/docs/hello-react-navigation/#passing-additional-props
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

const styles = StyleSheet.create({
  // these styles could be dynamically sized\arranged based on number of photos and combinaions of portrait\landscape
  container: {
    flex: 1,
    margin: 1,
    height: 100,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 2,
  },
});

export default function PhotoControl({ navigation, photos, onUpdatePhotos }) {
  const renderPhotos = useCallback(() => {
    const colsPerRow = 2;

    // layout algorithm for even number of photos
    if (photos.length % colsPerRow === 0) {
      const result: Array<JSX.Element> = [];
      const rows = photos.length / colsPerRow;

      for (let row = 0; row < rows; row++) {
        const inner: Array<JSX.Element> = [];
        for (let col = 0; col < colsPerRow; col++) {
          const index = row * rows + col;
          inner.push(
            <View style={styles.container} key={index}>
              <Image style={styles.photo} source={{ uri: photos[index].uri }} />
            </View>
          );
        }

        result.push(
          <View style={{ flex: rows, flexDirection: "row" }} key={row}>
            {inner}
          </View>
        );
      }

      // short circuit function
      return result;
    }

    // layout algorithm for odd number of photos
    return (
      <View style={{ flex: photos.length, flexDirection: "row" }}>
        {photos.map((x, index) => (
          /* eslint-disable react/no-array-index-key */
          <View style={styles.container} key={index}>
            <Image style={styles.photo} source={{ uri: x.uri }} />
          </View>
        ))}
      </View>
    );
  }, [photos]);

  return (
    <>
      <Text style={formInputStyles.optionStaticText}>
        Select Photos (limit 4)
      </Text>
      <Pressable
        testID={TestIds.Photos.photoSelectorTestId}
        onPress={() =>
          navigation.navigate("ImageSelection", {
            onUpdatePhotos,
          })
        }
      >
        {photos.length === 0 && <PictureIcon />}
        {photos.length > 0 && renderPhotos()}
      </Pressable>
    </>
  );
}

PhotoControl.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        height: PropTypes.number,
        uri: PropTypes.string,
        width: PropTypes.number,
      }),
    ])
  ),
  onUpdatePhotos: PropTypes.func.isRequired,
};

PhotoControl.defaultProps = {
  photos: undefined,
};
