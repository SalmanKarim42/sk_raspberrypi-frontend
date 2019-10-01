import React, { Component } from "react";
import {
  StyleSheet,
  AppRegistry
} from "react-native";
import {
  Router,
  Stack,
  Scene
} from "react-native-router-flux";
import Home from "./src/Home";
import Login from "./src/Login";
class RCTWebRTCDemo extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Router>
        <Stack key="root" hideNavBar={true}>
          <Scene initial key="login" component={Login} title="Login" />
          {/* <Scene key="register" component={Register} title="Register" /> */}
          <Scene  key="home" component={Home} />
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

AppRegistry.registerComponent('RCTWebRTCDemo', () => RCTWebRTCDemo);
