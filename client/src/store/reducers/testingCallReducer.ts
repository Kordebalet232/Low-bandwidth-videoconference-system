import Action from "../../types/Action";
import TestingCallT from "../../types/testingCallTypes";
import ACTIONS from "../actionCreators/ACTIONS";
import initialstate from "../states/testingCall"




function Testing_call(state: TestingCallT = initialstate, action: Action): TestingCallT {


    switch (action.type) {
        case ACTIONS.CONNECT_SOCKET:
            switch (action.socket_type) {
                case "conference":
                    return{
                        ...state,
                        conference_server_connection: true
                    }
                case "local":
                    return{
                        ...state,
                        local_server_connection: true
                    }
            }
            return{
                ...state
            }
        case ACTIONS.DISCONNECT_SOCKET:
            switch (action.socket_type) {
                case "conference":
                    return{
                        ...state,
                        conference_server_connection: false
                    }
                case "local":
                    return{
                        ...state,
                        local_server_connection: false
                    }
            }
            return{
                ...state
            }       
        case ACTIONS.SET_SCREENSHOT:
            return{
                ...state,
                screenshot: action.screenshot
            }
        case ACTIONS.SET_IMAGE:
            state.users.set(action.id, 'data:image/jpeg;base64,' + action.image)
            return{
                ...state,
                currentImage: 'data:image/jpeg;base64,' + action.image
            }
        /////////////// LOCAL SERVER REDUCER START ///////////////
        case ACTIONS.SEND_SOURCE_IMAGE: // Пробрасываем в локальный сервер source изображение
            state.users.set(action.id, action.image)
            if (state.local_server_connection){
                state.socket.emit('setSourceImage', {
                    id: action.id,
                    image: action.image
                })
            }
            return{
                ...state
            }
        case ACTIONS.MAKE_PICTURE: // Просим локальный сервер по вектору построить изображение
            if (state.local_server_connection){
                state.socket.emit('makePicture', {
                    id: action.id,
                    kp_norm: action.kp_norm,
                })
            }
            return{
                ...state
            }
        case ACTIONS.GET_KP_NORM: // Просим локальный сервер преобразовать изображение (свое) в вектор
            if (state.local_server_connection){
                state.socket.emit("makeKpNorm", {
                    id: "0",
                    image: action.image
                })
            }
            return {
                ...state
            }
        /////////////// LOCAL SERVER REDUCER END ///////////////     
        /////////////// CONFERENCE REDUCER START ///////////////
        case ACTIONS.SEND_SOURCE_TO_ALL: // Посылаем новый source (свой) всем клиентам
            if (state.screenshot !== null && state.conference_server_connection) {
                state.socket_conference.emit('newSourceImage', {
                    image: state.screenshot,
                    id: state.socket_conference.id
                })
            }
            return{
                ...state
            }
        case ACTIONS.SEND_KP_NORM_IMAGE_TO_ALL:
            if (state.conference_server_connection){
                state.socket_conference.emit('kpNorm', {
                    kp_norm: action.kp_norm,
                    id: state.socket_conference.id
                })
            }
            return{
                ...state
            }
        /////////////// CONFERENCE REDUCER END ///////////////
    }
    return state;
}

export default Testing_call