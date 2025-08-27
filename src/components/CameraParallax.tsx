import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
const CameraParallax = ({
  headPosition,
}: {
  headPosition: React.RefObject<{ x: number; y: number }>;
}) => {
  const { camera } = useThree();
  const target = React.useRef(new THREE.Vector3());

  useFrame(() => {
    const nx = headPosition.current.x;
    const ny = headPosition.current.y;

    // Smooth the input
    const smoothedHeadX = 0.1 * nx + 0.9 * headPosition.current.x;
    const smoothedHeadY = 0.1 * ny + 0.9 * headPosition.current.y;

    const px = (smoothedHeadX - 0.5) * 2;
    const py = (smoothedHeadY - 0.5) * 2;

    const moveX = -px * 5;
    const moveY = py * 5;

    target.current.set(moveX, -moveY, camera.position.z);
    camera.position.lerp(target.current, 0.1);

    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraParallax;
