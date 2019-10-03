import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    Image,
    ImageBackground
} from "react-native";
import { Header, Icon, Left, Right, Footer } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';


class InnerCam extends Component {
    render() {
        return (
            <ImageBackground source={require('./components/video.jpg')} style={{ width: '100%', height: '100%', justifyContent: 'space-between' }}>
                <Header style={{ backgroundColor: 'transparent',justifyContent: 'center',alignItems: 'center' }}>
                    <Text style={{color: '#fff', fontSize: 25,fontWeight: '500', textAlign: 'center'}}>Inner Camera</Text>
                </Header>
                <Footer style={styles.footer_video}>
                    <View style={styles.icon_view}>
                        <Icon style={styles.icons} name="mic" type="Feather" />
                    </View>
                    <View style={styles.icon_call_view}>
                        <Icon style={styles.icons} name="phone" type="FontAwesome5" />
                    </View>
                    <View style={styles.icon_view}>
                        <Icon style={styles.icons} name="video" type="Feather" />
                    </View>


                </Footer>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({

    icon_view: {
        height: 60,
        width: 60,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        margin: 10
    },
    icon_call_view: {
        height: 60,
        width: 60,
        // borderWidth: 1,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        margin: 10,
        elevation: 5,
    },

    icons: {
        color: '#fff',
    },

    footer_video: {
        bottom: 0,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        // borderTopRightRadius: 40,
        // borderTopLeftRadius: 40,
    },
    header: {
        // backgroundColor: '#F18200',
        height: '10%',
        width: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,

    },

});

export default InnerCam;