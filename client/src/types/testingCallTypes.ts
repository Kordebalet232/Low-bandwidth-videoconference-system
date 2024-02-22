import { Socket } from "socket.io-client";

type TestingCallT = {
    currentImage: string | null;
    socket: Socket;
    kp_norm_sent: Boolean;
}

export default TestingCallT