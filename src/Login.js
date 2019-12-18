import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    ToastAndroid,
    AsyncStorage
} from "react-native";
import { Item, Input, Button, Form, Header, Container, Icon, Body, Content } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
// var img = require('./components/raspi.jpg');
import firebase from 'react-native-firebase';
import CustomLoading from './Loading';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            isLoading: false
        }

    }
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            console.log('firebase suer ', user);
            if (user) {
                let db = firebase.database().ref('raspberry_db/');
                db.child('users').child(user.uid).once('value', snapshot => {
                    console.log(snapshot.val(), 'snapshot ');
                    AsyncStorage.setItem('user', JSON.stringify(snapshot.val())).then(_ => {
                        Actions.homepage();
                    })
                });
            }
        })
    }
    _emptyFields = () => {
        this.setState({
            email: '',
            password: '',
            isLoading: false
        })
        console.log('empty')
    }
    _loginUser = () => {
        let { email, password } = this.state;
        let self = this;
        if (email !== '' && password !== '') {
            this.setState({
                isLoading: true
            })
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(res => {
                    console.log(res, 'signup res ', this);
                    self._emptyFields();
                    let db = firebase.database().ref('raspberry_db/');
                    db.child('users').child(res.user.uid).once('value', snapshot => {
                        console.log(snapshot.val(), 'snapshot ');
                        AsyncStorage.setItem('user', JSON.stringify(snapshot.val())).then(_ => {
                            Actions.homepage();
                        })
                    },
                        err => {
                            self.setState({
                                isLoading: false
                            })
                            console.log('error while getting data ');
                        })
                }).catch(err => {
                    // console.log(err);
                    self.setState({
                        isLoading: false
                    })
                    switch (err.code) {
                        case 'auth/invalid-email':
                            ToastAndroid.show('Invalid Email', ToastAndroid.LONG)
                            console.log('invalid email ', err.message);
                            break;
                        case 'auth/user-disabled':
                            ToastAndroid.show('User is Disabled by Admin', ToastAndroid.LONG)
                            console.log('User is Disabled by Admin', err.message);
                            break;
                        case 'auth/user-not-found':
                            ToastAndroid.show('User not Found ', ToastAndroid.LONG)
                            console.log('User not Found ', err.message);
                            break;
                        case 'auth/wrong-password':
                            ToastAndroid.show('Wrong Password', ToastAndroid.LONG)
                            console.log('wrong pass ', err.message);
                            break;
                        default:
                            ToastAndroid.show('Network Error', ToastAndroid.SHORT);
                            break;
                    }
                })
        }
    }

    render() {
        // console.log('loading', this.state.isLoading);
        return (
            <Container>
                {this.state.isLoading ? <CustomLoading /> : null}
                <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.header}>

                    <View style={styles.img_view}>
                        <Image source={require('./components/raspi.png')} style={styles.logo_header} />
                    </View>
                    <View style={styles.login_text_view}>
                        <Text style={styles.login_text}>Login</Text>
                    </View>
                </LinearGradient>
                <Content>
                    <View style={{
                        flex: 1,
                        height: '100%',
                        justifyContent: 'space-between'
                    }}>

                        <View style={styles.container}>
                            <Item style={styles.item}>
                                <Icon style={styles.input_icon} name="email" type="MaterialIcons" />
                                <Input autoCapitalize='none' value={this.state.email} style={styles.item_input} placeholderTextColor="gray" placeholder='Email' onChangeText={email => this.setState({ email })} />
                            </Item>
                            <Item style={styles.item}>
                                <Icon style={styles.input_icon} name='md-key' type="Ionicons" />
                                <Input autoCapitalize="none" secureTextEntry={true} style={styles.item_input} value={this.state.password} placeholderTextColor="gray" placeholder='Password' onChangeText={password => this.setState({ password })} />
                            </Item>
                            {/* <View style={styles.forget_view}>
                        <Text styles={{ color: 'gray'  }} >Forgot Password ?</Text>
                    </View> */}
                        </View>
                        <TouchableOpacity style={styles.bttn_view} onPress={() => this._loginUser()}>
                            {/* <View > */}

                            <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.login_bttn}>
                                <Text style={styles.login_bttn_text}>LOGIN</Text>
                            </LinearGradient>
                            {/* </View> */}
                        </TouchableOpacity>
                        <View style={styles.footer}>
                            <Item style={styles.footer_item}>
                                <Text>Dont't have an account ? </Text>
                                <Text style={{ color: 'red' }}
                                    onPress={() => Actions.signup()}>&nbsp; SignUp </Text>
                            </Item>
                        </View>
                    </View>
                </Content>
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
    header: {
        // backgroundColor: '#F18200',
        height: '40%',
        width: '100%',
        borderBottomLeftRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        zIndex: 0

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
        marginTop: 40
    },
    login_bttn: {
        width: '80%',
        // backgroundColor: '#F18200',
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
        padding: 20,
        // backgroundColor: '#F5FCFF',
    },
});

export default Login;