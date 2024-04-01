import { connect } from "react-redux";
import WebcamImage from "./WebcamImage";
import Action from "../../types/Action";
import testingCallAC from "../../store/actionCreators/testingCallAC";

function mapStateToProps(
    state
) {
    return {
        users: [...state.testingCall.users.entries()]
    }
}

function mapDispatchToProps(dispatch: (action: Action) => void) {
    return{
        getKpNorm: (
            kp_norm: any
        ) => {
            dispatch(
                testingCallAC.getKpNorm(
                    kp_norm
                )
            )
        },
        set_screenshot: (
            screenshot: string
        ) => {
            dispatch(
                testingCallAC.setScreenshot(
                    screenshot
                )
            )
        }
    }
}

const WebcamImageContainer = connect(mapStateToProps, mapDispatchToProps)(WebcamImage)

export default WebcamImageContainer