import * as THREE from "three";
import React from "react";
import { random } from "maath";
import { useAppStore } from "../store/store";
import { randomInRange } from "../utils";
import { Instance, Instances } from "@react-three/drei";
import Coral from "./Coral";

function getHeightAt(x: number, z: number, geometry: THREE.PlaneGeometry) {
  const pos = geometry.attributes.position;
  let closestY = 0;
  let minDist = Infinity;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vz = pos.getZ(i);
    const dist = (vx - x) ** 2 + (vz - z) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closestY = pos.getY(i);
    }
  }

  return closestY;
}

const Floor = () => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  const bounds = useAppStore((state) => state.bounds);
  const totalPebbles = useAppStore((state) => state.totalPebbles);

  // Generate terrain heights using Simplex noise
  const geometry = React.useMemo(() => {
    const width = bounds.x * 10;
    const height = bounds.z * 5;
    const scale = 2;
    const segments = 256;
    const intensity = 0.4;

    const geom = new THREE.PlaneGeometry(width, height, segments, segments);

    geom.rotateX(-Math.PI / 2); // Make plane horizontal

    for (let i = 0; i < geom.attributes.position.count; i++) {
      const x = geom.attributes.position.getX(i);
      const z = geom.attributes.position.getZ(i);

      // Noise-based height
      const y = random.noise.simplex2(x / scale, z / scale) * intensity;
      geom.attributes.position.setY(i, y);
    }

    geom.computeVertexNormals(); // smooth shading
    return geom;
  }, [bounds]);

  const pebbleData = React.useMemo(() => {
    return new Array(totalPebbles).fill(null).map(() => {
      const radius = randomInRange(1, 2);
      const scale = randomInRange(0.5, 0.8);

      const rotation = new THREE.Euler(
        randomInRange(0.5, 0.8),
        randomInRange(0.5, 0.8),
        randomInRange(0.5, 0.8)
      );

      const x = randomInRange(-bounds.x, bounds.x);
      const z = randomInRange(-bounds.z, bounds.z);
      const y = -bounds.y - getHeightAt(x, z, geometry);

      const position = new THREE.Vector3(x, y, z);

      return {
        radius,
        position,
        rotation,
        scale,
      };
    });
  }, [bounds.x, bounds.y, bounds.z, geometry, totalPebbles]);

  return (
    <group layers={3}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, -bounds.y, 0 + (bounds.z * 5) / 2 - bounds.z]}
        receiveShadow
      >
        <meshStandardMaterial color="#8f4829" flatShading={false} />
      </mesh>

      <Instances limit={totalPebbles} receiveShadow>
        <dodecahedronGeometry />
        <meshStandardMaterial />
        {pebbleData.map((data, index) => {
          return (
            <Instance
              key={index}
              position={data.position}
              rotation={data.rotation}
              scale={data.scale}
              color={"#636262"}
            />
          );
        })}
      </Instances>
      {/* args={[1, 8, 1, 16]} */}

      <Coral />
    </group>
  );
};

export default Floor;
