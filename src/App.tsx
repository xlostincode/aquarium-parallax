import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { FaceMesh } from "@mediapipe/face_mesh";
import SchoolOfFish from "./components/SchoolOfFish";
import { useAppStore } from "./store/store";
import Floor from "./components/Floor";
import Tank from "./components/Tank";
import { FISH_IDS } from "./const/fish";
import Background from "./components/Background";
import CameraParallax from "./components/CameraParallax";

function App() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const cameraRef = React.useRef<any>(null);
  const headPosRef = React.useRef({ x: 0.5, y: 0.5 });

  const bounds = useAppStore((state) => state.bounds);

  React.useEffect(() => {
    const initCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      if (videoRef.current) {
        // videoRef.current.srcObject = stream;
        // videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }

      const faceMeshSolution = new FaceMesh({
        locateFile: (file) => `/mediapipe/${file}`,
      });
      faceMeshSolution.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMeshSolution.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
          const nose = results.multiFaceLandmarks[0][1]; // Nose tip
          headPosRef.current.x = nose.x; // normalized 0..1
          headPosRef.current.y = nose.y;
        }
      });

      const video = videoRef.current!;
      const sendFrame = async () => {
        if (video.readyState >= 2) {
          await faceMeshSolution.send({ image: video });
        }
        requestAnimationFrame(sendFrame);
      };
      sendFrame();
    };

    initCamera();
  }, []);

  return (
    <main className="w-full h-screen">
      <video
        ref={videoRef}
        className="hidden w-96 aspect-video z-10 top-0 left-0"
      />
      <Canvas className="bg-slate-950">
        <OrbitControls />
        <PerspectiveCamera
          ref={cameraRef}
          position={[0, -bounds.y * 0.5, bounds.z * 2]}
          rotation={[-Math.PI / 16, 0, 0]}
          makeDefault
        />
        <ambientLight intensity={Math.PI / 2} />
        {/* <CameraParallax headPosRef={headPosRef} /> */}
        <Background />
        <Tank />
        <SchoolOfFish fishId={FISH_IDS.GOLD_FISH} />
        <SchoolOfFish fishId={FISH_IDS.KOI} />
        <SchoolOfFish fishId={FISH_IDS.BETTA} />
        <SchoolOfFish fishId={FISH_IDS.BLUE_TANG} />
        <SchoolOfFish fishId={FISH_IDS.MANDARIN_FISH} />
        <Floor />
        {/* Helpers */}
        {/* <axesHelper /> */}
      </Canvas>
    </main>
  );
}

export default App;
