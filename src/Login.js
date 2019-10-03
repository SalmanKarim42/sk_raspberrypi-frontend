import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight
} from "react-native";
import { Actions } from 'react-native-router-flux';
class Login extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <View>
                <TouchableHighlight onPress={() => Actions.home()}>
                    <Text>Login</Text>
                </TouchableHighlight>

            </View>
        );
    }
}

// const styles = StyleSheet.create({

// });

export default Login;