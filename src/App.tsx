import React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

type SphereData = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
};

const NUM_SPHERES = 20;

function RandomSpheres() {
  const [spheres] = React.useState(() => {
    const arr: SphereData[] = [];
    for (let i = 0; i < NUM_SPHERES; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
      });
    }
    return arr;
  });

  const refs = React.useRef<any[]>([]);

  useFrame(() => {
    spheres.forEach((sphere, i) => {
      sphere.position.add(sphere.velocity);

      const bounds = { x: 5, y: 3, z: 5 };
      if (Math.abs(sphere.position.x) > bounds.x) sphere.velocity.x *= -1;
      if (Math.abs(sphere.position.y) > bounds.y) sphere.velocity.y *= -1;
      if (Math.abs(sphere.position.z) > bounds.z) sphere.velocity.z *= -1;

      if (refs.current[i]) {
        refs.current[i].position.copy(sphere.position);
      }
    });
  });

  return (
    <>
      {spheres.map((_, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={`hsl(${Math.random() * 360}, 80%, 60%)`}
          />
        </mesh>
      ))}
    </>
  );
}

function App() {
  return (
    <main className="w-full h-screen">
      <Canvas className="bg-slate-950">
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <RandomSpheres />
      </Canvas>
    </main>
  );
}

export default App;
