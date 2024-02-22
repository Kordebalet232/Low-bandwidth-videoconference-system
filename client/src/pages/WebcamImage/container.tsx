import { connect } from "react-redux";
import { CombinedState } from "redux";
import TestingCallT from "../../types/testingCallTypes";
import WebcamImage from "./WebcamImage";
import Action from "../../types/Action";
import testingCallAC from "../../store/actionCreators/testingCallAC";

function mapStateToProps(
    state:  CombinedState<{
        testingCall: TestingCallT;
    }>
) {
    return {
        socket: state.testingCall.socket,
        image_to_show: state.testingCall.currentImage,
        kp_norm_sent: state.testingCall.kp_norm_sent
    }
}

function mapDispatchToProps(dispatch: (action: Action) => void) {
    return{
        setImage: (
            image: string
        ) => {
            dispatch(
                testingCallAC.setImage(
                    image
                )
            )
        },
        sendImage: (
            image: string
        ) => {
            dispatch(
                testingCallAC.sendImage(
                    image
                )
            )
        },
        setSourceImage: (
            image: string
        ) => {
            dispatch(
                testingCallAC.sendSourceImage(
                    image
                )
            )
        },
        send_kp_norm_image: (
            kp_norm: any
        ) => {
            dispatch(
                testingCallAC.send_kp_norm_image(
                    kp_norm
                )
            )
        }
    }
}

const WebcamImageContainer = connect(mapStateToProps, mapDispatchToProps)(WebcamImage)

export default WebcamImageContainer