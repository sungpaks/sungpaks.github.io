"use client";

import {
  OrbitControls,
  useGLTF,
  useTexture,
  useTrail
} from "@react-three/drei";
import { Canvas, PrimitiveProps, useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { DirectionalLight, Mesh } from "three";
import DynamicParticleSystem from "./DynamicParticleSystem";
import Particles from "./Particles";

useGLTF.preload("/models/thinking_spinning/scene.glb");

export default function AboutMe() {
  return (
    <>
      <div id="canvas-container-rocket" style={{}}>
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [20, 10, 10]
            // lookAt: () => [0, 0, 0]
          }}
        >
          <OrbitControls />
          <ambientLight intensity={1} />
          <directionalLight intensity={10} position={[0, 10, 10]} />
          <SpaceShip />
          {/* <MagnifyingGlass /> */}
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
  const { scene } = useGLTF("/models/rocket/scene.glb");
  scene.scale.set(3, 3, 3);
  scene.rotation.x = Math.PI / 4;
  let theta = 0;
  const easeFactor = 0.1;
  const rotationFactor = 0.5;
  const xAmplitude = Math.random() * 10;
  const yAmplitude = Math.random() * 10;
  const zAmplitude = Math.random() * 10;

  useFrame((state, delta) => {
    theta += Math.PI / 10;
    scene.position.x = Math.sin(theta / xAmplitude) * easeFactor;
    scene.position.y = Math.sin(theta / yAmplitude) * easeFactor;
    scene.position.z = Math.sin(theta / zAmplitude) * easeFactor;
    scene.rotation.y += delta * rotationFactor;
  });

  return (
    <primitive object={scene} {...props}>
      <Particles color="#FF4500" maxDistance={100} />
      <Particles color="#1E90FF" maxDistance={20} />
    </primitive>
  );
}

function MagnifyingGlass(props: any) {
  const { scene } = useGLTF("/models/magnifying_glass/scene.glb");
  scene.position.x = 10;
  scene.position.y = 5;
  scene.rotation.y = 180;

  return <primitive object={scene} {...props} />;
}
