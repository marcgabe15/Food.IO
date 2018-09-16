import React from 'react';
import { Button,TouchableOpacity,StyleSheet, FlatList, View, Text, Image } from 'react-native';
import {Header} from 'react-native-elements';
import { createStackNavigator } from 'react-navigation';
import { Camera, Permissions, ImageManipulator } from 'expo';


const Clarifai = require('clarifai');

const clarifai = new Clarifai.App({
  apiKey: 'fd93f5bffd524bd98043766dd3c636c9',
});
process.nextTick = setImmediate;

class HomeScreen extends React.Component {
  render() {
    return (
      <View>
        <Header
        leftComponent = {{ icon: 'menu', color: '#fff' }}
        centerComponent={{ text: 'Food.IO', style: { color: '#fff' }}}
        rightComponent={{ icon: 'home', color: '#fff' }}
        />
        <Image 
        style={{resizeMode: "cover", height: 300, width: 420}}
        source={require('./assets/fruit-background1.jpg')} ></Image>
        <Text style={{textAlign: 'center', fontFamily:'Helvetica', fontSize:30}}>
        Food.IO! An open source app using clarifai's api and react native to detect ingredients in food!
        Try it! Click the button below!
    </Text>
        <Button
          title="Press Here to Start!"
          onPress={() => this.props.navigation.navigate('Details')}
        />
      </View>
    );
  }
}

class objectclassification extends React.Component {
    state = {
      hasCameraPermission: null,
      predictions: [],
    };
    async componentWillMount() {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({ hasCameraPermission: status === 'granted' });
    };
    capturePhoto = async () => {
        if (this.camera) {
        let photo = await this.camera.takePictureAsync();
        return photo.uri;
      }
    };

    resize = async photo => {
      let manipulatedImage = await ImageManipulator.manipulate(
        photo,
        [{ resize: { height: 300, width: 300 } }],
        { base64: true }
      );
      return manipulatedImage.base64;
     };
    predict = async image => {
      let predictions = await clarifai.models.predict(
        'bd367be194cf45149e75f01d59f77ba7',
        image
      );
      return predictions;
    };
    objectDetection = async () => {
      let photo = await this.capturePhoto();
      let resized = await this.resize(photo);
      let predictions = await this.predict(resized);
      this.setState({ predictions: predictions.outputs[0].data.concepts });
    };

    render() {
      const { hasCameraPermission, predictions } = this.state;
     if (hasCameraPermission === null) {
        return <View />;
     } else if (hasCameraPermission === false) {
        return <Text>Camera Not available</Text>
     } else {
      return (
        <View style={{ flex: 1 }}>
        <Camera ref={ref => {
            this.camera = ref;
          }}
          style={{ flex: 1 }}
          type={this.state.type}
        >
        <View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}
          >   
          <View
              style={{
                flex: 1,
                alignSelf: 'flex-start',
                alignItems: 'center',
              }}
            >
            <FlatList
                data={predictions.map(prediction => ({
                  key: `${prediction.name} ${prediction.value}`,
                }))}
                renderItem={({ item }) => ( <Text style={{ paddingLeft: 15,alignItems: 'center', color: 'white', fontSize: 20 }}>{item.key}</Text> )}
              />
            </View>
              <View style={{alignItems: 'center', justifyContent: 'center' }}>
                  <Button title="Go to Home" onPress={() => this.props.navigation.navigate('Home')}/>
              </View>
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignItems: 'center',
                backgroundColor: 'skyblue',
                height: '10%',
              }}
              onPress={this.objectDetection}
            >
              <Text style={{ fontSize: 30, color: 'white', padding: 15 }}>
                {' '}
                Detect Objects
                {' '}
              </Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  };
};
};  

const RootStack = createStackNavigator(
{
  Home: HomeScreen,
  Details: objectclassification,
},
{
  initialRouteName: 'Home',
}
);

export default class App extends React.Component {
render() {
  return <RootStack />;
}}
