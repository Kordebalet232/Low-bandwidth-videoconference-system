import Action from "../../types/Action"
import ACTIONS from "./ACTIONS"


function sendImage(
    image: string
): Action {
    return {
        type: ACTIONS.SEND_IMAGE,
        image: image
    }
}

function setImage(
    image: string
): Action {
    return {
        type: ACTIONS.SET_IMAGE,
        image: image
    }
}

function sendSourceImage(
    image: string
): Action {
    return {
        type: ACTIONS.SEND_SOURCE_IMAGE,
        image: image
    }
}

function send_kp_norm_image(
    kp_norm: any
): Action {
    return {
        type: ACTIONS.SEND_KP_NORM_IMAGE,
        kp_norm: kp_norm
    }
}

function connectSocket(): Action {
    return{
        type: ACTIONS.CONNECT_SOCKET
    }
}

function disconnectSocket(): Action {
    return{
        type: ACTIONS.DISCONNECT_SOCKET
    }
}

function receiveMessage(
    message: any
): Action {
    return{
        type: ACTIONS.RECEIVE_MESSAGE,
        payload: message
    }
}
const testingCallAC = {
    sendImage: sendImage,
    setImage: setImage,
    sendSourceImage: sendSourceImage,
    send_kp_norm_image: send_kp_norm_image,
    connectSocket: connectSocket,
    disconnectSocket: disconnectSocket,
    receiveMessage: receiveMessage
}

export default testingCallAC