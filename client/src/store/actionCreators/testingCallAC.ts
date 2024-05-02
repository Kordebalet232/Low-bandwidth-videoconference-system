import Action from "../../types/Action"
import ACTIONS from "./ACTIONS"


/// CONFERENCE ACTIONS START ///
function sendKpNormToAll(
    kp_norm: any
): Action {
    return {
        type: ACTIONS.SEND_KP_NORM_IMAGE_TO_ALL,
        kp_norm: kp_norm
    }
}

function sendSourceToAll(): Action {
    return {
        type: ACTIONS.SEND_SOURCE_TO_ALL
    }
}
/// CONFERENCE ACTIONS END ///

/// LOCAL SERVER ACTIONS START ///
function sendSourceImage(
    id: string,
    image: string
): Action {
    return {
        type: ACTIONS.SEND_SOURCE_IMAGE,
        image: image,
        id: id
    }
}

function getKpNorm(
    image: any,
    ): Action {
    return{
        type: ACTIONS.GET_KP_NORM,
        image: image
    }
}

function makePicture(
    id: string,
    kp_norm: any
): Action {
    return {
        type: ACTIONS.MAKE_PICTURE,
        id: id,
        kp_norm: kp_norm
    }
}
/// LOCAL SERVER ACTIONS END ///

function connectSocket(
    socket_type: string // "local" or "conference"
): Action {
    return{
        type: ACTIONS.CONNECT_SOCKET,
        socket_type: socket_type
    }
}

function disconnectSocket(
    socket_type: string // "local" or "conference"
): Action {
    return{
        type: ACTIONS.DISCONNECT_SOCKET,
        socket_type: socket_type
    }
}

function setScreenshot(
    screenshot: any
    ): Action {
    return{
        type: ACTIONS.SET_SCREENSHOT,
        screenshot: screenshot
    }
}

function setImage(
    image: string,
    id: string
): Action {
    return{
        type: ACTIONS.SET_IMAGE,
        id: id,
        image: image
    }
}


const testingCallAC = {
    makePicture: makePicture,
    sendSourceImage: sendSourceImage,
    sendKpNormToAll: sendKpNormToAll,
    connectSocket: connectSocket,
    disconnectSocket: disconnectSocket,
    sendSourceToAll: sendSourceToAll,
    setScreenshot: setScreenshot,
    getKpNorm: getKpNorm,
    setImage: setImage
}

export default testingCallAC