import { Clone } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";

type Props = {
  scene: THREE.Group<THREE.Object3DEventMap>;
  animations: THREE.AnimationClip[];
  animation: string;
  refSetter: (i: number, obj: THREE.Object3D) => void;
  index: number;
  scale: number;
};

const Fish1 = ({
  scene,
  animations,
  animation,
  index,
  scale,
  refSetter,
}: Props) => {
  const group = React.useRef<THREE.Group>(null);
  const mixer = React.useRef<THREE.AnimationMixer>(null);

  React.useEffect(() => {
    if (group.current) {
      mixer.current = new THREE.AnimationMixer(group.current);

      const clip = THREE.AnimationClip.findByName(animations, animation);

      if (!clip) {
        console.warn("Clip not found:", animation);
        console.log(
          "Available clips:",
          animations.map((a) => a.name)
        );
        return;
      }

      mixer.current.clipAction(clip).play();
    }
  }, [animation, animations]);

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
