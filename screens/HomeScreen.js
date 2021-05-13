import React from 'react';
import { Alert, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { Network } from '../lib/Network';
import { RecordManager } from '../lib/RecordManager';
import { TimelineRow } from '../components/TimelineRow';
import {} from '../constants/Service';

//
// TODO: Figure out a better name than Home and rename component\file names
// TODO: Separate out the render code into a View file
//

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    records: '',
    refreshing: true
  }

  componentDidMount() {
    // TODO: consider some kind of "last sync'd" storage strategy or use pagination request
    this.handleFetchRecord();
  }

  handleFetchRecord() {
    this.setState({refreshing: true});

    RecordManager.retryRecords();
    RecordManager.retryPhotos();

    Network.downloadRecords().then(response => {
      //console.log(response);
      this.setState({records: response});
      this.setState({refreshing: false});
    })
    .catch(error => {      
      console.log(error);
      this.handleFailedDownload();
    });
  }

  handleFailedDownload() {
    this.setState({refreshing: false});
    Alert.alert(
      'Download failed',
      'Could not download records. Please try again later.'
    );
  }

  renderRecords() {
    let records = (
      <Text style={{textAlign:'center', marginTop:20}}>No records to display</Text>
    );

    if (this.state.records.length > 0) {
      records = this.state.records.map((record, index) => (<TimelineRow key={index} navigation={this.props.navigation} record={record} />))
    }

    return records;
  }
  
  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.handleFetchRecord.bind(this)}/>}
        >
          {this.renderRecords()}
        </ScrollView>
      </View>
    );
  }
}

HomeScreen.propTypes = {
  navigation: PropTypes.object
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center'
  },
  contentContainer: {
    paddingTop: 0
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)'
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center'
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center'
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center'
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7'
  },
});
