import React, { Component } from 'react';

import { StyleSheet, Text, TouchableOpacity, AsyncStorage, View, ToastAndroid, ScrollView, Alert, Platform } from 'react-native';
import Sound from 'react-native-sound';
import LinearGradient from 'react-native-linear-gradient';
import { Header, Icon, Container, Content, Footer } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { AudioRecorder, AudioUtils, AudioSource } from 'react-native-audio';
import firebase from 'react-native-firebase';

import CustomLoading from './Loading';

const Button = ({ title, onPress }) => (
    <TouchableOpacity onPress={onPress}>
        <Text style={styles.button}>{title}</Text>
    </TouchableOpacity>
);

const HeaderCustom = ({ children, style }) => <Text style={[styles.header1, style]}>{children}</Text>;

const Feature = ({ title, onPress, description, buttonLabel = 'PLAY', status, disabledAllPlay, disableMe, onStopPress, deletePress }) => (
    <View style={styles.feature}>
        <HeaderCustom style={{ flex: 1 }}>{title}</HeaderCustom>
        {/* {status ? <Text style={{ padding: 5 }}>{resultIcons[status] || ''}</Text> : null} */}
        {
            !disabledAllPlay ? (
                disableMe ?
                    (
                        status == 'playing' ?
                            <Button title={"STOP"} onPress={onStopPress} />
                            : null
                    )
                    : <Button title={buttonLabel} onPress={onPress} />)
                : null
        }
        {

            !disabledAllPlay ? (
                disableMe ?
                    (
                        status == 'playing' ?
                            <TouchableOpacity onPress={deletePress}>
                                <View style={styles.icon_view_small}>
                                    <Icon style={[styles.icons_small, { color: 'red', fontSize: 28 }]} name="delete" type="MaterialCommunityIcons" />
                                </View>
                            </TouchableOpacity>
                            : null)
                    : <TouchableOpacity onPress={deletePress}>
                        <View style={styles.icon_view_small}>
                            <Icon style={[styles.icons_small, { color: 'red', fontSize: 28 }]} name="delete" type="MaterialCommunityIcons" />
                        </View>
                    </TouchableOpacity>)
                : null
        }
    </View>
);

const resultIcons = {
    '': '',
    pending: '?',
    playing: '\u25B6',
    win: '\u2713',
    fail: '\u274C',
};


function setTestState(testInfo, component, status) {
    component.setState({ tests: { ...component.state.tests, [testInfo.title]: status } });
}

/**
 * Generic play function for majority of tests
 */
function playSound(testInfo, component) {

    if (component.state.currentSound) component.state.currentSound.stop().release();
    setTestState(testInfo, component, 'pending');

    const callback = (error, sound) => {
        if (error) {
            Alert.alert('error', error.message);
            setTestState(testInfo, component, 'fail'); component.stopSound(testInfo.title);
            return;
        }
        setTestState(testInfo, component, 'playing');
        // Run optional pre-play callback
        testInfo.onPrepared && testInfo.onPrepared(sound, component);
        sound.play(() => {
            // Success counts as getting to the end
            setTestState(testInfo, component, 'win');
            // Release when it's done so we're not using up resources
            component.setState({
                currentSound: null,
                disableMe: '',
                disabledAllPlay: false
            })
            sound.release();
        });
    };

    // If the audio is a 'require' then the second parameter must be the callback.
    if (testInfo.isRequire) {
        const sound = new Sound(testInfo.url, error => callback(error, sound));
        component.setState({
            currentSound: sound,
            disableMe: testInfo.title
        })
    } else {
        const sound = new Sound(testInfo.url, testInfo.basePath, error => callback(error, sound));
        component.setState({
            currentSound: sound,
            disableMe: testInfo.title
        })
    }
}

class MainView extends Component {
    constructor(props) {
        super(props);

        Sound.setCategory('Playback'); // true = mixWithOthers

        // Special case for stopping
        this.stopSound = (title) => {
            if (!this.state.currentSound) {
                return;
            }

            this.state.currentSound.stop().release();
            this.setState({ currentSound: undefined, disabledAllPlay: false, disableMe: '', tests: { ...this.state.tests, [title]: '' } });
            console.log('state stop');
        };

        this.state = {
            loopingSound: undefined,
            tests: {},
            audioTests: {},
            user: null,
            currentTime: 0.0,
            recording: false,
            currentSound: undefined,
            paused: false,
            stoppedRecording: false,
            finished: false,
            hasPermission: undefined,
            audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
            disabledAllPlay: false,
            disableMe: '',
            uploading: false,
            isLoading: false
        };
    }
    deleteAudio = (id, title) => {
        console.log('id', id)
        Alert.alert('Delete Dialogue', 'Are you sure ???',
            [
                {
                    text: 'Cancel',
                    onPress: () => { deleteMe(false); console.log('Cancel Pressed') },
                    style: 'cancel',
                },
                { text: 'Accept', onPress: () => { deleteMe(true); console.log('OK Pressed') } },
            ])
        deleteMe = (isDelete) => {
            if (isDelete) {


                this.stopSound(title)
                this.setState({
                    isLoading: true,
                    disabledAllPlay: true
                })
                this.storage.child(this.state.user.uid).child(title).delete().then(e => {
                    console.log('file deleted ')
                    this.db.child(id).remove()
                    this.setState({
                        isLoading: false,
                        disabledAllPlay: false
                    })
                    console.log('data delete ')
                    this.setState({
                        isLoading: false,
                        disabledAllPlay: false
                    })
                }).catch(err => {
                    console.log('erro while deleting file ', err)
                    ToastAndroid.show('No file in the Storage', ToastAndroid.SHORT);
                })
                console.log('id deleted', id)
            }
        }

    }
    componentWillUnmount() {
        console.log('unmount');
        this.db.off('child_added', this.listnerChildAdded);
        this.db.off('child_removed', this.listnerChildRemoved);
        this.state.currentSound.stop().release();
    }


    componentDidMount() {

        AsyncStorage.getItem('user').then(user => {
            user = JSON.parse(user);
            this.setState({ user })
            this.storage = firebase.storage().ref().child('audios');
            this.db = firebase.database().ref('raspberry_db').child('audios').child(user.uid);
            console.log(user);
            self = this
            this.listnerChildAdded = firebase.database().ref('raspberry_db').child('audios').child(user.uid).on('child_added', (snapshot) => {
                // console.log('data', snapshot.val())
                if (snapshot.val()) {
                    this.setState({
                        audioTests: { ...this.state.audioTests, [snapshot.key]: { ...snapshot.val(), id: snapshot.key } }
                    })
                }
            }, function (err) {
                console.log(err, 'err')
            });
            this.listnerChildRemoved = firebase.database().ref('raspberry_db').child('audios').child(user.uid).on('child_removed', (snapshot) => {
                console.log('data', snapshot.val(), snapshot.key)
                if (snapshot.val()) {

                    var list = { ...this.state.audioTests }
                    // console.log('list', list)
                    delete list[snapshot.key];
                    // console.log('list', list)
                    this.setState({
                        audioTests: { ...list }
                    })
                }
            }, function (err) {
                console.log(err, 'err')
            });
            console.log('listner', this.listnerChildAdded)
            AudioRecorder.requestAuthorization().then((isAuthorised) => {
                this.setState({ hasPermission: isAuthorised });

                if (!isAuthorised) return;
                this.prepareRecordingPath(this.state.audioPath);

                AudioRecorder.onProgress = (data) => {
                    console.log('progess', data)
                    this.setState({ currentTime: Math.floor(data.currentTime) });
                };

                AudioRecorder.onFinished = (data) => {
                    // Android callback comes in the form of a promise instead.
                    console.log(data, "finished")
                    if (Platform.OS === 'ios') {
                        this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
                    }
                };
            }).catch(err => {
                console.log('error during permission', err)
            })
        })
    }

    prepareRecordingPath(audioPath) {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            IncludeBase64: true,
            AudioEncodingBitRate: 32000,
        });
    }
    async _pause() {
        if (!this.state.recording) {
            console.warn('Can\'t pause, not recording!');
            return;
        }

        try {
            const filePath = await AudioRecorder.pauseRecording();
            this.setState({ paused: true });
        } catch (error) {
            console.error(error);
        }
    }

    async _resume() {
        if (!this.state.paused) {
            console.warn('Can\'t resume, not paused!');
            return;
        }

        try {
            await AudioRecorder.resumeRecording();
            this.setState({ paused: false });
        } catch (error) {
            console.error(error);
        }
    }

    async _stop() {
        if (!this.state.recording) {
            console.warn('Can\'t stop, not recording!');
            return;
        }

        this.setState({ stoppedRecording: true, recording: false, paused: false, disabledAllPlay: false });

        try {
            const filePath = await AudioRecorder.stopRecording();
            const filesize = AudioRecorder.fileSize;
            if (Platform.OS === 'android') {
                this._finishRecording(true, filePath, filesize);
            }
            return filePath;
        } catch (error) {
            console.error(error);
        }
    }

    async _play() {
        if (this.state.recording) {
            await this._stop();
        }
        this.setState({
            disabledAllPlay: true
        })
        playSound({
            title: 'local recording file',
            url: this.state.audioPath,
        }, this);
        // These timeouts are a hacky workaround for some issues with react-native-sound.
        // See https://github.com/zmxv/react-native-sound/issues/89.
        // setTimeout(() => {
        //     var sound = new Sound(this.state.audioPath, '', (error) => {
        //         if (error) {
        //             console.log('failed to load the sound', error);
        //         } else {
        //             sound.play(); // have to put the call to play() in the onload callback
        //         }
        //     });

        //     // setTimeout(() => {
        //     //     sound.play((success) => {
        //     //         console.log('play time er', success);

        //     //         if (success) {
        //     //             console.log('successfully finished playing');
        //     //         } else {
        //     //             console.log('playback failed due to audio decoding errors');
        //     //         }
        //     //     });
        //     // }, 100);
        // }, 100);
    }
    _uploadCloud() {
        var user = firebase.auth().currentUser;
        var myFiles = this.storage.child(user.uid);

        if (!this.state.uploading) {
            this.setState({
                uploading: true,
                disabledAllPlay: true,
                isLoading: true
            })
            var myUniqueFileName = 'audioFile' + new Date().getTime() + '.aac';
            console.log(this.storage, user.uid, myUniqueFileName, this.state.audioPath);
            var file = myFiles.child(myUniqueFileName).putFile(this.state.audioPath).then(done => {
                console.log('file upload done ', done)
                this.setState({
                    uploading: false,
                    disabledAllPlay: false,
                    finished: false,
                    currentTime: 0,
                    isLoading: false
                })
                var audioTest = {
                    title: myUniqueFileName,
                    url: done.downloadURL,
                    show: 'Pre-Recorded Message'
                }
                this.db.push(audioTest)
                ToastAndroid.show('Successfully Upload File', ToastAndroid.LONG);

            }).catch(err => {
                console.log('Error while uploading  ', err)
                ToastAndroid.show('Error While uploading file', ToastAndroid.SHORT);
                this.setState({
                    disabledAllPlay: false,
                    uploading: false,
                    isLoading: false
                })
            })
            // this.setState({
            //     uploading: true
            // })

        } else {
            ToastAndroid.show('uploading in progress please wait...', ToastAndroid.LONG)
        }
    }
    async _record() {
        console.log('recording start ');
        if (this.state.recording) {
            console.warn('Already recording!');
            return;
        }

        if (!this.state.hasPermission) {
            console.warn('Can\'t record, no permission granted!');
            return;
        }

        if (this.state.stoppedRecording) {
            console.log('starting')
            this.prepareRecordingPath(this.state.audioPath);
        }

        if (this.state.currentSound) this.stopSound(this.state.disableMe)
        this.setState({ recording: true, paused: false, currentSound: undefined, disabledAllPlay: true, finished: false });

        try {
            const filePath = await AudioRecorder.startRecording();
        } catch (error) {
            console.error(error);
        }
    }

    _finishRecording(didSucceed, filePath, fileSize) {
        this.setState({ finished: didSucceed });
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
    }

    render() {
        return (
            // <View style={styles.container}>
            <Container>
                {this.state.isLoading ? <CustomLoading /> : null}
                <LinearGradient colors={['#F06101', '#F06C00', '#F18700']} style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => Actions.pop()}>
                        <Icon style={{ fontSize: 26, color: 'white' }} name="md-arrow-round-back" type="Ionicons"></Icon>
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontSize: 25, fontWeight: '500', }}>Electric DB</Text>
                </LinearGradient>
                <Content>

                    {/* <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}> */}
                    {Object.values(this.state.audioTests).map(testInfo => {
                        return (
                            <Feature
                                status={this.state.tests[testInfo.title]}
                                key={testInfo.title}
                                title={testInfo.show}
                                onPress={() => {
                                    return playSound(testInfo, this);
                                }}
                                onStopPress={() => {
                                    this.stopSound(testInfo.title);
                                }}
                                deletePress={() => {
                                    this.deleteAudio(testInfo.id, testInfo.title);
                                }}
                                disableMe={this.state.disableMe}
                                disabledAllPlay={this.state.disabledAllPlay}
                            />
                        );
                    })}
                </Content>
                <Footer style={styles.footer_video}>

                    <View style={{
                        position: 'absolute',
                        left: 10,
                        top: 30
                    }}>
                        <Text style={styles.progressText}>{this.state.currentTime}</Text>
                    </View>
                    {
                        this.state.recording ? (

                            this.state.paused ?
                                <TouchableOpacity onPress={() => { this._resume() }}>
                                    <View style={styles.icon_view_small}>
                                        <Icon style={styles.icons_small} name="play" type="FontAwesome" />
                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => { this._pause() }}>
                                    <View style={styles.icon_view_small}>
                                        <Icon style={styles.icons_small} name="pause" type="FontAwesome" />
                                    </View>
                                </TouchableOpacity>
                        )
                            : null
                    }
                    {
                        this.state.recording ?
                            <TouchableOpacity onPress={() => { this._stop() }} >
                                <View style={styles.icon_call_view}>
                                    <Icon style={styles.icons} name='stop' type="FontAwesome" />
                                </View>
                            </TouchableOpacity>
                            : !this.state.isLoading ?
                                <TouchableOpacity onPress={() => this._record()}>
                                    <View style={styles.icon_call_view} >
                                        <Icon style={styles.icons} name="microphone" type="FontAwesome" />
                                    </View>
                                </TouchableOpacity> : null
                    }
                    {
                        this.state.finished ?
                            <TouchableOpacity onPress={() => this._uploadCloud()}>
                                <View style={[styles.icon_view_small, styles.icons_small_orange]}>
                                    <Icon style={[styles.icons_small]} name="cloud-done" type="MaterialIcons" />
                                </View>
                            </TouchableOpacity>
                            : null
                    }
                    {
                        this.state.finished && !this.state.isLoading ? (

                            this.state.tests['local recording file'] !== 'playing' ?
                                <TouchableOpacity onPress={() => { this._play() }}>
                                    <View style={styles.icon_view_small}>
                                        <Icon style={styles.icons_small} name="play" type="FontAwesome" />
                                    </View>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => { this.stopSound('local recording file') }}>
                                    <View style={styles.icon_view_small}>
                                        <Icon style={styles.icons_small} name="stop" type="FontAwesome" />
                                    </View>
                                </TouchableOpacity>
                        )
                            : null
                    }
                    {
                        this.state.finished && !this.state.isLoading ?
                            <TouchableOpacity onPress={() => { this.stopSound('local recording file'); this.setState({ finished: false, currentTime: 0 }) }}>
                                <View style={styles.icon_view_small}>
                                    <Icon style={styles.icons_small} name="cancel" type="MaterialIcons" />
                                </View>
                            </TouchableOpacity>
                            : null
                    }

                </Footer>
                {/* </ScrollView> */}

            </Container>
            // </View>
        );
    }
}

export default MainView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {},
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 30,
        padding: 20,
        textAlign: 'center',
        backgroundColor: 'rgba(240,240,240,1)',
    },
    button: {
        fontSize: 20,
        backgroundColor: 'rgba(220,220,220,1)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(80,80,80,0.5)',
        overflow: 'hidden',
        padding: 7,
    },
    progressText: {
        // paddingTop: 50,
        fontSize: 30,
        color: "#fff"
    },
    backButton: {
        padding: 10,
        left: 0,
        position: 'absolute',
        marginLeft: 10
    },
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
    icon_view_small: {
        height: 40,
        width: 40,
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
        backgroundColor: 'blue',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        margin: 10,
        elevation: 5,
    },

    icons: {
        color: '#fff',
        fontSize: 30
    },
    icons_small_orange: {
        backgroundColor: "#F06101"
    },
    icons_small: {
        color: '#fff',
        fontSize: 20
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
    header1: {
        textAlign: 'left',
    },
    feature: {
        flexDirection: 'row',
        padding: 10,
        height: 60,
        alignSelf: 'stretch',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgb(180,180,180)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(230,230,230)',
    },
});