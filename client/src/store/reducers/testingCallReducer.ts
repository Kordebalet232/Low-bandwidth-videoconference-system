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
                kp_norm_sent: false
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
                kp_norm_sent: true
            })
            return{
                ...state
            }
    }
    return state;
}

export default testing_call