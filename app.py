from flask import Flask
from flask.templating import render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret1!'
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('connect')
def test_connect():
    print("SOCKET CONNECTED")


@socketio.on('detections')
def handle_my_custom_event(in_data, methods=['GET', 'POST']):
    data = in_data['data'][0]['expressions']


if __name__ == '__main__':
    socketio.run(app)
