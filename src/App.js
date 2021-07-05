
import {useState, useEffect, useRef} from 'react' ;
import './App.css';
import * as faceapi from 'face-api.js';

function App() {
  const videoHeight = 480;
  const videowidht = 640;
  const [initializing, setinitializing] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  
  useEffect (() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';      

      setinitializing(true);
      Promise.all([        
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]).then(startVideo);
    }
    loadModels();
  }, [])

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({
      video:  {
        width: videowidht,
        height: videoHeight,
      }
    },).then(
      function (mediaStream) { 
        videoRef.current.srcObject = mediaStream;
        videoRef.onloadedmetadata = function(e){
          videoRef.play();
        }
       }
    ).catch(function(error){

    })
  }

  const handleVideoOnPlay = () => {
    setInterval(async() =>{
      if(initializing) {
        setinitializing(false);
      }
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
      const displaySize = {
        width: videowidht,
        height: videoHeight
    }
    faceapi.matchDimensions(canvasRef.current, displaySize);
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    const resizeDetections = faceapi.resizeResults(detections, displaySize);
    canvasRef.current.getContect('2d').clearReact(0, 0, videowidht, videoHeight);
    faceapi.draw.drawDetections(canvasRef.current, resizeDetections);
    faceapi.draw.drawFaceLandmarks(canvasRef.current, resizeDetections);
    faceapi.draw.drawFaceExpressions(canvasRef.current, resizeDetections);
    console.log(detections)

    },110)
  }

  return (
    <div className="App">
      <span>{initializing ? 'initializing' : 'Ready'}</span>
      <video ref={videoRef} autoPlay muted height={videoHeight} width={videowidht} onPlay={handleVideoOnPlay}/>
      <canvas ref={canvasRef} />

    </div>
  );
}

export default App;
