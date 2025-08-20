import React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { FaceMesh } from "@mediapipe/face_mesh";
import SchoolOfFish from "./components/SchoolOfFish";
import { useAppStore } from "./store/store";

function BoundingBox({
  bounds,
}: {
  bounds: { x: number; y: number; z: number };
}) {
  return (
    <mesh>
      <boxGeometry args={[bounds.x * 2, bounds.y * 2, bounds.z * 2]} />
      <meshBasicMaterial color="red" wireframe />
    </mesh>
  );
}

function CameraParallax({
  headPosRef,
}: {
  headPosRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  const target = React.useRef(new THREE.Vector3());

  useFrame(() => {
    const nx = headPosRef.current.x;
    const ny = headPosRef.current.y;

    // Smooth the input
    const smoothedHeadX = 0.1 * nx + 0.9 * headPosRef.current.x;
    const smoothedHeadY = 0.1 * ny + 0.9 * headPosRef.current.y;

    const px = (smoothedHeadX - 0.5) * 2;
    const py = (smoothedHeadY - 0.5) * 2;

    const moveX = -px * 5;
    const moveY = py * 5;

    target.current.set(moveX, -moveY, camera.position.z);
    camera.position.lerp(target.current, 0.1);

    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Tank() {
  const bounds = useAppStore((state) => state.bounds);

  const wallThickness = 1;
  const wallThicknessHalf = wallThickness / 2;

  const normalMap = useLoader(
    THREE.TextureLoader,
    "/environment/WaterDropletsMixedBubbled001_NRM_2K.jpg"
  );
  normalMap.colorSpace = THREE.LinearSRGBColorSpace;
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 2);

  // const uvTexture = useLoader(
  //   THREE.TextureLoader,
  //   "environment/uv_grid_opengl.jpg"
  // );

  return (
    <group>
      {/* Back wall */}
      <mesh
        rotation={[0, Math.PI, 0]}
        position={[
          0,
          (bounds.y * 5) / 2 - bounds.y,
          -bounds.z - wallThicknessHalf,
        ]}
      >
        <boxGeometry args={[bounds.x * 10, bounds.y * 5, wallThickness]} />

        <meshPhysicalMaterial
          // map={uvTexture}
          normalMap={normalMap}
          roughness={0.5}
          transmission={1}
          thickness={2.5}
          ior={1.1}
          side={THREE.FrontSide}
          color={"#c3d0d6"}
        />
      </mesh>
      <BoundingBox bounds={bounds} />

      {/* Bottom */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          0,
          -bounds.y - wallThicknessHalf,
          0 + (bounds.z * 5) / 2 - bounds.z,
        ]}
      >
        <boxGeometry args={[bounds.x * 10, bounds.z * 5, wallThickness]} />
        <meshPhysicalMaterial
          roughness={0.5}
          transmission={1}
          thickness={2.5}
          ior={1.1}
          side={THREE.FrontSide}
          color={"#c3d0d6"}
        />
      </mesh>
    </group>
  );
}

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
          makeDefault
          position={[0, 0, bounds.z * 1.9]}
        />
        <ambientLight intensity={Math.PI / 2} />
        {/* <CameraParallax headPosRef={headPosRef} /> */}
        <Environment files="/environment/horn-koppe_spring_2k.hdr" background />
        <Tank />
        <SchoolOfFish />
        {/* Helpers */}
        <axesHelper />
      </Canvas>
    </main>
  );
}

export default App;
