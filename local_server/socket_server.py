from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import base64
import io
from imageio import imread
from skimage.transform import resize
from demo import load_checkpoints, keypoint_transformation, normalize_kp
import yaml
import torch
import numpy as np
from sync_batchnorm import DataParallelWithCallback
import json
import cv2
from skimage import img_as_ubyte

app = Flask(__name__)
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")


class Coder:    
    def __init__(self):
        self.source_image = None
        self.driving_image = None
        self.config_path = "config/vox-256-spade.yaml"
        self.generator, self.kp_detector, self.he_estimator = load_checkpoints(config_path=self.config_path, checkpoint_path="00000189-checkpoint.pth.tar", gen="spade", cpu=False)
        with open(self.config_path) as f:
            config = yaml.safe_load(f)
        self.estimate_jacobian = config['model_params']['common_params']['estimate_jacobian']

    def set_sourse_image(self, img):
        self.source_image = resize(img, (256, 256))[..., :3]
    
    def set_driving_image(self, img):
        self.driving_image = resize(img, (256, 256))[..., :3]
    
    def make_kp_norm(self, relative=True, adapt_movement_scale=True, cpu=False, free_view=False, yaw=0, pitch=0, roll=0):
        with torch.no_grad():
            source = torch.tensor(self.source_image[np.newaxis].astype(np.float32)).permute(0, 3, 1, 2)
            if not cpu:
                source = source.cuda()
            driving = torch.tensor(np.array([self.driving_image])[np.newaxis].astype(np.float32)).permute(0, 4, 1, 2, 3)
            print(driving)
            kp_canonical = self.kp_detector(source)
            he_source = self.he_estimator(source)
            he_driving_initial = self.he_estimator(driving[:, :, 0])
            print(he_driving_initial)

            kp_source = keypoint_transformation(kp_canonical, he_source, self.estimate_jacobian)
            kp_driving_initial = keypoint_transformation(kp_canonical, he_driving_initial, self.estimate_jacobian)
            print(kp_driving_initial)
            # kp_driving_initial = keypoint_transformation(kp_canonical, he_driving_initial, free_view=free_view, yaw=yaw, pitch=pitch, roll=roll)
            res = []
            for frame_idx in range(driving.shape[2]):
                driving_frame = driving[:, :, frame_idx]
                if not cpu:
                    driving_frame = driving_frame.cuda()
                he_driving = self.he_estimator(driving_frame)
                print(he_driving)
                kp_driving = keypoint_transformation(kp_canonical, he_driving, self.estimate_jacobian, free_view=free_view, yaw=yaw, pitch=pitch, roll=roll)
                print(kp_driving)
                kp_norm = normalize_kp(kp_source=kp_source, kp_driving=kp_driving,
                                    kp_driving_initial=kp_driving_initial, use_relative_movement=relative,
                                    use_relative_jacobian=self.estimate_jacobian, adapt_movement_scale=adapt_movement_scale)
                res.append(kp_norm)
                # По идее передаем kp_norm на другой клиент, там кормим в генератор и получаем фрейм
        return res

    def make_picture(self, kp_norm, cpu=False):
        with torch.no_grad():
            source = torch.tensor(self.source_image[np.newaxis].astype(np.float32)).permute(0, 3, 1, 2)
            if not cpu:
                source = source.cuda()
            kp_canonical = self.kp_detector(source)
            he_source = self.he_estimator(source)

            kp_source = keypoint_transformation(kp_canonical, he_source, self.estimate_jacobian)
            out = self.generator(source, kp_source=kp_source, kp_driving=kp_norm)
            res = np.transpose(out['prediction'].data.cpu().numpy(), [0, 2, 3, 1])[0]
            return res


coder = Coder()




@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect', namespace='/test')
def test_connect():
    print(f'Hey! {request.sid} user just connected!')


@socketio.on('setSourceImage', namespace='/test')
def handle_message(data):
    image_data = data["image"].split(",")[1]
    img = imread(io.BytesIO(base64.b64decode(image_data)))
    coder.set_sourse_image(img)
    print("source setted")
    emit('ImageResponse', {"setted": True}, broadcast=True)

@socketio.on('sendDrivingImage', namespace='/test')
def handle_message(data):
    image_data = data["image"].split(",")[1]
    img = imread(io.BytesIO(base64.b64decode(image_data)))
    coder.set_driving_image(img)
    kp_norm = coder.make_kp_norm()
    to_send = kp_norm[0]["value"].cpu().numpy().tolist()
    emit("kpNormImage", to_send, broadcast=True)

@socketio.on('sendKpNorm', namespace='/test')
def handle_message(data):
    kp_norm = data["kp_norm"]
    kp_norm = {"value": torch.tensor(kp_norm).cuda(), "jacobian": None}
    picture = coder.make_picture(kp_norm)
    base64_picture = base64.b64encode(cv2.imencode('.jpeg', cv2.cvtColor(img_as_ubyte(picture), cv2.COLOR_BGR2RGB))[1]).decode('utf-8')
    emit("ResultImage", base64_picture, broadcast=True)
    print("result sent")


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')



socketio.run(app)
            