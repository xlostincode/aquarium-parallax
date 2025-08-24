import { GradientTexture } from "@react-three/drei";
import * as THREE from "three";

const Background = () => {
  return (
    <mesh scale={[50, 50, 50]} rotation={[0, 0, 0]}>
      <sphereGeometry args={[10]} />
      <meshBasicMaterial side={THREE.BackSide}>
        <GradientTexture
          stops={[0, 0.5, 1]} // gradient stops
          colors={["#66ccff", "#003366", "#EDDD53"]} // from deep blue to light blue
          size={32} // resolution
        />
      </meshBasicMaterial>
    </mesh>
  );
};

export default Background;
