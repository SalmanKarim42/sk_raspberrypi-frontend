import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ToastAndroid
} from "react-native";
import { Item, Input, Button, Form, Header, Container, Icon, Content } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import firebase from "react-native-firebase";
import CustomLoading from './Loading';
// var img = require('./components/raspi.jpg');
class SignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            raspi_id: '',
            isLoading: false
        }

    }
    componentWillMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                Actions.homepage();
            }
        })
    }
    _emptyFields = () => {
        this.setState({
            email: '',
            password: '',
            raspi_id: '',
            isLoading: false
        })
        console.log('empty')
    }
    _loginUser = () => {
        let { raspi_id, email, password } = this.state;
        let self = this;
        if (raspi_id == '') return console.log('must type raspi id')
        let db = firebase.database().ref('raspberry_db/');

        if (email !== '' && password !== '') {
            this.setState({
                isLoading: true
            })
            db.once('value', function (snapshot) {
                console.log(snapshot.val(), 'is have ');
                if (snapshot.hasChild(raspi_id.toLowerCase())
                    && typeof snapshot.child(raspi_id.toLowerCase()).val() == "string"
                ) {
                    console.log(snapshot.child(raspi_id.toLowerCase()).val(), typeof snapshot.child(raspi_id.toLowerCase()).val(), 'value');
                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then(res => {
                            console.log(res, 'signup res ');
                            db.child(raspi_id.toLowerCase()).set(res.user).then(function (s) {
                                self._emptyFields();
                                console.log('add item', s)
                                Actions.homepage();
                            })
                            
                        }).catch(err => {
                            console.log(err);
                            self.setState({
                                isLoading: false
                            })
                            switch (err.code) {
                                case 'auth/email-already-in-use':
                                    ToastAndroid.show('Email already in use ', ToastAndroid.SHORT)
                                    console.log('already in use ', err.message);
                                    break;
                                case 'auth/invalid-email':
                                    ToastAndroid.show('Invalid Email', ToastAndroid.SHORT)
                                    console.log('invalid email ', err.message);
                                    break;
                                case 'auth/operation-not-allowed':
                                    ToastAndroid.show('Auth is not Enable', ToastAndroid.SHORT)
                                    console.log('enable auth ', err.message);
                                    break;
                                case 'auth/weak-password':
                                    ToastAndroid.show('Password is weak, Password atleast 6 Letters ', ToastAndroid.SHORT)
                                    console.log('weak pass ', err.message);
                                    break;
                                default:
                                    ToastAndroid.show('Network Error', ToastAndroid.SHORT);
                                    break;
                            }
                        })
                } else {
                    ToastAndroid.show('your device id is not registered')
                }
            }, function (err) {
                console.log('error ', err)
                self.setState({
                    isLoading: false
                })
            })

        }
    }
    render() {
        return (
            <Container>
                {this.state.isLoading ? <CustomLoading /> : null}
                <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.header}>

                    <View style={styles.img_view}>
                        <Image source={require('./components/raspi.png')} style={styles.logo_header} />
                    </View>
                    <View style={styles.login_text_view}>
                        <Text style={styles.login_text}>SignUp</Text>
                    </View>
                </LinearGradient>
                <Content>

                    <View style={styles.container}>
                        <Item style={styles.item}>
                            <Icon style={styles.input_icon} name="raspberry-pi" type="FontAwesome5" />
                            <Input style={styles.item_input} value={this.state.raspi_id} placeholderTextColor="gray" placeholder='Raspberry Pi Id' onChangeText={(raspi_id) => this.setState({ raspi_id })} />
                        </Item>
                        <Item style={styles.item}>
                            <Icon style={styles.input_icon} name="email" type="MaterialIcons" />
                            <Input style={styles.item_input} value={this.state.email} placeholderTextColor="gray" placeholder='Email' onChangeText={(email) => this.setState({ email })} />
                        </Item>
                        <Item style={styles.item}>
                            <Icon style={styles.input_icon} name='md-key' type="Ionicons" />
                            <Input style={styles.item_input} value={this.state.password} placeholderTextColor="gray" placeholder='Password' onChangeText={(password) => this.setState({ password })} />
                        </Item>
                        {/* <View style={styles.forget_view}>
                        <Text styles={{ color: 'gray'  }} >Forgot Password ?</Text>
                    </View> */}
                    </View>
                    <TouchableOpacity style={styles.bttn_view} onPress={() => this._loginUser()}>
                        {/* <View > */}

                        <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.login_bttn} >
                            <Text style={styles.login_bttn_text}>SIGNUP</Text>
                        </LinearGradient>
                        {/* </View>/ */}
                    </TouchableOpacity>
                    <View style={styles.footer}>
                        <Item style={styles.footer_item}>
                            <Text>have already an account ? </Text>
                            <Text style={{ color: 'red' }}
                                onPress={() => Actions.pop()}>&nbsp; Login </Text>
                        </Item>
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
        marginTop: 40,
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
        padding: 20
        // backgroundColor: '#F5FCFF',
    },
});

export default SignUp;