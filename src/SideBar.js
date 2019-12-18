import React from "react";
import { AppRegistry, Image, StatusBar } from "react-native";
import { Button, Text, Container, List, ListItem, Content, Icon, View } from "native-base";
import { Actions } from "react-native-router-flux";
import firebase from "react-native-firebase";
const routes = [
    { key: "1", link: () => Actions.innercam(), title: " Inner Camera", icon: 'video-camera', type: 'FontAwesome' },
    { key: "2", link: () => Actions.outtercam(), title: " Outer Camera", icon: 'video-camera', type: 'Entypo' },
    // { key: "3", link: () => Actions.audioList(), title: " Messages", icon: 'md-recording', type: 'Ionicons' },
    { key: "4", link: () => Actions.audios(), title: " Audios", icon: 'md-recording', type: 'Ionicons' },
    { key: "5", link: () => signOut(), title: " SignOut", icon: 'log-out', type: 'Entypo' },
];
function signOut() {
    firebase.auth().signOut();
    Actions.popTo('login');
}
export default class SideBar extends React.Component {
    componentDidMount() {

    }
    render() {
        return (
            <Container>
                <Content>
                    <Image
                        source={require("./components/video.jpg")}
                        style={{
                            height: 180,
                            width: "100%",
                            alignSelf: "stretch",
                            position: "absolute",
                            // resizeMode: 'contain'
                        }}
                    />
                    {/* <Image
                        square
                        style={{
                            borderRadius: 40,
                            height: 90,
                            width: 80,
                            position: "absolute",
                            alignSelf: "center",
                            top: 20
                        }}
                        source={require("./components/raspi.png")}
                    /> */}
                    <List
                        dataArray={routes}
                        contentContainerStyle={{ marginTop: 180 }}
                        renderRow={data => {
                            return (
                                <ListItem key={data.key} button onPress={data.link}>
                                    <Icon style={{ fontSize: 14 }} name={data.icon} type={data.type}></Icon>
                                    <Text>{data.title}</Text>
                                </ListItem>
                            );
                        }}
                    />
                </Content>
            </Container>
        );
    }
}
