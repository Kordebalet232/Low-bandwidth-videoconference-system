import { Socket } from "socket.io-client";

type TestingCallT = {
    currentImage: string | null;
    socket: Socket;
    local_server_connection: Boolean;
    conference_server_connection: Boolean;
    socket_conference: Socket;
    screenshot: string | null;
    users: Map<string, any>
}

export default TestingCallT