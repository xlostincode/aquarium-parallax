import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import React, { useRef } from "react";

import * as THREE from "three";

const Lighting = () => {
  const directional1Ref = React.useRef(null);
  const directional1 = useControls("Directional Light 1", {
    intensity: { value: 2, min: 0, max: 5, step: 0.1 },
    color: "#ffffff",
    position: { value: [0, 100, 0], step: 0.1, max: 100, min: -100 },
  });

  //   useHelper(directional1Ref, THREE.DirectionalLightHelper);

  const directional2Ref = React.useRef(null);
  const directional2 = useControls("Directional Light 2", {
    intensity: { value: 5, min: 0, max: 5, step: 0.1 },
    color: "#ffffff",
    position: { value: [0, 100, 0], step: 0.1, max: 100, min: -100 },
  });

  //   useHelper(directional2Ref, THREE.DirectionalLightHelper);

  const directional3Ref = React.useRef(null);
  const directional3 = useControls("Directional Light 3", {
    intensity: { value: 2, min: 0, max: 5, step: 0.1 },
    color: "#ffffff",
    position: { value: [0, 15, 15], step: 0.1, max: 100, min: -100 },
  });

  //   useHelper(directional3Ref, THREE.DirectionalLightHelper);

  useFrame((state) => {
    // Oscillates between -5 and +5
    if (directional3Ref.current) {
      directional3Ref.current.position.x =
        Math.sin(state.clock.elapsedTime * 0.001) * 25;

      //   const t = (state.clock.elapsedTime * 0.1) % 1; // cycles 0 → 1
      //   const color = new THREE.Color();
      //   color.setHSL(t, 1, 0.5); // hue cycles, full saturation, medium lightness
      //   directional3Ref.current.color.copy(color);
    }
  });

  return (
    <group>
      <ambientLight intensity={Math.PI / 2} />
      <directionalLight ref={directional1Ref} {...directional1} castShadow />
      {/* <directionalLight ref={directional2Ref} {...directional2} castShadow /> */}
      <directionalLight ref={directional3Ref} {...directional3} castShadow />
    </group>
  );
};

export default Lighting;
