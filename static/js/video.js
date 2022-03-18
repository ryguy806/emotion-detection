const video = document.getElementById("video");
const h3 = document.getElementById("expression");

const path = window.location.pathname;

var socket = io.connect(path);
socket.on("connect", function () {
  console.log("SOCKET CONNECTED");
});

Promise.all([
  faceapi.loadFaceLandmarkModel("static/models/"),
  faceapi.loadFaceRecognitionModel("static/models/"),
  faceapi.loadTinyFaceDetectorModel("static/models/"),
  faceapi.loadFaceLandmarkModel("static/models/"),
  faceapi.loadFaceLandmarkTinyModel("static/models/"),
  faceapi.loadFaceRecognitionModel("static/models/"),
  faceapi.loadFaceExpressionModel("static/models/"),
])
  .then(startVideo)
  .catch((err) => console.error(err));

function startVideo() {
  console.log("access");
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => console.error(err));
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    socket.emit("detections", {
      data: detections,
    });

    expressions = detections[0]["expressions"];

    expression = Object.keys(expressions).reduce((a, b) =>
      expressions[a] > expressions[b] ? a : b
    );

    h3.innerText = expression;

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  }, 100);
});
