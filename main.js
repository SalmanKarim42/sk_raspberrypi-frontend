import React, { Component } from "react";
import {
  StyleSheet,
  AppRegistry,
  AsyncStorage,
  Platform,
  Text,
  ListView,
  TouchableHighlight,
  View,
  TextInput,
  YellowBox,
  Alert
} from "react-native";
import {
  Router,
  Stack,
  Drawer,
  Scene,
  Actions
} from "react-native-router-flux";
import firebase, { Notification, RemoteMessage } from 'react-native-firebase';
// import Home from "./src/Home";
import Login from "./src/Login";
import SignUp from "./src/SignUp";
import InnerCam from "./src/InnerCam";
import OutterCam from "./src/OutterCam";
import HomePage from "./src/HomePage";
import SideBar from "./src/SideBar";
import AudioExample from "./src/RecodeList";
import MainView from "./src/audiolist";


import io from "socket.io-client";


YellowBox.ignoreWarnings(['Setting a timer', 'Unrecognized WebSocket connection', 'ListView is deprecated and will be removed']);
const url = 'https://dimitristzimikas-rctwebrtcdemo-server.glitch.me';
const socket = io.connect(url, { transports: ["websocket"] });

socket.on("disconnect", function (socketid) {

  console.log("disconnect", socketid);
});
socket.on("connect", function (data) {
  console.log("connect", data);
});

class RCTWebRTCDemo extends Component {
  constructor(props) {
    super(props);

  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log('is user login ', user);
        Actions.homepage();

      } else {
        console.log('user not login ');
      }
    })
  }

  render() {
    return (
      <Router hideNavBar="true">
        <Scene key="root">
          <Scene initial key="login" component={Login} title="Login" hideNavBar={true} />
          <Scene key="signup" component={SignUp} title="SignUp" hideNavBar={true} />
          <Drawer hideNavBar key="drawerMenu" contentComponent={SideBar} drawerWidth={250} drawerPosition="left">
            <Scene initial key="homepage" component={HomePage} title="HomePage" hideNavBar={true} />
            <Scene key="innercam" component={InnerCam} title="InnerCam" hideNavBar={true} />
            <Scene key="outtercam" component={OutterCam} title="OuterCam" hideNavBar={true} />
            {/* <Scene key="audioList" component={AudioExample} title="Pre-Recorded Messages" hideNavBar={true} /> */}
            <Scene key="audios" component={MainView} title="Pre-Recorded Messages" hideNavBar={true} />
            {/* <Scene key="register" component={Register} title="Register" /> */}
            {/* <Scene key="home" component={Home} /> */}
          </Drawer>
        </Scene>
      </Router>
    );
  }
}

const styles = StyleSheet.create({
  selfView: {
    width: 200,
    height: 150,
  },
  remoteView: {
    width: '100%',
    height: '100%',
  },
  infoDiv: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F5FCFF",
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
  footerButtons: {
    position: 'absolute',
    bottom: 0,
    textAlign: "center",
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // backgroundColor:'red'

  },
  listViewContainer: {
    height: 150,
  },
});








// Move to a proper place
const handleFCMNotification = async (message: RemoteMessage) => {
  console.log('FCM OFFLINE: ', message);
  return Promise.resolve();
}




AppRegistry.registerComponent('RCTWebRTCDemo', () => RCTWebRTCDemo);

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => handleFCMNotification);
