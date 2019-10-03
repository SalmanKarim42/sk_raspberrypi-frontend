import React, { Component } from "react";
import {
  StyleSheet,
  AppRegistry,
  AsyncStorage,
  Platform
} from "react-native";
import {
  Router,
  Stack,
  Scene
} from "react-native-router-flux";
import Home from "./src/Home";
import Login from "./src/Login";
import firebase, { Notification, RemoteMessage } from 'react-native-firebase';

class RCTWebRTCDemo extends Component {
  constructor(props) {
    super(props);
    console.log(firebase, 'new ');

  }
  async componentDidMount() {
    if (Platform.OS === 'android') {
      try {
        const res = await firebase.messaging().requestPermission();
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token: ', fcmToken);
          const enabled = await firebase.messaging().hasPermission();
          if (enabled) {
            console.log('FCM messaging has permission:' + enabled)
          } else {
            try {
              await firebase.messaging().requestPermission();
              console.log('FCM permission granted')
            } catch (error) {
              console.log('FCM Permission Error', error);
            }
          }
          firebase.notifications().onNotificationDisplayed((notification: Notification) => {
            // Process your notification as required
            // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
            console.log('Notification: ', notification)
          });
          this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
            console.log('Notification: ', notification)
          });
        } else {
          console.log('FCM Token not available');
        }
      } catch (e) {
        console.log('Error initializing FCM', e);
      }
    }
  }
  render() {
    return (
      <Router>
        <Stack key="root" hideNavBar={true}>
          <Scene initial key="login" component={Login} title="Login" />
          {/* <Scene key="register" component={Register} title="Register" /> */}
          <Scene key="home" component={Home} />
        </Stack>
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

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => PushNotificationService.handleFCMNotification);