import React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { FaceMesh } from "@mediapipe/face_mesh";

const NUM_SPHERES = 30;

const PARAMS = {
  bounds: { x: 20, y: 10, z: 5 },
};

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

  useFrame(() => {
    spheres.forEach((sphere, i) => {
      sphere.position.add(sphere.velocity);

      if (Math.abs(sphere.position.x) > PARAMS.bounds.x)
        sphere.velocity.x *= -1;
      if (Math.abs(sphere.position.y) > PARAMS.bounds.y)
        sphere.velocity.y *= -1;
      if (Math.abs(sphere.position.z) > PARAMS.bounds.z)
        sphere.velocity.z *= -1;

      if (refs.current[i]) {
        refs.current[i].position.copy(sphere.position);
      }
    });
  });

  return (
    <>
      {spheres.map((sphere, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={sphere.color} />
        </mesh>
      ))}
    </>
  );
}

function Tank() {
  const wallThickness = 1;
  const wallThicknessHalf = wallThickness / 2;
  const wallExtraWidth = 2;

  const roughnessMap = useLoader(
    THREE.TextureLoader,
    "/environment/green_metal_rust_rough_2k.png"
  );
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2); // optional tiling

  const meshPhysicalMaterial = React.useMemo(() => {
    return (
      <meshPhysicalMaterial
        transmission={1}
        thickness={2.5}
        ior={1.1}
        roughness={0.5}
        roughnessMap={roughnessMap}
        side={THREE.FrontSide}
      />
    );
  }, [roughnessMap]);

  return (
    <group>
      {/* Back wall */}
      <mesh
        rotation={[0, Math.PI, 0]}
        position={[0, 0, -PARAMS.bounds.z - wallThicknessHalf]}
      >
        <boxGeometry
          args={[
            PARAMS.bounds.x * 2 + wallExtraWidth,
            PARAMS.bounds.y * 2,
            wallThickness,
          ]}
        />
        {meshPhysicalMaterial}
      </mesh>

      {/* Left wall */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[PARAMS.bounds.x + wallThicknessHalf, 0, 0]}
      >
        <boxGeometry
          args={[PARAMS.bounds.z * 2, PARAMS.bounds.y * 2, wallThickness]}
        />
        {meshPhysicalMaterial}
      </mesh>

      {/* Right wall */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[-PARAMS.bounds.x - wallThicknessHalf, 0, 0]}
      >
        <boxGeometry
          args={[PARAMS.bounds.z * 2, PARAMS.bounds.y * 2, wallThickness]}
        />
        {meshPhysicalMaterial}
      </mesh>

      {/* Bottom */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -PARAMS.bounds.y - wallThicknessHalf, 0]}
      >
        <boxGeometry
          args={[
            PARAMS.bounds.x * 2 + wallExtraWidth,
            PARAMS.bounds.z * 2,
            wallThickness,
          ]}
        />
        {meshPhysicalMaterial}
      </mesh>
    </group>
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
        {/* <OrbitControls /> */}
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[0, 0, PARAMS.bounds.z * 1.75]}
        />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={1} />
        <CameraParallax headPosRef={headPosRef} />
        <Environment files="/environment/horn-koppe_spring_2k.hdr" background />
        {/* <Tank /> */}
        <RandomSpheres />

        {/* Helpers */}
        <axesHelper />
      </Canvas>
    </main>
  );
}

export default App;
