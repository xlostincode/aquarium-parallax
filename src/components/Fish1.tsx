import { Clone } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";

type Props = {
  scene: THREE.Group<THREE.Object3DEventMap>;
  animations: THREE.AnimationClip[];
  refSetter: (i: number, obj: THREE.Object3D) => void;
  index: number;
  scale: number;
};

const Fish1 = ({ scene, animations, index, scale, refSetter }: Props) => {
  const group = React.useRef<THREE.Group>(null);
  const mixer = React.useRef<THREE.AnimationMixer>(null);

  React.useEffect(() => {
    if (group.current) {
      mixer.current = new THREE.AnimationMixer(group.current);
      animations.forEach((clip) => {
        mixer.current!.clipAction(clip, group.current!)!.play();
      });
    }
  }, [animations]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  React.useEffect(() => {
    if (group.current) {
      refSetter(index, group.current);
    }
  }, [index, refSetter]);

  return <Clone ref={group} object={scene} scale={scale} />;
};

export default Fish1;
