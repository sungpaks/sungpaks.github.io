"use client";

import {
  OrbitControls,
  useGLTF,
  useTexture,
  useTrail
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useState } from "react";
import Particles from "./Particles";
import ParticlesV2 from "./ParticlesV2";

useGLTF.preload("/models/thinking_spinning/scene.glb");

function CameraController() {
  const { camera } = useThree();
  const radius = 25;
  const speed = 0.3;
  const height = 10; // y축 변동 폭

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    const x = radius * Math.cos(time * speed);
    const z = radius * Math.sin(time * speed);

    const y = height * Math.sin(time * speed);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function AboutMe() {
  return (
    <>
      <div id="canvas-container-rocket" style={{}}>
        {/* <div
          style={{
            position: "absolute",
            width: "fit-content",
            bottom: "20%",
            right: "20%",
            rotate: "-30deg",
            zIndex: 10
          }}
        >
          <IconHandClick />
        </div> */}
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [20, 20, -20]
          }}
        >
          <OrbitControls enableZoom={false} />
          <ambientLight intensity={1} />
          <directionalLight intensity={10} position={[0, 10, -5]} />
          <SpaceShip />
          <CameraController />
        </Canvas>
      </div>
      {/* <p className="rocket-credit">
        This work is based on "Rocket 🚀"
        (https://sketchfab.com/3d-models/rocket-9b9b64b138f24e4a908238c0b471930e)
        by lizlancaster (https://sketchfab.com/lizlancaster) licensed under
        CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
      </p> */}
    </>
  );
}

function SpaceShip(props: any) {
  const [enlarged, setEnlarged] = useState(false);
  const { scene } = useGLTF("/models/rocket/scene.glb");
  const scale = enlarged ? 4 : 3;
  // scene.scale.set(SCALE, SCALE, SCALE);
  scene.rotation.x = -Math.PI / 4;
  let theta = 0;
  const easeFactor = 0.1;
  const rotationFactor = 0.5;
  const xAmplitude = (Math.random() + 0.2) * 8;
  const yAmplitude = (Math.random() + 0.2) * 8;
  const zAmplitude = (Math.random() + 0.2) * 8;

  useFrame((state, delta) => {
    theta += Math.PI / 10;
    scene.position.x = Math.sin(theta / xAmplitude) * easeFactor;
    scene.position.y = Math.sin(theta / yAmplitude) * easeFactor;
    scene.position.z = Math.sin(theta / zAmplitude) * easeFactor;
    scene.rotation.y += delta * rotationFactor;
  });

  return (
    <group
      /* onClick={() => setEnlarged(prev => !prev)} */ onPointerEnter={() =>
        setEnlarged(true)
      }
      onPointerLeave={() => setEnlarged(false)}
      scale={scale}
    >
      <primitive object={scene} {...props}>
        <Particles color="#FF4500" maxDistance={80} />
        <Particles color="#1E90FF" maxDistance={20} />
        <ParticlesV2 />
      </primitive>
    </group>
  );
}
