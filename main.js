import React, { Component } from "react";
import {
  StyleSheet,
  AppRegistry
} from "react-native";
import {
  Router,
  Stack,
  Scene,
  Drawer,
} from "react-native-router-flux";
import Home from "./src/Home";
import Login from "./src/Login";
import SignUp from "./src/SignUp";
import InnerCam from "./src/InnerCam";
import OutterCam from "./src/OutterCam";
import HomePage from "./src/HomePage";
import SideBar from "./src/SideBar";
class RCTWebRTCDemo extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Router hideNavBar="true">
        <Scene key="root">
            {/* <Scene key="login" component={Login} title="Login" hideNavBar={true}/>
            <Scene key="signup" component={SignUp} title="SignUp" hideNavBar={true}/> */}
          <Drawer hideNavBar key="drawerMenu" contentComponent={SideBar} drawerWidth={250} drawerPosition="Left">
            <Scene key="innercam" component={InnerCam} title="InnerCam" hideNavBar={true}/>
            <Scene key="outtercam" component={OutterCam} title="OutterCam" hideNavBar={true}/>
            <Scene initial key="homepage" component={HomePage} title="HomePage" hideNavBar={true}/>
            {/* <Scene key="register" component={Register} title="Register" /> */}
            <Scene  key="home" component={Home} />
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

AppRegistry.registerComponent('RCTWebRTCDemo', () => RCTWebRTCDemo);
