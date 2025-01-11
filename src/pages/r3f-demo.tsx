import {
  Canvas,
  MeshProps,
  Object3DNode,
  useFrame,
  useLoader,
  useThree
} from "@react-three/fiber";
import React, { Suspense, useCallback } from "react";
import { Color, Mesh, Points, TextureLoader } from "three";
import Layout from "../components/Layout";
// @ts-ignore
import ceres from "../images/ceres.jpg"; // @ts-ignore
import sun from "../images/sun.jpg"; // @ts-ignore
import starBackground from "../images/stars-background.jpg";

export default function R3FDemo({ location }: { location: Location }) {
  return (
    <Layout location={location}>
      <div
        id="canvas-container"
        style={{
          border: "0.5px solid gray",
          height: "100vh",
          backgroundColor: "black",
          position: "fixed",
          width: "100vw",
          top: 0,
          left: 0
        }}
      >
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 50, 75]
            // lookAt: () => [0, 0, 0]
          }}
        >
          <ambientLight intensity={1} />
          {/* <directionalLight position={[10, 10, 10]} /> */}
          <Sun />
          {/* <mesh position={[0, -25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color={"rgb(50,50,50)"} />
          </mesh> */}
        </Canvas>
      </div>
    </Layout>
  );
}

function Sun() {
  const mesh = React.useRef<Mesh>(null);
  const background = useLoader(TextureLoader, starBackground);
  const sunTexture = useLoader(TextureLoader, sun);

  useThree(({ scene }) => {
    scene.background = background;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshPhongMaterial
        args={[
          {
            map: sunTexture
          }
        ]}
      />
      <pointLight position={[0, 0, 0]} intensity={1000} />
      <SunSystem />
    </mesh>
  );
}

function SunSystem(props: MeshProps) {
  return (
    <mesh {...props}>
      <Suspense fallback={null}>
        <Planet position={[30, 0, 0]} />
      </Suspense>
    </mesh>
  );
}

function Planet(props: MeshProps) {
  const [isClicked, setIsClicked] = React.useState(false);
  const mesh = React.useRef<Mesh>(null);
  const [distanceToCenter, setDistanceToCenter] = React.useState(0);

  const texture = useLoader(TextureLoader, ceres);

  // 궤도 파라미터 설정
  const semiMajorAxis = 60; // 장축 반지름 (x축 방향)
  const semiMinorAxis = 20; // 단축 반지름 (y축 방향)
  const orbitCenter = [semiMajorAxis / 2, 0, 0]; // 중심점
  const orbitSpeed = 0.5; // 속도

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const elapsedTime = clock.getElapsedTime() * orbitSpeed; // 시간에 따라 궤도 위치 갱신
    mesh.current.lookAt(0, 0, 0); // 중심을 바라보도록 설정

    // 타원 궤도 좌표 계산
    const x = semiMajorAxis * Math.cos(elapsedTime); // x축 좌표
    const z = semiMinorAxis * Math.sin(elapsedTime); // z축 좌표

    mesh.current.position.set(
      orbitCenter[0] + x,
      orbitCenter[1],
      orbitCenter[2] + z
    );
    // setDistanceToCenter(
    //   Math.sqrt(mesh.current.position.x ** 2 + mesh.current.position.z ** 2)
    // );
  });

  return (
    <mesh
      ref={mesh}
      onClick={() => setIsClicked(prev => !prev)}
      scale={isClicked ? 1.5 : 1}
      {...props}
    >
      <axesHelper args={[5]} />
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial args={[{ map: texture }]} />
      <ParticleSystem distanceToCenter={distanceToCenter} color="#7DF9FF" />
      <ParticleSystem
        distanceToCenter={distanceToCenter}
        dust
        color="#FFD700"
      />
      <ParticleSystem
        distanceToCenter={distanceToCenter}
        dust
        color="#FF4500"
      />
      <ParticleSystem distanceToCenter={distanceToCenter} color="#6457A6" />
    </mesh>
  );
}

function ParticleSystem({
  color,
  dust,
  distanceToCenter
}: {
  color: string;
  dust?: boolean;
  distanceToCenter: number;
}) {
  const particles = React.useRef<Points>(null);
  const getRandomPositionFromCenter = useCallback(() => {
    return Math.random() * 2 - 1;
  }, []);

  const count = 1000; // 파티클 수
  const particlesData = React.useMemo(() => {
    const positions = [];
    const velocities = [];
    for (let i = 0; i < count; i++) {
      const distance = 5 + Math.random() * 5; // 중심으로부터 거리
      const x = dust ? (Math.random() - 0.9) * 4 : (Math.random() - 0.5) * 2;
      const y = dust ? (Math.random() - 0.9) * 4 : (Math.random() - 0.5) * 2;
      const z = Math.cos(Math.PI * 2) * -distance; // 높이 축 랜덤
      positions.push(
        getRandomPositionFromCenter(),
        getRandomPositionFromCenter(),
        getRandomPositionFromCenter()
      ); // 위치 설정 );
      velocities.push(x * 0.01, y * 0.01, z * 0.01); // 속도 설정
    }
    return { positions, velocities };
  }, []);
  useFrame(() => {
    if (!particles.current) return;

    const positions = particles.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particlesData.velocities[i * 3] - (dust ? 0.01 : 0); // x
      positions[i * 3 + 1] += particlesData.velocities[i * 3 + 1]; // y
      positions[i * 3 + 2] += particlesData.velocities[i * 3 + 2]; // z

      // 중심으로부터 멀리 날아가면 다시 초기화
      const dist = Math.sqrt(
        positions[i * 3] ** 2 +
          positions[i * 3 + 1] ** 2 +
          positions[i * 3 + 2] ** 2
      );
      const maxDistance = 1000; // 파티클이 최대 거리를 기준으로 사라지는 값
      const minProbability = 0.01; // 최소 제거 확률
      const maxProbability = 0.99; // 최대 제거 확률

      // 확률 계산: 거리 기반 확률 설정
      const probability =
        Math.pow(dist / maxDistance, 2) * (maxProbability - minProbability) +
        minProbability;

      if (Math.random() < probability / 2) {
        positions[i * 3] = getRandomPositionFromCenter();
        positions[i * 3 + 1] = getRandomPositionFromCenter();
        positions[i * 3 + 2] = getRandomPositionFromCenter();
      }
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(particlesData.positions)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color={color} transparent opacity={0.8} />
    </points>
  );
}
