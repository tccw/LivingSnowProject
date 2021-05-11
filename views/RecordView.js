import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import RNPickerSelect from 'react-native-picker-select';
import PropTypes from 'prop-types';
import { Storage } from '../lib/Storage';
import { RecordManager } from '../lib/RecordManager';
import KeyboardShift from '../components/KeyboardShift';
import Touchable from 'react-native-platform-touchable';
import { StockIcon } from '../components/TabBarIcon';
import * as Location from 'expo-location';
import { PhotoControl} from '../components/PhotoControl';
import { Routes } from '../navigation/Routes';

export class RecordView extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
      setOptions: PropTypes.func.isRequired,
    }).isRequired,
    route: PropTypes.object,
  }

  state = {
    //
    // visibility and data tracking
    //

    recordTypeVisible: false,
    datePickerVisible: false,
    gpsCoordinatesEditable: Platform.OS === 'ios' ? !global.appConfig.showGpsWarning : false,
    gpsCoordinatesFirstTap: true,
    gpsCoordinateString: undefined,
    watchPosition: undefined,
    isUploading: false,

    //
    // data collected and sent to the service
    //

    recordType: 'Sample', // sample or sighting
    date: undefined, // YYYY/MM/DD
    latitude: undefined, // GPS
    longitude: undefined, // GPS
    tubeId: undefined, // (optional) id of the tube
    locationDescription: undefined, // (optional) short description of the location
    notes: undefined, // (optional) any other pertinent information
    photos: []
  }

  constructor(props) {
    super(props);

    //
    // initialize date, keeping the format used by Calendar component
    //

    const date = new Date();
    let day = date.getDate();
    if (day < 10) {
      day = `0${day}`;
    }

    let month = date.getMonth() + 1;
    if (month < 10) {
      month = `0${month}`;
    }

    const year = date.getFullYear();
    this.state.date = `${year}-${month}-${day}`;
  }

  componentDidMount() {

    //
    // set callback when "upload-record icon" tapped
    // TODO: not super happy about this, maybe when we refactor to functional components and use hooks we can clean this up
    //

    const handleUploadRecord = function() {
      if (!this.validateInput()) {
        return;
      }
  
      if (this.state.isUploading) {
        return;
      }
  
      this.setState({isUploading: true});
  
      let record = {
        Type: this.state.recordType,
        Name: global.appConfig.name,
        Date: this.state.date,
        Organization: global.appConfig.organization,
        Latitude: this.state.latitude,
        Longitude: this.state.longitude,
        TubeId: this.state.tubeId,
        LocationDescription: this.state.locationDescription,
        Notes: this.state.notes
      };
    
      // TODO: add activity indicator
      RecordManager.uploadRecord(record, this.state.photos).then(() => {
        Alert.alert(`Upload succeeded`, `Thanks for your submission.`);
      })
      .catch(error => {
        console.log(error);
        Alert.alert(`Upload failed`, `We'll try again later.`);
      });
  
      // TODO: move to a 'finally' block once an activity indicator exists
      this.props.navigation.navigate(Routes.HomeScreen);
    }.bind(this);

    const { navigation } = this.props;
    navigation.setOptions({
      headerRight: function RecordRight() {
        return (
          <Touchable onPress={() => handleUploadRecord()}>
            <StockIcon name={Platform.OS === 'ios' ? 'ios-cloud-upload' : 'md-cloud-upload'} />
          </Touchable>
        )},
      headerRightContainerStyle: { marginRight: 20 },
    });
  
    //
    // start the gps
    //

    this.startGps();
  }

  componentDidUpdate() {

    //
    // TODO: not super happy about this, and it should probably be in one of the navigation listeners
    // need to better understand React lifecycles, hooks, etc
    //

    // route prop passed by navigation
    const { route } = this.props;
    if (route !== undefined && route.params?.data !== undefined) {
      if (JSON.stringify(this.state.photos) !== JSON.stringify(route.params.data)) {
        this.setState({photos: route.params?.data});
      }
    }
  }

  componentWillUnmount() {
    this.stopGps();
  }

  render() {
    const { navigation } = this.props;
    
    return (
      <KeyboardShift>
        {() => (
          <ScrollView style={styles.container}>
            <Text style={styles.optionStaticText}>
              Are you Taking a Sample or Reporting a Sighting?
            </Text>
            <RNPickerSelect
              style={pickerSelectStyles}
              useNativeAndroidPickerStyle={false}
              placeholder={{}}
              items={[{label: 'I\'m Taking a Sample', value: 'Sample'}, {label: 'I\'m Reporting a Sighting', value: 'Sighting'}]}
              onValueChange={value => {this.setRecordType(value)}}
              value={this.state.recordType}
            />
            
            <Text style={styles.optionStaticText}>
              Date
            </Text>
            <TouchableHighlight onPress={() => this.toggleDatePickerVisible()}>
              <View>
                {
                this.state.datePickerVisible && (
                <Calendar
                  current={this.state.date}
                  onDayPress={this.setDay.bind(this)}
                  markedDates={{[this.state.date]: {selected: true}}}
                />
              )}
              {
                !this.state.datePickerVisible && <Text style={styles.optionInputText}>{this.state.date}</Text>
              }
              </View>
            </TouchableHighlight>

            {/* don't show tubeId when recording a sighting */}
            {this.state.recordType === "Sample" && <View>
              <Text style={styles.optionStaticText}>
                Tube Id
              </Text>
              <TextInput
                style={styles.optionInputText}
                placeholder="Leave blank if the tube does not have an id"
                onChangeText={(tubeId) => this.setState({tubeId})}
                maxLength={40}
                returnKeyType="done"
              />
            </View>}

            {/* on iOS, TextInput takes precedence over TouchableHighlight.
                on Android, onTouchStart does nothing and editable also behaves differently.
                Workaround with TouchableHighlight, which takes precedence over TextInput. */}
            <Text style={styles.optionStaticText}>
              GPS Coordinates (latitude, longitude)
            </Text>
            {Platform.OS === 'ios' &&
            <TextInput
              style={styles.optionInputText}
              ref={(view) => this.GpsCoordinates = view}
              defaultValue={this.state.gpsCoordinateString}
              onChangeText={(value) => this.updateGpsCoordinateString(value)}
              onTouchStart={() => this.toggleCoordinateEntry()}
              maxLength={40}
              returnKeyType="done"
              editable={this.state.gpsCoordinatesEditable}
            />}

            {Platform.OS !== 'ios' &&
            <TouchableHighlight onPress={() => this.toggleCoordinateEntry()}>
              <TextInput
                style={styles.optionInputText}
                ref={(view) => this.GpsCoordinates = view}
                defaultValue={this.state.gpsCoordinateString}
                onChangeText={(value) => this.updateGpsCoordinateString(value)}
                maxLength={40}
                returnKeyType="done"
                editable={this.state.gpsCoordinatesEditable}
              />
            </TouchableHighlight>}

            <Text style={styles.optionStaticText}>
              Location Description (limit 255 characters)
            </Text>
            <TextInput
              style={styles.optionInputText}
              placeholder="ie: Blue Lake, North Cascades, WA"
              onChangeText={(locationDescription) => this.setState({locationDescription})}
              //onSubmitEditing={(event) => {this.Notes.focus()}}
              maxLength={255}
              returnKeyType="done"
            />

            <Text style={styles.optionStaticText}>
              Additional Notes (limit 255 characters)
            </Text>
            <TextInput
              style={styles.optionInputText}
              //ref={(view) => this.Notes = view}
              placeholder="ie. algae growing on glacial ice"
              onChangeText={(notes) => this.setState({notes})}
              maxLength={255}
              returnKeyType="done"
            />
            
            <Text style={styles.optionStaticText}>
              Select Photos (limit 3)
            </Text>
            <PhotoControl navigation={navigation} photos={this.state.photos}/>
          </ScrollView>
        )}
      </KeyboardShift>
    );
  }

  //
  // Record type functions and state
  //

  setRecordType(newRecordType) {
    this.setState({recordType: newRecordType});
    this.toggleRecordType();
  }

  toggleRecordType() {
    this.setState({recordTypeVisible: !this.state.recordTypeVisible});
  }

  //
  // Date functions and state
  //

  setDay(day) {
    this.toggleDatePickerVisible();
    this.setState({date: day.dateString});
  }

  toggleDatePickerVisible() {
    this.setState({datePickerVisible: !this.state.datePickerVisible});
  }

  //
  // GPS functions and state
  //

  async startGps() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    this.watchPosition = await Location.watchPositionAsync({
      accuracy: Location.High,
      timeInterval: 5000
    }, (position) => {
      this.parseCoordinates(position.coords);
    });
  }

  stopGps() {
    this.watchPosition.remove();
  }

  enableManualGpsCoordinates() {
    this.stopGps();
    
    //
    // reset coordinate string, make the coordinate input editable, set focus
    //

    this.updateGpsCoordinateString('');
    this.setState({gpsCoordinatesEditable: true});
    this.GpsCoordinates.focus();
  }

  clipCoordinate(coordinate) {
    return JSON.stringify(coordinate.toFixed(6)).replace('"','').replace('"','');
  }

  parseCoordinates({latitude, longitude}) {
    const lat = this.clipCoordinate(latitude);
    const long = this.clipCoordinate(longitude);
    this.updateGpsCoordinateString(`${lat}, ${long}`);
  }

  updateGpsCoordinateString(value) {
    this.setState({gpsCoordinateString: value});
    this.setState({latitude: undefined});
    this.setState({longitude: undefined});

    let coordinates = value.split(',');

    if (coordinates[0]) {
      this.setState({latitude: coordinates[0].trim()});
    }

    if (coordinates[1]) {
      this.setState({longitude: coordinates[1].trim()});
    }
  }

  toggleCoordinateEntry() {
    if (global.appConfig.showGpsWarning && !this.state.gpsCoordinatesEditable) {
      Alert.alert(
        'Enter GPS coordinates manually?',
        null,
        [{
          text: 'Yes, disable this message',
          onPress: () => {
            global.appConfig.showGpsWarning = false;
            Storage.saveAppConfig();
            this.enableManualGpsCoordinates();
          }
        },
        {
          text: 'Yes',
          onPress: () => this.enableManualGpsCoordinates()
        },
        {
          text: 'No',
          style: 'cancel'
        }]
      )
    }
    else if (this.state.gpsCoordinatesFirstTap) {
      this.enableManualGpsCoordinates();
      this.setState({gpsCoordinatesFirstTap: false});
    }
  }

  // form input validation
  validateInput() {
    if (!global.appConfig.name || global.appConfig.name === '') {
      global.appConfig.name = 'Anonymous';
      Storage.saveAppConfig();
    }

    if (!this.state.latitude || !this.state.longitude) {
      Alert.alert(
        `Invalid record`,
        `Your record does not have a valid GPS coordinate and cannot be uploaded.`,
        [{
            text: `Ok`
        }]
      );

      return false;
    }

    return true;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 1,
    paddingHorizontal: 10
  },
  optionStaticText: {
    fontSize: 15,
    marginTop: 3
  },
  optionInputText: {
    backgroundColor: '#efefef',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.optionInputText,
  inputAndroid: styles.optionInputText
});