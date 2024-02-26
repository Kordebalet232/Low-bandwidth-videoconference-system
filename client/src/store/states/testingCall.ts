import TestingCallT from "../../types/testingCallTypes";
import { io } from 'socket.io-client';
import testingCallAC from "../actionCreators/testingCallAC";

const socket: any = io('http://127.0.0.1:5000/test');


export const startListening = () => (dispatch) => {
    // dispatch(testingCallAC.connectSocket());
  
    socket.on('connect', () => {
      console.log('Соединение установлено');
    });
  
    socket.on('ImageResponse', (data) => {
        console.log(data)
    });

    socket.on('kpNormImage', (data) => {
        console.log(data)
        dispatch(testingCallAC.send_kp_norm_image(data))
        console.log("kp_norm_sent")
    })
  
    socket.on("ResultImage", (data) => {
        dispatch(testingCallAC.setImage(data))
        console.log("image settet")
    })
    
    socket.on('disconnect', () => {
      dispatch(testingCallAC.disconnectSocket());
      console.log('Соединение закрыто');
    });

};


const testing_call: TestingCallT =  {
    currentImage: null,
    socket: socket,
}

export default testing_call