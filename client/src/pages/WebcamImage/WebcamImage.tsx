import { time } from "console";
import React, { useRef } from "react";
import Webcam from "react-webcam";
import { transform } from "typescript";


type Props = {
  users: any[];
  getKpNorm: (
    kp_norm: any,
  ) => void;
  set_screenshot: (
    webcamRef: any,
  ) => void;
}


function WebcamImage(props: Props) {
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 420,
    height: 420,
    facingMode: "user",
  };

// let timerId = setTimeout(function screen() {
//   if (webcamRef.current) {
//     const imageSrc =  webcamRef.current.getScreenshot();
//     if (imageSrc !== null) {
//       props.set_screenshot(imageSrc)
//       props.getKpNorm(imageSrc)
//       console.log("made screenshot")
//     }
//   }
//   console.log(timerId)
//   clearTimeout(timerId)
//   timerId = setTimeout(screen, 3000);
// }, 3000)

  return (
    <div className="Container">
          <Webcam
            audio={false}
            mirrored={true}
            height={400}
            width={400}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            id="webcam"
          />
          {props.users.map(([key, value]) => (
            <div>
              <img id={key} src={value} width="400" height="400" alt="screenshot" style={{transform: 'scale(-1,1)'}}/>
            </div>))}
    </div>
  );
}

export default WebcamImage;