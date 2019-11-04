import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ImageBackground,
    AppRegistry,
    AsyncStorage,
    Platform,
    ListView,
    TouchableHighlight,
    TextInput,
    YellowBox,
    Alert
} from "react-native";
import { Header, Icon, Left, Right, Footer, Container, Content } from 'native-base';
import { Actions } from 'react-native-router-flux';
import LinearGradient from 'react-native-linear-gradient';
import CustomLoading from './Loading'
import {
    RTCPeerConnection,
    //RTCMediaStream, /* old API */
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from "react-native-webrtc";
import io from "socket.io-client";


YellowBox.ignoreWarnings(['Setting a timer', 'Unrecognized WebSocket connection', 'ListView is deprecated and will be removed']);
const url = 'https://dimitristzimikas-rctwebrtcdemo-server.glitch.me';
const socket = io.connect(url, { transports: ["websocket"] });
const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    //sdpSemantics: 'unified-plan',
};

socket.on("exchange", function (data) {
    exchange(data);
});
socket.on("leave", function (socketId) {
    leave(socketId);
});
socket.on("connect", function (data) {
    console.log("connect", data);
});

const pcPeers = {};
let container;
let localStream;

function initStream() {
    getLocalStream(true, function (stream) {
        localStream = stream;
        container.setState({ selfViewSrc: stream.toURL() });
        // container.setState({
        //   status: "ready",
        //   info: "Please enter or create room ID",
        // });
    });
}

function getLocalStream(isFront, callback) {
    let videoSourceId;

    // on android, you don't have to specify sourceId manually, just use facingMode
    // uncomment it if you want to specify
    if (Platform.OS === "ios") {
        MediaStreamTrack.getSources(sourceInfos => {
            console.log("sourceInfos: ", sourceInfos);

            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (
                    sourceInfo.kind === "video" &&
                    sourceInfo.facing === (isFront ? "front" : "back")
                ) {
                    videoSourceId = sourceInfo.id;
                }
            }
        });
    }
    getUserMedia(
        {
            audio: true,
            video: {
                mandatory: {
                    minWidth: '100%', // Provide your own width, height and frame rate here
                    minHeight: 460,
                    minFrameRate: 30,
                },
                facingMode: isFront ? "user" : "environment",
                optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
            },
        },
        function (stream) {
            console.log("getUserMedia success", stream);
            callback(stream);
        },
        logError,
    );
}

const joinVideo = roomID => {
    console.log("join");
    socket.emit("join", roomID, 'front',
        function (socketIds) {
            console.log("join", socketIds);
            for (const i in socketIds) {
                const socketId = socketIds[i];
                createPC(socketId, true);
            }
        }

        // function (isJoin) {
        //     if (isJoin) {
        //         container.setState({
        //             info: "Connected to Server"
        //         })
        //     }
        // }
    );
};

const join = roomID => {
    socket.emit('changeCamera', roomID, 'front', () => {
        console.log('awen');
    })
}
socket.on('front', (videoReady) => {
    if (videoReady) {
        console.log('make a call');
        joinVideo(videoReady);
    }
})

function createPC(socketId, isOffer) {
    const pc = new RTCPeerConnection(configuration);
    pcPeers[socketId] = pc;

    pc.onicecandidate = function (event) {
        console.log("onicecandidate", event.candidate);
        if (event.candidate) {
            socket.emit("exchange", { to: socketId, candidate: event.candidate });
        }
    };

    function createOffer() {
        pc.createOffer(function (desc) {
            console.log("createOffer", desc);
            pc.setLocalDescription(
                desc,
                function () {
                    console.log("setLocalDescription", pc.localDescription);
                    socket.emit("exchange", { to: socketId, sdp: pc.localDescription });
                },
                logError,
            );
        }, logError);
    }

    pc.onnegotiationneeded = function () {
        console.log("onnegotiationneeded");
        if (isOffer) {
            createOffer();
        }
    };

    pc.oniceconnectionstatechange = function (event) {
        console.log("oniceconnectionstatechange", event.target.iceConnectionState);
        if (event.target.iceConnectionState === "completed") {
            setTimeout(() => {
                getStats();
            }, 1000);
        }
        if (event.target.iceConnectionState === "connected") {
            createDataChannel();
        }
    };
    pc.onsignalingstatechange = function (event) {
        console.log("onsignalingstatechange", event.target.signalingState);
    };

    pc.onaddstream = function (event) {
        console.log("onaddstream", event.stream);
        // Alert.alert(socketId, 'Calling you',
        //     [
        //         {
        //             text: 'Cancel',
        //             onPress: () => { acceptTheCall(false); console.log('Cancel Pressed') },
        //             style: 'cancel',
        //         },
        //         { text: 'Accept', onPress: () => { acceptTheCall(true); console.log('OK Pressed') } },
        //     ])
        // acceptTheCall = (accepted) => {
        //     if (accepted) {

        container.setState({ info: "One peer join!", enableHangup: true, isLoading: false });

        const remoteList = container.state.remoteList;
        remoteList[socketId] = event.stream.toURL();
        container.setState({ remoteList: remoteList });
        //     } else {
        //         hangup(container.state.roomID);
        //     }
        // }
    };
    pc.onremovestream = function (event) {
        console.log("onremovestream", event.stream);
    };

    pc.addStream(localStream);

    function createDataChannel() {
        if (pc.textDataChannel) {
            return;
        }
        const dataChannel = pc.createDataChannel("text");

        dataChannel.onerror = function (error) {
            console.log("dataChannel.onerror", error);
        };

        dataChannel.onmessage = function (event) {
            console.log("dataChannel.onmessage:", event.data);
            container.receiveTextData({ user: socketId, message: event.data });
        };

        dataChannel.onopen = function () {
            console.log("dataChannel.onopen");
            container.setState({ textRoomConnected: true });
        };

        dataChannel.onclose = function () {
            console.log("dataChannel.onclose");
        };

        pc.textDataChannel = dataChannel;
    }

    return pc;
}
function hangup(roomID) {
    socket.emit('hangup', roomID);
    // join(roomID);
}
function exchange(data) {
    const fromId = data.from;
    let pc;
    if (fromId in pcPeers) {
        pc = pcPeers[fromId];
    } else {
        pc = createPC(fromId, false);
    }

    if (data.sdp) {
        console.log("exchange sdp", data);
        pc.setRemoteDescription(
            new RTCSessionDescription(data.sdp),
            function () {
                if (pc.remoteDescription.type == "offer") {
                    pc.createAnswer(function (desc) {
                        console.log("createAnswer", desc);
                        pc.setLocalDescription(
                            desc,
                            function () {
                                console.log("setLocalDescription", pc.localDescription);
                                socket.emit("exchange", {
                                    to: fromId,
                                    sdp: pc.localDescription,
                                });
                            },
                            logError,
                        );
                    }, logError);
                }
            },
            logError,
        );
    } else {
        console.log("exchange candidate", data);
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}
function cancel(clientId) {
    socket.emit('cancelCall', clientId);
}
function leave(socketId) {
    console.log("leave", socketId);
    const pc = pcPeers[socketId];
    // const viewIndex = pc.viewIndex;
    if (pc) {

        pc.close();
        delete pcPeers[socketId];
    }

    const remoteList = container.state.remoteList;
    delete remoteList[socketId];
    container.setState({ remoteList: remoteList });
    container.setState({ info: "One peer leave!", enableHangup: false });
}

function logError(error) {
    console.log("logError", error);
}

function mapHash(hash, func) {
    const array = [];
    for (const key in hash) {
        const obj = hash[key];
        array.push(func(obj, key));
    }
    return array;
}

function getStats() {
    const pc = pcPeers[Object.keys(pcPeers)[0]];
    if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
        const track = pc.getRemoteStreams()[0].getAudioTracks()[0];

        console.log("track", track);

        pc.getStats(
            track,
            function (report) {
                console.log("getStats report", report);
            },
            logError,
        );
    }
}

class OutterCam extends Component {
    constructor(props) {
        super(props);

        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    }

    state = {
        info: "Initializing",
        status: "init",
        roomID: "",
        isFront: true,
        selfViewSrc: null,
        remoteList: {},
        textRoomConnected: false,
        textRoomData: [],
        textRoomValue: "",
        enableHangup: false,
        isLoading: false
    };

    componentDidMount() {
        container = this;
        AsyncStorage.getItem('user').then(user => {
            if (user) {
                user = JSON.parse(user);
                this.setState({
                    roomID: user.raspi_id + '_door',
                    isLoading: true,
                })
                initStream();
                this._press()
                console.log('user ', user)
            }
        })
    }

    _press = () => {
        // console.log("roomID", this.refs.roomID);
        // this.refs.roomID.blur();
        console.log("press", this.state.roomID);
        this.setState({ status: "connect", info: "Connecting to Raspberrypi server" });
        join(this.state.roomID);
    };
    componentWillUnmount() {
        hangup(this.state.roomID);
    }
    render() {
        return (
            // <ImageBackground source={require('./components/video.jpg')} style={{ width: '100%', height: '100%', justifyContent: 'space-between' }}>
            // </ImageBackground>
            <Container>
                {this.state.isLoading ? <CustomLoading></CustomLoading> : null}
                <Header style={{ justifyContent: 'center', alignItems: 'center', height: 84 }}>
                    <TouchableOpacity style={styles.backButton} onPress={() => Actions.pop()}>
                        <Icon style={{ fontSize: 26, color: 'white' }} name="md-arrow-round-back" type="Ionicons"></Icon>
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontSize: 25, fontWeight: '500', textAlign: 'center' }}>Outter Camera</Text>
                </Header>
                <Content />
                {mapHash(this.state.remoteList, function (remote, index) {
                    return (
                        <RTCView key={index} streamURL={remote} style={styles.selfView} />
                    );
                })}

                <Footer style={styles.footer_video}>
                    {/* <View style={styles.icon_view}>
                        <Icon style={styles.icons} name="mic" type="Feather" />
                    </View> */}

                    {
                        this.state.enableHangup ?
                            <TouchableOpacity onPress={() => Actions.pop()}>
                                <View style={styles.icon_call_view}>
                                    <Icon style={styles.icons} name="phone" type="FontAwesome5" />
                                </View>
                            </TouchableOpacity> : null
                    }
                    {/* <View style={styles.icon_view}>
                        <Icon style={styles.icons} name="video" type="Feather" />
                    </View> */}


                </Footer>
            </Container>
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
    backButton: {
        padding: 10,
        left: 0,
        position: 'absolute',
        marginLeft: 10
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
        // backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    selfView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // height:'100%'
    },
    remoteView: {
        width: '100%',
        height: '100%',
    },

});

export default OutterCam;