import TestingCallT from "../../types/testingCallTypes";
import { io } from 'socket.io-client';
import testingCallAC from "../actionCreators/testingCallAC";
import { Peer } from "peerjs";

const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
})

const peers = {}


function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

navigator.mediaDevices.getUserMedia({
  video: false,
  audio: true
}).then(stream => {

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket_conf.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

const socket_conf: any = io('http://localhost:4000')

const socket: any = io('http://127.0.0.1:5000/test');

myPeer.on('open', id => {
  socket_conf.emit('join-room', id)
})

export const startListening_server = () => (dispatch) => {
  
    socket_conf.on('connect', () => {
      dispatch(testingCallAC.connectSocket("conference"));

      let sourceTimerId = setTimeout(function tick() {  /// Раз в установленное время отправляем новый source
        dispatch(testingCallAC.sendSourceToAll())
        sourceTimerId = setTimeout(tick, 40000)
      }, 10000)

      let screenshotTimerId = setTimeout(function screen() {
      navigator.mediaDevices.getUserMedia({video: true})
      .then(gotMedia)
      .catch(error => console.error('getUserMedia() error:', error));

      function gotMedia(mediaStream) { // Раз в указанное время делаем скриншот и отправляем его на кодирование локальному серверу
        const mediaStreamTrack = mediaStream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(mediaStreamTrack);
        imageCapture.takePhoto().then((blob) => {
          var reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = function() {
            var base64Data = reader.result;
            dispatch(testingCallAC.setScreenshot(base64Data))
            dispatch(testingCallAC.getKpNorm(base64Data))
          }
        })
      }
        screenshotTimerId = setTimeout(screen, 1000);
      }, 1000)
    });
    
    socket_conf.on('disconnect', () => {
      dispatch(testingCallAC.disconnectSocket("conference"));

      console.log('Соединение с сервером закрыто');
    });

    socket_conf.on('nextKpNorm', (data) => { // Чтобы не обраюатывать собственные изображения надо раскомментить проверку
      // if (data.id !== socket_conf.id){
      dispatch(testingCallAC.makePicture(data.id === socket_conf.id ? "0" : data.id, data.kp_norm))
      // }
    })

    socket_conf.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })

    socket_conf.on('newSourceImage', (data) => {
      dispatch(testingCallAC.sendSourceImage(data.id === socket_conf.id ? "0" : data.id, data.image))
    });
};


export const startListening = () => (dispatch) => {
    // dispatch(testingCallAC.connectSocket());
  
    socket.on('connect', () => {
      dispatch(testingCallAC.connectSocket("local"));
    });
    
    socket.on('ImageResponse', (data) => {
        console.log(data)
    });

    socket.on('kpNorm', (data) => {
        console.log(data)
        dispatch(testingCallAC.sendKpNormToAll(data))
        console.log("kp_norm_sent")
    })
  
    socket.on("ResultImage", (data) => {
        dispatch(testingCallAC.setImage(data.image, data.id))
        console.log("image settet")
    })
    
    socket.on('disconnect', () => {
      dispatch(testingCallAC.disconnectSocket("local"));
      console.log('Соединение закрыто');
    });

};


const testing_call: TestingCallT =  {
    socket: socket,
    local_server_connection: false,
    conference_server_connection: false,
    socket_conference: socket_conf,
    screenshot: null,
    users: new Map<string, any>()
}

export default testing_call