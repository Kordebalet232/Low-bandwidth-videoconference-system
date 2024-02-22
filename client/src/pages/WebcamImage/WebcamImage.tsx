import React, { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Socket } from "socket.io-client";


type Props = {
  socket: Socket;
  image_to_show: string | null;
  kp_norm_sent: Boolean;
  setImage: (
    image: string,
  ) => void;
  sendImage: (
    image: string,
  ) => void;
  setSourceImage: (
    image: string,
  ) => void;
  send_kp_norm_image: (
    kp_norm: any,
  ) => void;
}


function WebcamImage(props: Props) {
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 420,
    height: 420,
    facingMode: "user",
  };

  const start_driving = useCallback(() => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        props.sendImage(imageSrc);
    }
  }, [webcamRef]);

  const set_source_image = useCallback(() => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc)
        props.setSourceImage(imageSrc);
    }
  }, [webcamRef]);


  useEffect(() => {
    props.socket.on('ImageResponse', (data) => {
      console.log(data)
    })
    props.socket.on('kpNormImage', (data) => {
      console.log(data)
      if (!props.kp_norm_sent){
        props.send_kp_norm_image(data)
        console.log("kp_norm_sent")
      }
    })
    props.socket.on("ResultImage", (data) => {
      console.log(data)
      props.setImage(data)
      console.log("image settet")
    })
  }, [props.socket])

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
          />
          <button onClick={set_source_image}>Set Source</button>
          <button onClick={start_driving}>Start driving</button>
          <div>
            <img src={props.image_to_show === null ? require("../../images/placeholder.jpg") : props.image_to_show} width="400" height="400" alt="screenshot" />
          </div>
    </div>
  );
}

export default WebcamImage;