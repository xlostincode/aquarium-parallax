import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useRef } from "react";

import * as THREE from "three";

const Lighting = () => {
  const directional1Ref = React.useRef(null);
  const directional1 = useControls("Directional Light 1", {
    intensity: { value: 2, min: 0, max: 5, step: 0.1 },
    color: "#ffffff",
    position: { value: [0, 20, 0], step: 0.1, max: 100, min: -100 },
  });

  //   useHelper(directional1Ref, THREE.DirectionalLightHelper);

  const directional3Ref = React.useRef(null);
  const directional3 = useControls("Directional Light 3", {
    intensity: { value: 2, min: 0, max: 5, step: 0.1 },
    color: "#ffffff",
    position: { value: [0, 15, 15], step: 0.1, max: 100, min: -100 },
  });

  // useHelper(directional3Ref, THREE.DirectionalLightHelper);

  useFrame((state) => {
    // Oscillates between -5 and +5
    if (directional3Ref.current) {
      directional3Ref.current.position.x =
        Math.sin(state.clock.elapsedTime * 0.01) * 25;
    }
  });

  const spot1Ref = useRef<THREE.SpotLight>(null!);

  const spot1 = useControls("Spot Light 1", {
    intensity: { value: 15, min: 0, max: 100, step: 0.1 },
    color: "#ffe900",
    position: { value: [20, 20, 0], step: 0.1, max: 100, min: -100 },
    angle: { value: 0.8, min: 0, max: Math.PI / 2, step: 0.1 },
    penumbra: { value: 1, min: 0, max: 50, step: 0.1 },
    distance: { value: 50, min: 0, max: 50, step: 0.1 },
    decay: { value: 0, min: 0, max: 50, step: 0.1 },
    power: { value: 50, min: 0, max: 50, step: 0.1 },
  });

  // useHelper(spot1Ref, THREE.SpotLightHelper);

  const spot2Ref = useRef<THREE.SpotLight>(null!);

  const spot2 = useControls("Spot Light 2", {
    intensity: { value: 15, min: 0, max: 100, step: 0.1 },
    color: "#ffe900",
    position: { value: [-20, 20, 0], step: 0.1, max: 100, min: -100 },
    angle: { value: 0.8, min: 0, max: Math.PI / 2, step: 0.1 },
    penumbra: { value: 1, min: 0, max: 50, step: 0.1 },
    distance: { value: 50, min: 0, max: 50, step: 0.1 },
    decay: { value: 0, min: 0, max: 50, step: 0.1 },
    power: { value: 50, min: 0, max: 50, step: 0.1 },
  });

  // useHelper(spot2Ref, THREE.SpotLightHelper);

  const videoTexture = React.useMemo(() => {
    const video = document.createElement("video");
    video.src = "/videos/caustic.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.playbackRate = 0.1;
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4); // 4x smaller & repeated
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return texture;
  }, []);

  useFrame(() => {
    if (spot1Ref.current) {
      spot1Ref.current.target.position.x = spot1Ref.current.position.x;
      spot1Ref.current.parent?.add(spot1Ref.current.target);

      spot1Ref.current.updateMatrixWorld();
    }
    if (spot2Ref.current) {
      spot2Ref.current.target.position.x = spot2Ref.current.position.x;
      spot2Ref.current.parent?.add(spot2Ref.current.target);

      spot2Ref.current.updateMatrixWorld();
    }
  });

  return (
    <group>
      <ambientLight intensity={Math.PI / 4} />
      <directionalLight
        ref={directional1Ref}
        {...directional1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-camera-near={0.1}
        shadow-camera-far={500}
      />
      <directionalLight ref={directional3Ref} {...directional3} />

      <spotLight ref={spot1Ref} {...spot1} map={videoTexture} layers={1} />
      <spotLight
        ref={spot2Ref}
        {...spot2}
        map={videoTexture}
        layers={1}
        rotation={[0, Math.PI / 4, 0]}
      />
    </group>
  );
};

export default Lighting;
