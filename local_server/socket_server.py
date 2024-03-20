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

class Source_data:
    def __init__(self,source=None, kp_canonical=None, kp_source=None):
        self.source_image = source
        self.kp_canonical = kp_canonical
        self.kp_source = kp_source

class Coder:    
    def __init__(self):
        self.user_sources = {}
        self.driving_image = None
        self.config_path = "local_server\\config\\vox-256-spade.yaml"
        self.generator, self.kp_detector, self.he_estimator = load_checkpoints(config_path=self.config_path, checkpoint_path="local_server\\00000189-checkpoint.pth.tar", gen="spade", cpu=False)
        with open(self.config_path) as f:
            config = yaml.safe_load(f)
        self.estimate_jacobian = config['model_params']['common_params']['estimate_jacobian']

    def set_sourse_image(self, id, img, cpu=False):
        image = resize(img, (256, 256))[..., :3]
        with torch.no_grad():
            source = torch.tensor(image[np.newaxis].astype(np.float32)).permute(0, 3, 1, 2)
            if not cpu:
                source = source.cuda()
            kp_canonical = self.kp_detector(source)
            he_source = self.he_estimator(source)
            kp_source = keypoint_transformation(kp_canonical, he_source, self.estimate_jacobian)
        self.user_sources[id] = Source_data(source, kp_canonical, kp_source)

    def make_kp_norm(self, id, img, relative=True, adapt_movement_scale=True, cpu=False, free_view=False, yaw=0, pitch=0, roll=0):
        with torch.no_grad():
            kp_canonical = self.user_sources[id].kp_canonical
            kp_source = self.user_sources[id].kp_source

            driving_image = resize(img, (256, 256))[..., :3]
            driving = torch.tensor(np.array([driving_image])[np.newaxis].astype(np.float32)).permute(0, 4, 1, 2, 3)
            he_driving_initial = self.he_estimator(driving[:, :, 0])
            kp_driving_initial = keypoint_transformation(kp_canonical, he_driving_initial, self.estimate_jacobian)

            res = []

            for frame_idx in range(driving.shape[2]):
                driving_frame = driving[:, :, frame_idx]
                if not cpu:
                    driving_frame = driving_frame.cuda()
                he_driving = self.he_estimator(driving_frame)
                kp_driving = keypoint_transformation(kp_canonical, he_driving, self.estimate_jacobian, free_view=free_view, yaw=yaw, pitch=pitch, roll=roll)
                kp_norm = normalize_kp(kp_source=kp_source, kp_driving=kp_driving,
                                    kp_driving_initial=kp_driving_initial, use_relative_movement=relative,
                                    use_relative_jacobian=self.estimate_jacobian, adapt_movement_scale=adapt_movement_scale)
                res.append(kp_norm)
        return res

    def make_picture(self, id, kp_norm):
        with torch.no_grad():
            source = self.user_sources[id].source_image
            kp_source = self.user_sources[id].kp_source

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


@socketio.on('setSourceImage', namespace='/test') # устанавливаем новый source, как для себя, так и для собеседников
def handle_message(data):
    print('got source')
    image_data = data["image"].split(",")[1]
    id = data["id"]
    img = imread(io.BytesIO(base64.b64decode(image_data)))
    coder.set_sourse_image(id, img)
    print('setted with id ' + str(data['id']))

@socketio.on('makeKpNorm', namespace='/test') # Получаем запрос на преобразование изображения в вектор (только для собственных изображений)
def handle_message(data):
    print('kp_norm req')
    if "0" in coder.user_sources:
        image_data = data["image"].split(",")[1]
        img = imread(io.BytesIO(base64.b64decode(image_data)))
        id = data["id"]
        kp_norm = coder.make_kp_norm(id, img)
        to_send = kp_norm[0]["value"].cpu().numpy().tolist()
        emit("kpNorm", to_send, broadcast=True)
        print('kp_norm_sent')
    else:
        print('kp_norm skipped')

@socketio.on('makePicture', namespace='/test') # Получаем запрос на преобразование вектора в изобаржение
def handle_message(data):
    print('Pic req')
    kp_norm = data["kp_norm"]
    kp_norm = {"value": torch.tensor(kp_norm).cuda(), "jacobian": None}
    id = data["id"]
    picture = coder.make_picture(id, kp_norm)
    base64_picture = base64.b64encode(cv2.imencode('.jpeg', cv2.cvtColor(img_as_ubyte(picture), cv2.COLOR_BGR2RGB))[1]).decode('utf-8')
    emit("ResultImage", {"image": base64_picture, "id": data["id"]}, broadcast=True)
    print("result sent")



@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')



socketio.run(app)
            