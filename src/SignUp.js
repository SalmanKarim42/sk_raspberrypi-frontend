import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    Image
} from "react-native";
import { Item, Input, Button, Form, Header, Container, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
// var img = require('./components/raspi.jpg');
class SignUp extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <Container>
                <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.header}>

                    <View style={styles.img_view}>
                        <Image source={require('./components/raspi.png')} style={styles.logo_header} />
                    </View>
                    <View style={styles.login_text_view}>
                        <Text style={styles.login_text}>SignUp</Text>
                    </View>
                </LinearGradient>
                <View style={styles.container}>
                    <Item style={styles.item}>
                        <Icon style={styles.input_icon} name="email" type="MaterialIcons" />
                        <Input style={styles.item_input} placeholderTextColor="gray" placeholder='Email' />
                    </Item>
                    <Item style={styles.item}>
                        <Icon style={styles.input_icon} name='md-key' type="Ionicons" />
                        <Input style={styles.item_input} placeholderTextColor="gray" placeholder='Password' />
                    </Item>
                    {/* <View style={styles.forget_view}>
                        <Text styles={{ color: 'gray'  }} >Forgot Password ?</Text>
                    </View> */}
                </View>
                <View style={styles.bttn_view}>
                    <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.login_bttn}>
                        <Text style={styles.login_bttn_text}>SIGNUP</Text>
                    </LinearGradient>
                </View>
                <View style={styles.footer}>
                    <Item style={styles.footer_item}>
                        <Text>have already an account ? </Text>
                        <Text style={{ color: 'red' }}
                            onPress={()=> Actions.login()}>&nbsp; Login </Text>
                    </Item>
                </View>
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