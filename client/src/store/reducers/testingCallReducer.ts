import Action from "../../types/Action";
import TestingCallT from "../../types/testingCallTypes";
import ACTIONS from "../actionCreators/ACTIONS";
import initialstate from "../states/testingCall"

function testing_call(state: TestingCallT = initialstate, action: Action): TestingCallT {
    switch (action.type) {
        case ACTIONS.SEND_IMAGE:
            state.socket.emit('sendDrivingImage', {
                image: action.image,
                socketID: state.socket.id
            })
            return{
                ...state
            }
        case ACTIONS.SET_IMAGE:
            return{
                ...state,
                currentImage: 'data:image/jpeg;base64,' + action.image,
            }
        case ACTIONS.SEND_SOURCE_IMAGE:
            state.socket.emit('setSourceImage', {
                image: action.image,
                socketId: state.socket.id
            })
            return{
                ...state
            }
        case ACTIONS.SEND_KP_NORM_IMAGE:
            state.socket.emit('sendKpNorm', {
                kp_norm: action.kp_norm,
                socketId: state.socket.id,
            })
            return{
                ...state
            }
        case ACTIONS.CONNECT_SOCKET:
            console.log("Socket connected")
            return{
                ...state
            }
        case ACTIONS.DISCONNECT_SOCKET:
            console.log("Socket disconnected")
            return{
                ...state
            }
        case ACTIONS.RECEIVE_MESSAGE:
            console.log(action.payload)
            return{
                ...state
            }
    }
    return state;
}

export default testing_call