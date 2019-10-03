# RCTWebRTCDemo

## Configuration (Works on Android)
**react: 16.7.0**

**react-native: 0.57.8**

**react-native-webrtc: 1.67.1**

## Usage
- Clone the repository, run `npm install`.  
- For iOS, run the project on Xcode.  
- For Android, run `react-native run-android` in the directory.  

## Instructions
- For this to work you need to create the server, go to : [RCTWebRTCDemo-server](https://github.com/DimitrisTzimikas/RCTWebRTCDemo-server) and follow the instructions.

- After you create the server and deploy it with ngrok copy the link, something like that "https://a4cd7858.ngrok.io" and paste it to **RCTWebRTCDEMO/main.js** 
```javascript
const url = 'paste_it_here';
```
- It must look like than
```javascript
const url = 'https://a4cd7858.ngrok.io/';
```

# Note 
- Whenever you change the ngrok link you must follow the same routine. 