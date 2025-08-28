import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import SchoolOfFish from "./components/SchoolOfFish";
import { useAppStore } from "./store/store";
import Floor from "./components/Floor";
import Tank from "./components/Tank";
import { FISH_IDS } from "./const/fish";
import Background from "./components/Background";
import CameraParallax from "./components/CameraParallax";
import Lighting from "./components/Lighting";
import { Leva } from "leva";

import { type PerspectiveCamera as TPerspectiveCamera } from "three";
import HeadTracking from "./components/HeadTracking";
import { classNames } from "./utils";
import Links from "./components/Links";
import { Perf } from "r3f-perf";

const useCameraAccess = () => {
  const [hasCamera, setHasCamera] = React.useState(false);

  React.useEffect(() => {
    navigator.permissions.query({ name: "camera" }).then((status) => {
      setHasCamera(status.state === "granted");
    });
  }, []);

  const requestCameraAccess = React.useCallback(async () => {
    const { state } = await navigator.permissions.query({ name: "camera" });

    if (state === "granted") {
      setHasCamera(true);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamera(true);
    } catch (error) {
      console.error("Camera access denied or error:", error);
      setHasCamera(false);
    }
  }, []);

  return { hasCamera, requestCameraAccess };
};

function App() {
  const cameraRef = React.useRef<TPerspectiveCamera>(null);
  const headPosition = React.useRef({ x: 0.5, y: 0.5 });

  const bounds = useAppStore((state) => state.bounds);
  const experienceStarted = useAppStore((state) => state.experienceStarted);
  const startExperience = useAppStore((state) => state.startExperience);

  const { hasCamera, requestCameraAccess } = useCameraAccess();

  return (
    <main className="w-full h-screen">
      <Leva hidden />
      <HeadTracking hasCamera={hasCamera} headPosition={headPosition} />
      {!experienceStarted && (
        <div className="fixed poppins-regular text-stone-50 h-screen w-full z-10 top-0 left-0 flex flex-col items-center backdrop-blur-md bg-stone-900/25">
          <div className="flex flex-col items-center gap-4 max-w-2xl">
            <h1 className="pt-8 poppins-bold-italic flex flex-col text-4xl">
              Aquarium Parallax
            </h1>
            <p className="text-center text-xl">
              Explore a peaceful underwater world right on your screen. With
              your camera and head tracking, the aquarium responds to your
              movements, making the experience feel more immersive.
            </p>

            <p className="text-center text-xl">
              For the best experience, use a desktop with your camera enabled.
              If you'd prefer not to use the camera, the aquarium still serves
              as a static, calming display.
            </p>

            <button
              onClick={requestCameraAccess}
              className={classNames(
                "poppins-medium p-4 rounded-md bg-stone-800 mt-8",
                hasCamera ? "border-2 border-green-500" : "bg-stone-500"
              )}
              disabled={hasCamera}
            >
              {hasCamera ? "Camera access granted ✅" : "Allow camera access"}
            </button>

            <button
              onClick={() => startExperience()}
              className={classNames(
                "text-stone-900 poppins-medium p-4 rounded-md",
                hasCamera ? "bg-green-500" : "bg-orange-500"
              )}
            >
              {hasCamera ? "Start" : "Start without camera"}
            </button>
          </div>
        </div>
      )}

      <Canvas className="bg-slate-950" shadows>
        <OrbitControls />
        <PerspectiveCamera
          ref={(camera) => {
            if (camera) {
              camera.layers.enable(0);
              camera.layers.enable(1);
            }

            cameraRef.current = camera;
          }}
          position={[0, -bounds.y * 0.5, bounds.z * 2]}
          rotation={[-Math.PI / 16, 0, 0]}
          makeDefault
        />
        <Lighting />
        {/* <CameraParallax headPosition={headPosition} /> */}
        <Background />
        <Tank />
        {experienceStarted && (
          <>
            <SchoolOfFish fishId={FISH_IDS.GOLD_FISH} />
            <SchoolOfFish fishId={FISH_IDS.KOI} />
            <SchoolOfFish fishId={FISH_IDS.BETTA} />
            <SchoolOfFish fishId={FISH_IDS.BLUE_TANG} />
            <SchoolOfFish fishId={FISH_IDS.MANDARIN_FISH} />
          </>
        )}
        <Floor />
        {/* Helpers */}
        <axesHelper />
        <Perf />
      </Canvas>

      <Links />
    </main>
  );
}

export default App;
