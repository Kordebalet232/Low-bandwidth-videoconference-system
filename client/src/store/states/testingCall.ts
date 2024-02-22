import TestingCallT from "../../types/testingCallTypes";
import { io } from 'socket.io-client';

const socket: any = io('http://127.0.0.1:5000/test');

const testing_call: TestingCallT =  {
    currentImage: null,
    socket: socket,
    kp_norm_sent: false
}

export default testing_call