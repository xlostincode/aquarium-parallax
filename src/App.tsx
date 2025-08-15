import React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { FaceMesh } from "@mediapipe/face_mesh";

const NUM_SPHERES = 20;

function CameraParallax({
  headPosRef,
}: {
  headPosRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  const target = React.useRef(new THREE.Vector3());

  useFrame(() => {
    const nx = headPosRef.current.x; // already normalized [0, 1]
    const ny = headPosRef.current.y;

    // Shift range from [0, 1] to [-0.5, 0.5]
    const px = (nx - 0.5) * 2;
    const py = (ny - 0.5) * 2;

    // Scale movement
    const moveX = -px * 5; // adjust multiplier for effect strength
    const moveY = py * 5;

    // Smooth target position
    target.current.set(moveX, -moveY, camera.position.z);
    camera.position.lerp(target.current, 0.5);

    // Always look at scene center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function RandomSpheres() {
  const spheres = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < NUM_SPHERES; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      });
    }
    return temp;
  }, []);

  const refs = React.useRef<any[]>([]);
  const bounds = { x: 20, y: 5, z: 5 };

  useFrame(() => {
    spheres.forEach((sphere, i) => {
      sphere.position.add(sphere.velocity);

      if (Math.abs(sphere.position.x) > bounds.x) sphere.velocity.x *= -1;
      if (Math.abs(sphere.position.y) > bounds.y) sphere.velocity.y *= -1;
      if (Math.abs(sphere.position.z) > bounds.z) sphere.velocity.z *= -1;

      if (refs.current[i]) {
        refs.current[i].position.copy(sphere.position);
      }
    });
  });

  return (
    <>
      <mesh>
        <boxGeometry args={[bounds.x * 2, bounds.y * 2, bounds.z * 2]} />
        <meshBasicMaterial color="white" wireframe opacity={0.3} transparent />
      </mesh>
      {spheres.map((sphere, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={sphere.color} />
        </mesh>
      ))}
    </>
  );
}

function App() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const cameraRef = React.useRef<any>(null);
  const headPosRef = React.useRef({ x: 0.5, y: 0.5 });

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
        className="fixed w-96 aspect-video z-10 top-0 left-0"
      />
      <Canvas className="bg-slate-950">
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 15]} />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={1} />
        <RandomSpheres />
        <CameraParallax headPosRef={headPosRef} />
      </Canvas>
    </main>
  );
}

export default App;
