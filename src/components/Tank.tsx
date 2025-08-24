import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { useAppStore } from "../store/store";

function BoundingBox({
  bounds,
}: {
  bounds: { x: number; y: number; z: number };
}) {
  return (
    <mesh>
      <boxGeometry args={[bounds.x * 2, bounds.y * 2, bounds.z * 2]} />
      <meshBasicMaterial color="red" wireframe />
    </mesh>
  );
}

const Tank = () => {
  const bounds = useAppStore((state) => state.bounds);

  const wallThickness = 1;
  const wallThicknessHalf = wallThickness / 2;

  const normalMap = useLoader(
    THREE.TextureLoader,
    "/environment/WaterDropletsMixedBubbled001_NRM_2K.jpg"
  );
  normalMap.colorSpace = THREE.LinearSRGBColorSpace;
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(10, 10);

  // const uvTexture = useLoader(
  //   THREE.TextureLoader,
  //   "environment/uv_grid_opengl.jpg"
  // );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    normalMap.offset.x = t * 0.01;
    normalMap.offset.y = t * 0.01;
  });

  return (
    <group>
      {/* Back wall */}
      <mesh
        rotation={[0, Math.PI, 0]}
        position={[
          0,
          (bounds.y * 5) / 2 - bounds.y,
          -bounds.z - wallThicknessHalf,
        ]}
      >
        <boxGeometry args={[bounds.x * 10, bounds.y * 5, wallThickness]} />

        <meshPhysicalMaterial
          normalMap={normalMap}
          roughness={0.5}
          transmission={1}
          thickness={2.5}
          ior={1.1}
          side={THREE.FrontSide}
          color={"#c3d0d6"}
        />
      </mesh>
      {/* <BoundingBox bounds={bounds} /> */}

      {/* Bottom */}
      {/* <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          0,
          -bounds.y - wallThicknessHalf,
          0 + (bounds.z * 5) / 2 - bounds.z,
        ]}
      >
        <boxGeometry args={[bounds.x * 10, bounds.z * 5, wallThickness]} />
        <meshPhysicalMaterial
          roughness={0.5}
          transmission={1}
          thickness={2.5}
          ior={1.1}
          side={THREE.FrontSide}
          color={"#c3d0d6"}
        />
      </mesh> */}
    </group>
  );
};

export default Tank;
