import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    AsyncStorage,
    BackHandler
} from "react-native";
import { Item, Input, Button, Form, Header, Container, Icon, Left } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import firebase from "react-native-firebase";
// var img = require('./components/raspi.jpg');
class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        }

    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        AsyncStorage.getItem('user').then(user => {
            user = JSON.parse(user);
            this.setState({
                user
            })
            // console.log(user, 'user');
            if (user) {
                if (Platform.OS === 'android') {
                    this.setupNotification();
                }
            }
        })
        this.users = firebase.database().ref('raspberry_db/users');
        this.devices = firebase.database().ref('raspberry_db/devices');
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    handleBackPress = () => {
        // this.goBack(); // works best when the goBack is async
        // console.log('111backpress')
        return true;
    }
    setupNotification = async () => {
        try {
            const res = await firebase.messaging().requestPermission();
            const fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                console.log('FCM Token: ', fcmToken);
                this.users.child(this.state.user.uid).update({ fcmToken }).then(e => {
                    console.log('success', e)
                }).catch(err => {
                    console.log('error', err)
                })
                this.devices.child(this.state.user.raspi_id).update({ fcmToken }).then(e => {
                    console.log('success', e)
                }).catch(err => {
                    console.log('error', err)
                })
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
                    firebase.notifications().displayNotification(notification);
                });
                this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
                    console.log('Notification: ', notification)
                    firebase.notifications().displayNotification(notification);
                });
            } else {
                console.log('FCM Token not available');
            }
        } catch (e) {
            console.log('Error initializing FCM', e);
        }
    }

    render() {
        return (
            <Container>
                <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => Actions.drawerOpen()}>
                        <Icon style={{ fontSize: 26, color: 'white' }} name="md-menu" type="Ionicons"></Icon>
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontSize: 25, fontWeight: '500', }}>Electric DB</Text>
                </LinearGradient>
                <View style={{ justifyContent: 'center', height: '88%' }}>
                    <View style={styles.bttn_view}  >
                        <Button style={styles.login_bttn} onPress={() => Actions.innercam()} >
                            <Icon name='video-camera' type='FontAwesome'></Icon>
                            <Text style={styles.login_bttn_text}>Inner Camera</Text>
                        </Button>
                    </View>
                    <View style={styles.bttn_view}  >
                        <Button style={styles.login_bttn} onPress={() => Actions.outtercam()} >
                            <Icon name='video-camera' type='Entypo'></Icon>
                            <Text style={styles.login_bttn_text}>Outter Camera</Text>
                        </Button>
                    </View>

                </View>
                {/* <View style={styles.footer}>
                    <Item style={styles.footer_item}>
                        <Text>Dont't have an account ? </Text>
                        <Text style={{ color: 'red' }}
                            onPress={() => Actions.signup()}>&nbsp; SignUp </Text>
                    </Item>
                </View> */}
            </Container>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        padding: 10,
        left: 0,
        position: 'absolute',
        marginLeft: 10
    },
    header: {
        // backgroundColor: '#F18200',
        height: '12%',
        width: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        elevation: 3,

    },
    img_view: {
        borderWidth: 4,
        height: 100,
        width: 100,
        justifyContent: 'center',
        borderRadius: 50,
        borderColor: '#fff',
    },
    logo_header: {
        height: 80,
        width: 80,
        alignSelf: 'center'
    },
    login_text_view: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        marginTop: 20,
    },
    login_text: {
        textAlign: 'right',
        color: '#fff',
        fontSize: 25,
        fontWeight: '500'
    },
    item: {
        fontSize: 20,
        textAlign: 'center',
        width: '80%',
        borderBottomWidth: 0,
        backgroundColor: '#fff',
        borderColor: 'gray',
        marginTop: 10,
        borderRadius: 20,
        elevation: 5,
    },
    input_icon: {
        paddingLeft: 15,
        color: 'gray',
    },
    item_input: {
        fontSize: 15,
        paddingLeft: 10,
        paddingRight: 10,
    },
    // forget_view: {
    //     flexDirection: 'row',
    //     marginTop: 10,
    //     width: '80%',
    //     justifyContent: 'flex-end',
    //     marginTop: 10,
    // },
    bttn_view: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    login_bttn: {
        width: '80%',
        backgroundColor: '#F18200',
        borderRadius: 50,
        justifyContent: 'center',
        padding: 14,
        elevation: 3,
    },
    login_bttn_text: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '500'
    },
    footer_item: {
        borderBottomWidth: 0,
    },
    footer: {
        flexDirection: 'row',
        textAlign: 'center',
        color: '#333333',
        borderTopWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
        // backgroundColor: '#F5FCFF',
    },
});

export default HomePage;