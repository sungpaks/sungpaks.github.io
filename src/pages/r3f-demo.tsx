import { Canvas, MeshProps, Object3DNode, useFrame } from "@react-three/fiber";
import React from "react";
import { Mesh } from "three";

export default function R3FDemo() {
  return (
    <>
      <h1>hi~ This is R3F Demo Page</h1>
      <div
        id="canvas-container"
        style={{
          border: "0.5px solid gray",
          height: "500px",
          backgroundColor: "black"
        }}
      >
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 20, 20]
            // lookAt: () => [0, 0, 0]
          }}
        >
          <ambientLight />
          <directionalLight position={[10, 10, 10]} />
          <Sun />
          <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color={"rgb(50,50,50)"} />
          </mesh>
        </Canvas>
      </div>
    </>
  );
}

function Sun() {
  const mesh = React.useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const elapsedTime = clock.getElapsedTime();
    mesh.current.rotation.y = elapsedTime / 2;
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial args={[{ color: "yellow" }]} />
      <pointLight position={[0, 0, 0]} intensity={1000} />
      <SunSystem />
    </mesh>
  );
}

function SunSystem(props: MeshProps) {
  return (
    <mesh {...props}>
      <Planet position={[10, 0, 0]} />
    </mesh>
  );
}

function Planet(props: MeshProps) {
  const [isClicked, setIsClicked] = React.useState(false);
  const mesh = React.useRef<Mesh>(null);

  return (
    <mesh
      ref={mesh}
      onClick={() => setIsClicked(prev => !prev)}
      scale={isClicked ? 1.5 : 1}
      {...props}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial args={[{ color: "green" }]} />
    </mesh>
  );
}
