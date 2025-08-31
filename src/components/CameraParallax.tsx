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
  const smoothed = React.useRef({ x: 0, y: 0 });

  useFrame(() => {
    const targetX = headPosition.current?.x ?? 0.5;
    const targetY = headPosition.current?.y ?? 0.5;

    const alpha = 0.5;
    smoothed.current.x += (targetX - smoothed.current.x) * alpha;
    smoothed.current.y += (targetY - smoothed.current.y) * alpha;

    const px = (smoothed.current.x - 0.5) * 2;
    const py = (smoothed.current.y - 0.5) * 2;

    const moveX = -px * 8;
    const moveY = py * 8;

    target.current.set(moveX, -moveY, camera.position.z);
    camera.position.lerp(target.current, 0.1);

    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraParallax;
