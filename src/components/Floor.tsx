import * as THREE from "three";
import React from "react";
import { random } from "maath";
import { useAppStore } from "../store/store";
import { randomInRange } from "../utils";
import { Instance, Instances, shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import Cave from "./Cave";

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

export const SeaweedMaterial = shaderMaterial(
  {
    time: 0,
    speed: 2,
    amp: 0.05,
    bendAmp: 0.1,
    bendFreq: 2.0,
  },
  /* vertex shader */
  `
  uniform float time;
  uniform float speed;
  uniform float amp;
  uniform float bendAmp;
  uniform float bendFreq;

  varying vec2 vUv;

  // simple hash for per-instance randomness
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // unique id per instance
    float id = float(gl_InstanceID);

    // --- WHOLE PLANT ROTATION (rigid sway)
    float angle = sin(time * speed + id) * amp;
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    pos.xy = rot * pos.xy;

    // --- PER-VERTEX BENDING (tip moves more than base)
    float tip = smoothstep(0.0, 1.0, vUv.y); // 0 at base, 1 at top
    pos.x += sin(time * speed + pos.y * bendFreq + id * 6.2831) * bendAmp * tip;

    // transform with instanceMatrix
    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * worldPos;
  }
  `,
  /* fragment shader */
  `
  varying vec2 vUv;

  void main() {
    // vertical gradient green
    vec3 bottom = vec3(0.0, 0.2, 0.0);
    vec3 top = vec3(0.0, 0.8, 0.0);
    vec3 color = mix(bottom, top, vUv.y);

    gl_FragColor = vec4(color, 1.0);
  }
  `
);

extend({ SeaweedMaterial });

const Floor = () => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  const bounds = useAppStore((state) => state.bounds);
  const totalPebbles = useAppStore((state) => state.totalPebbles);
  const totalSeaweed = useAppStore((state) => state.totalSeaweed);

  // Generate terrain heights using Simplex noise
  const geometry = React.useMemo(() => {
    const width = bounds.x * 10;
    const height = bounds.z * 5;
    const scale = 2;
    const segments = 256;
    const intensity = 0.2;

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

  const seaweedData = React.useMemo(() => {
    return new Array(totalSeaweed).fill(null).map(() => {
      const phase = Math.random() * Math.PI * 2;
      const rotation = new THREE.Euler(
        randomInRange(0.5, 0.8),
        randomInRange(0.5, 0.8),
        randomInRange(0.5, 0.8)
      );

      const x = randomInRange(-bounds.x, bounds.x);
      const z = randomInRange(-bounds.z, bounds.z);
      const y = -bounds.y - getHeightAt(x, z, geometry);

      const scale = new THREE.Vector3(
        randomInRange(0.1, 0.4),
        randomInRange(1, 2),
        1
      );

      const position = new THREE.Vector3(x, y, z);

      return {
        position,
        rotation,
        scale,
        phase,
      };
    });
  }, [bounds.x, bounds.y, bounds.z, geometry, totalSeaweed]);

  const seaweedMaterialRef = React.useRef<any>(null);

  useFrame((state) => {
    if (seaweedMaterialRef.current)
      seaweedMaterialRef.current.time = state.clock.elapsedTime;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, -bounds.y, 0 + (bounds.z * 5) / 2 - bounds.z]}
        receiveShadow
      >
        <meshStandardMaterial color="#8f4829" flatShading={false} />
      </mesh>

      <Instances
        limit={totalPebbles} // Optional: max amount of items (for calculating buffer size)
      >
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
      <Instances>
        <planeGeometry args={[1, 8, 1, 16]} />
        {/* //@ts-expect-error - TODO: figure out how to type the seaweedMaterial component  */}
        <seaweedMaterial ref={seaweedMaterialRef} side={THREE.FrontSide} />
        {seaweedData.map((data, index) => {
          return (
            // TODO: Figure out a fix for scaling and positioning so the blades don't clip through the ground
            <Instance key={index} position={data.position} scale={data.scale} />
          );
        })}
      </Instances>

      {/* <Cave /> */}
    </group>
  );
};

export default Floor;
