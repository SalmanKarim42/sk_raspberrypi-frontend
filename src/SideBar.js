import React from "react";
import { AppRegistry, Image, StatusBar } from "react-native";
import { Button, Text, Container, List, ListItem, Content, Icon } from "native-base";
const routes = [
    { link: "Inner Camera", title: " Inner Camera" },
    { link: "Outter Camera", title: " Outter Camera" },
];
export default class SideBar extends React.Component {
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
                    <Image
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
                    />
                    <List
                        dataArray={routes}
                        contentContainerStyle={{ marginTop: 180 }}
                        renderRow={data => {
                            return (
                                <ListItem button onPress={() => this.props.navigation.navigate(data.link)}>
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
