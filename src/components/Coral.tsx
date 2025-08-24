import {
  Instance,
  Instances,
  shaderMaterial,
  useGLTF,
} from "@react-three/drei";
import React from "react";
import * as THREE from "three";
import { useAppStore } from "../store/store";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { randomInRange } from "../utils";

const BubbleMaterial = shaderMaterial(
  { uTime: 0, uTexture: null, uCeil: 40 },
  `
    attribute vec3 aOffset;
    attribute float aSpeed;
    attribute float aPhase;
    attribute float aWiggleAmp;
    attribute float aWiggleFreq;
    attribute float aSize;

    uniform float uTime;
    uniform float uCeil;
    varying float vAlpha;

    void main() {
      // Calculate animation over time
      float t = uTime * aSpeed + aPhase;

      // Wiggle
      float xWiggle = sin(t * aWiggleFreq) * aWiggleAmp;
      float zWiggle = cos(t * aWiggleFreq) * aWiggleAmp;
      float yOffset = mod(aOffset.y + uTime * aSpeed, uCeil) - 5.0;

      vec3 transformed = vec3(aOffset.x + xWiggle, yOffset, aOffset.z + zWiggle);

      // Final position
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);

      // Size in screen space
      gl_PointSize = aSize;

      // Fade alpha with height (optional)
      vAlpha = smoothstep(-5.0, 10.0, transformed.y);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    varying float vAlpha;

    void main() {
      vec2 uv = gl_PointCoord;
      vec4 texColor = texture2D(uTexture, uv);

      gl_FragColor = vec4(texColor.rgb, texColor.a);
    }
  `
);

extend({ BubbleMaterial });

export function BubbleShaderParticles({
  position,
}: {
  position: THREE.Vector3;
}) {
  const totalBubbles = useAppStore((state) => state.totalBubbles);

  const bubbleTexture = useLoader(THREE.TextureLoader, "/images/bubble_5.png");

  // Generate random data for attributes
  const [offsets, speeds, phases, wiggleFreqs, wiggleAmps, sizes] =
    React.useMemo(() => {
      const offsets = [];
      const speeds = [];
      const phases = [];
      const wiggleFreqs = [];
      const wiggleAmps = [];
      const sizes = [];

      for (let i = 0; i < totalBubbles; i++) {
        const randX = (Math.random() - 0.5) * 2;
        const randY = (Math.random() - 0.5) * 10;
        const randZ = (Math.random() - 0.5) * 2;

        offsets.push(
          randX + position.x,
          randY + position.y,
          randZ + position.z
        );
        speeds.push(randomInRange(2, 5));
        phases.push(Math.random() * Math.PI * 2);
        wiggleFreqs.push(Math.random() * 2 + 0.5);
        wiggleAmps.push(Math.random() * 0.2 + 0.05);
        sizes.push(randomInRange(10, 50));
      }

      return [
        new Float32Array(offsets),
        new Float32Array(speeds),
        new Float32Array(phases),
        new Float32Array(wiggleFreqs),
        new Float32Array(wiggleAmps),
        new Float32Array(sizes),
      ];
    }, [position.x, position.y, position.z, totalBubbles]);

  // Build geometry
  const geometry = React.useMemo(() => {
    const g = new THREE.BufferGeometry();

    const positions = new Float32Array(totalBubbles * 3);
    for (let i = 0; i < totalBubbles; i++) {
      positions[i * 3 + 0] = 0; // not used directly
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    g.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 3));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    g.setAttribute("aWiggleFreq", new THREE.BufferAttribute(wiggleFreqs, 1));
    g.setAttribute("aWiggleAmp", new THREE.BufferAttribute(wiggleAmps, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [totalBubbles, offsets, speeds, phases, wiggleFreqs, wiggleAmps, sizes]);

  const ref = React.useRef<any>();

  useFrame(({ clock }) => {
    if (ref.current) ref.current.uTime = clock.getElapsedTime();
  });

  return (
    <points geometry={geometry}>
      <bubbleMaterial
        ref={ref}
        uTexture={bubbleTexture}
        // map={bubbleTexture} // Doesnt work either
        transparent
        depthWrite={false}
        depthTest={true}
      />
    </points>
  );
}

const Coral = () => {
  const bounds = useAppStore((state) => state.bounds);

  const { scene } = useGLTF("/models/coral.glb");

  const position = React.useMemo(
    () =>
      new THREE.Vector3(
        0 - bounds.x * 0.2,
        0 - bounds.y,
        0 - bounds.z + scene.scale.z + 2
      ),
    [bounds.x, bounds.y, bounds.z, scene.scale.z]
  );

  return (
    <React.Fragment>
      <group scale={0.09} rotation={[0, Math.PI / 1.5, 0]} position={position}>
        <primitive object={scene} />
      </group>
      <BubbleShaderParticles position={position} />
      {/* <Instances>
        <sphereGeometry args={[1]} />
        <meshStandardMaterial transparent opacity={0.5} depthWrite={false} />
        <Instance position={[0, 0, 0]} color={"#ff000011"} />
      </Instances> */}
    </React.Fragment>
  );
};

export default Coral;
