import { useFrame } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { random } from "maath";
import Fish1 from "./Fish1";
import { randomInRange } from "../utils";
import { useAppStore } from "../store/store";
import { FISH_DATA, type FISH_IDS } from "../const/fish";

type Props = {
  fishId: (typeof FISH_IDS)[keyof typeof FISH_IDS];
};

const SchoolOfFish = ({ fishId }: Props) => {
  const { scene, animations } = useGLTF(fishId);
  const fishRefs = React.useRef<THREE.Object3D[]>([]);

  const bounds = useAppStore((state) => state.bounds);

  const fishCount = useAppStore(
    (state) => state.totalFishCount / state.totalSchoolCount
  );

  const fishData = React.useMemo(
    () =>
      Array.from({ length: fishCount }, () => ({
        offset: Math.random() * 1000,
        scale: randomInRange(0.3, 0.5),
        movementSpeed: randomInRange(0.02, 0.2),
        lerpSpeed: randomInRange(0.02, 0.2),
        center: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ),
      })),
    [fishCount]
  );

  // TODO: Maybe use useImperativeHandle
  // TODO: Need to cache?
  const setRefForFish = (i: number, obj: THREE.Object3D) => {
    fishRefs.current[i] = obj;
  };

  useFrame((state, delta) => {
    const elapsedTime = state.clock.elapsedTime;

    fishRefs.current.forEach((ref, i) => {
      const offset = fishData[i].offset;
      const movementSpeed = fishData[i].movementSpeed;
      const lerpSpeed = fishData[i].lerpSpeed;
      const center = fishData[i].center;

      const target = new THREE.Vector3(
        random.noise.simplex2(elapsedTime * movementSpeed + offset, 0) *
          bounds.x,
        random.noise.simplex2(0, elapsedTime * movementSpeed + offset) *
          bounds.y,
        random.noise.simplex2(
          elapsedTime * movementSpeed + offset,
          elapsedTime * movementSpeed + offset
        ) * bounds.z
      ).add(center);

      ref.position.lerp(target, delta * lerpSpeed);

      const velocity = target.clone().sub(ref.position);
      if (velocity.lengthSq() > 0.0001) {
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          velocity.normalize()
        );
        ref.quaternion.slerp(quat, 0.1);
      }
    });
  });

  return (
    <React.Fragment>
      {fishData.map((data, index) => (
        <Fish1
          key={index}
          scene={scene}
          animations={animations}
          animation={FISH_DATA[fishId].animation}
          refSetter={setRefForFish}
          index={index}
          scale={data.scale}
        />
      ))}
    </React.Fragment>
  );
};

export default SchoolOfFish;
