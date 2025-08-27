import React from "react";
import { FaceMesh } from "@mediapipe/face_mesh";

const HeadTracking = ({
  hasCamera,
  headPosition,
}: {
  hasCamera: boolean;
  headPosition: React.RefObject<{
    x: number;
    y: number;
  }>;
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!hasCamera) return;

    const initCamera = async () => {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current!.play();
      };

      const faceMeshSolution = new FaceMesh({
        locateFile: (file) => `/mediapipe/${file}`,
      });

      faceMeshSolution.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMeshSolution.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
          const nose = results.multiFaceLandmarks[0][1]; // Nose tip
          headPosition.current.x = nose.x; // normalized 0..1
          headPosition.current.y = nose.y;
        }
      });

      const video = videoRef.current;

      const sendFrame = async () => {
        if (video.readyState >= 2) {
          await faceMeshSolution.send({ image: video });
        }
        requestAnimationFrame(sendFrame);
      };

      sendFrame();
    };

    initCamera();
  }, [hasCamera, headPosition]);

  return (
    <video
      ref={videoRef}
      className="hidden w-96 aspect-video z-10 top-0 left-0"
    />
  );
};

export default HeadTracking;
