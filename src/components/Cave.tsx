import {
  Instance,
  Instances,
  shaderMaterial,
  useGLTF,
} from "@react-three/drei";
import React from "react";
import * as THREE from "three";
import { useAppStore } from "../store/store";
import { extend, useFrame } from "@react-three/fiber";
import { randomInRange } from "../utils";

// const BubbleMaterial = shaderMaterial(
//   {
//     uTime: 0,
//   },
//   // Vertex Shader
//   `
//     precision mediump float;
//     attribute vec3 aOffset;
//     attribute float aSpeed;
//     attribute float aPhase;
//     attribute float aWiggleAmp;
//     attribute float aWiggleFreq;

//     uniform float uTime;

//     void main() {
//       vec3 pos = position;

//       float t = uTime * aSpeed + aPhase;

//       // Move upward
//       float yOffset = mod(aOffset.y + uTime * aSpeed, 10.0) - 5.0;
//       float xWiggle = sin(t * aWiggleFreq) * aWiggleAmp;
//       float zWiggle = cos(t * aWiggleFreq) * aWiggleAmp;

//       vec3 transformed = vec3(aOffset.x + xWiggle, yOffset, aOffset.z + zWiggle) + pos;

//       gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
//     }
//   `,
//   // Fragment Shader
//   `
//     precision mediump float;

//     void main() {
//       float d = length(gl_PointCoord - vec2(0.5));
//       if (d > 0.5) discard;

//       gl_FragColor = vec4(0.6, 0.8, 1.0, 1); // Light blue and semi-transparent
//     }
//   `
// );

// extend({ BubbleMaterial });

// function BubbleShaderBubbles() {
//   const ref = React.useRef();
//   const COUNT = 300;

//   // Generate random positions, speeds, phases, and wiggle factors
//   const [offsets, speeds, phases, wiggleFreqs, wiggleAmps] =
//     React.useMemo(() => {
//       const offsets = [];
//       const speeds = [];
//       const phases = [];
//       const wiggleFreqs = [];
//       const wiggleAmps = [];
//       for (let i = 0; i < COUNT; i++) {
//         offsets.push(
//           Math.random() - 0.5,
//           Math.random() - 0.5,
//           Math.random() - 0.5
//         );
//         speeds.push(Math.random() * 0.5 + 0.1);
//         phases.push(Math.random() * Math.PI * 2);
//         wiggleFreqs.push(Math.random() * 2 + 0.5);
//         wiggleAmps.push(Math.random() * 0.2 + 0.05);
//       }

//       return [
//         new Float32Array(offsets),
//         new Float32Array(speeds),
//         new Float32Array(phases),
//         new Float32Array(wiggleFreqs),
//         new Float32Array(wiggleAmps),
//       ];
//     }, []);

//   // Update the uniform time on each frame
//   useFrame(({ clock }) => {
//     if (ref.current) {
//       ref.current.uTime = clock.getElapsedTime();
//     }
//   });

//   return (
//     <Instances ref={ref} limit={COUNT} position={[0, 0, 0]}>
//       <sphereGeometry args={[1, 8, 8]}>
//         {/* Attach buffer attributes */}
//         <instancedBufferAttribute
//           attach="attributes-aOffset"
//           args={[offsets, 3]}
//         />
//         <instancedBufferAttribute
//           attach="attributes-aSpeed"
//           args={[speeds, 1]}
//         />
//         <instancedBufferAttribute
//           attach="attributes-aPhase"
//           args={[phases, 1]}
//         />
//         <instancedBufferAttribute
//           attach="attributes-aWiggleFreq"
//           args={[wiggleFreqs, 1]}
//         />
//         <instancedBufferAttribute
//           attach="attributes-aWiggleAmp"
//           args={[wiggleAmps, 1]}
//         />
//       </sphereGeometry>
//       <meshBasicMaterial />
//       {/* <bubbleMaterial transparent depthWrite={false} /> */}
//       {/* Instances will automatically handle the placement of each bubble */}
//       {new Array(COUNT).fill(1).map((_, i) => (
//         <Instance key={i} />
//       ))}
//     </Instances>
//   );
// }

const BubbleMaterial = shaderMaterial(
  { uTime: 0 },
  // Vertex Shader
  `
    attribute vec3 aOffset;
    attribute float aSpeed;
    attribute float aPhase;
    attribute float aWiggleAmp;
    attribute float aWiggleFreq;

    uniform float uTime;

    void main() {
      vec3 pos = position;

      // Calculate animation over time
      float t = uTime * aSpeed + aPhase;

      // Apply wiggle effect and upward motion
      float xWiggle = sin(t * aWiggleFreq) * aWiggleAmp;
      float zWiggle = cos(t * aWiggleFreq) * aWiggleAmp;
      float yOffset = mod(aOffset.y + uTime * aSpeed, 10.0) - 5.0;

      // Final position after transformations
      vec3 transformed = vec3(aOffset.x + xWiggle, yOffset, aOffset.z + zWiggle) + pos;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `,
  // Fragment Shader (simple light blue color)
  `
    void main() {
      gl_FragColor = vec4(0.6, 0.8, 1.0, 0.5); // Light blue and semi-transparent
    }
  `
);

extend({ BubbleMaterial });

function BubbleShaderBubbles({ position }: { position: THREE.Vector3 }) {
  const bounds = useAppStore((state) => state.bounds);

  const COUNT = 20;
  const sphereSize = 0.5;

  // Generate random positions and other parameters for each bubble
  const [offsets, speeds, phases, wiggleFreqs, wiggleAmps] =
    React.useMemo(() => {
      const offsets = [];
      const speeds = [];
      const phases = [];
      const wiggleFreqs = [];
      const wiggleAmps = [];

      for (let i = 0; i < COUNT; i++) {
        const randX = (Math.random() - 0.5) * 2;
        const randY = (Math.random() - 0.5) * 10;
        const randZ = (Math.random() - 0.5) * 2;

        offsets.push(
          randX + position.x, // Apply center offset
          randY + position.y, // Apply center offset
          randZ + position.z // Apply center offset
        );

        speeds.push(randomInRange(0.5, 2));
        phases.push(Math.random() * Math.PI * 2);
        wiggleFreqs.push(Math.random() * 2 + 0.5);
        wiggleAmps.push(Math.random() * 0.2 + 0.05);
      }

      return [
        new Float32Array(offsets),
        new Float32Array(speeds),
        new Float32Array(phases),
        new Float32Array(wiggleFreqs),
        new Float32Array(wiggleAmps),
      ];
    }, [position.x, position.y, position.z]);

  const ref = React.useRef();

  // Update uniform time every frame
  useFrame(({ clock }) => {
    // if (ref.current) ref.current.uTime = clock.getElapsedTime();
  });

  return (
    <Instances limit={COUNT}>
      <sphereGeometry args={[sphereSize, 8, 8]}>
        {/* Attach instanced buffer attributes for each sphere */}
        <instancedBufferAttribute
          attach="attributes-aOffset"
          args={[offsets, 3]}
        />
        <instancedBufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
        <instancedBufferAttribute
          attach="attributes-aPhase"
          args={[phases, 1]}
        />
        <instancedBufferAttribute
          attach="attributes-aWiggleFreq"
          args={[wiggleFreqs, 1]}
        />
        <instancedBufferAttribute
          attach="attributes-aWiggleAmp"
          args={[wiggleAmps, 1]}
        />
      </sphereGeometry>
      <bubbleMaterial ref={ref} transparent depthWrite={false} />
      {/* Render instances */}
      {new Array(COUNT).fill().map((_, i) => (
        <Instance key={i} />
      ))}
    </Instances>
  );
}

const Cave = () => {
  const bounds = useAppStore((state) => state.bounds);

  const { scene } = useGLTF("/models/rock_cave.glb");

  const position = React.useMemo(
    () =>
      new THREE.Vector3(
        0 - bounds.x * 0.2,
        0 - bounds.y,
        0 - bounds.z + scene.scale.z + 2
      ),
    [bounds.x, bounds.y, bounds.z, scene.scale.z]
  );

  React.useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh) {
        node.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#636262"),
        });
      }
    });
  }, [scene]);

  const bubbleData = React.useMemo(() => {}, []);

  return (
    <React.Fragment>
      <group
        scale={0.005}
        rotation={[0, Math.PI / 1.25, 0]}
        position={position}
      >
        <primitive object={scene} />
      </group>
      <BubbleShaderBubbles position={position} />
      {/* <Instances>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial transparent opacity={0.5} depthWrite={false} />
        <Instance position={[0, 0, 0]} color={"#ff000011"} />
      </Instances> */}
    </React.Fragment>
  );
};

export default Cave;
