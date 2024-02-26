import { Socket } from "socket.io-client";

type TestingCallT = {
    currentImage: string | null;
    socket: Socket;
}

export default TestingCallT