import React, { Component } from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default class CustomLoading extends Component {
    render() {
        return (
            <View style={[styles.container]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,.6)'
    }
    // ,
    // horizontal: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-around',
    //     padding: 10
    // }
})
// export default CustomLoading;