import {
  Canvas,
  MeshProps,
  Object3DNode,
  useFrame,
  useLoader,
  useThree
} from "@react-three/fiber";
import React, {
  MutableRefObject,
  Ref,
  RefObject,
  Suspense,
  useCallback
} from "react";
import {
  Color,
  Float32BufferAttribute,
  Mesh,
  Points,
  TextureLoader,
  Vector3
} from "three";
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
            position: [0, 175, 0]
            // lookAt: () => [0, 0, 0]
          }}
        >
          <ambientLight intensity={1} />
          {/* <directionalLight position={[10, 10, 10]} /> */}
          <Sun />
        </Canvas>
      </div>
    </Layout>
  );
}

function Sun() {
  const mesh = React.useRef<Mesh | null>(null);
  const background = useLoader(TextureLoader, starBackground);
  const sunTexture = useLoader(TextureLoader, sun);

  useThree(({ scene, camera }) => {
    scene.background = background;
    camera.position.x = 20;
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
  let lastElapsedTime = 0;
  const OrbitAfterImageArray: any[] = [];
  const planetRef = React.useRef<Mesh | null>(null);
  const trailCount = 30;
  const positions = React.useRef<Float32Array>(
    new Float32Array(trailCount * 3)
  );
  const pointIndex = React.useRef(0);
  const trailRef = React.useRef<Points | null>(null);

  useFrame(({ clock }) => {
    const interval = clock.getElapsedTime() - lastElapsedTime;
    if (interval > 1 && planetRef.current) {
      lastElapsedTime = clock.getElapsedTime();

      const planetPosition = new Vector3();
      planetRef.current.getWorldPosition(planetPosition);

      positions.current[pointIndex.current * 3] = planetPosition.x;
      positions.current[pointIndex.current * 3 + 1] = planetPosition.y;
      positions.current[pointIndex.current * 3 + 2] = planetPosition.z;

      pointIndex.current = (pointIndex.current + 1) % trailCount;

      if (trailRef.current) {
        const geometry = trailRef.current.geometry;
        geometry.setAttribute(
          "position",
          new Float32BufferAttribute(positions.current, 3)
        );
        trailRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  return (
    <mesh {...props}>
      <Suspense fallback={null}>
        <Planet planetRef={planetRef} position={[30, 0, 0]} />
      </Suspense>
      <points ref={trailRef}>
        <bufferGeometry />
        <pointsMaterial size={1} color={"aqua"} />
      </points>
    </mesh>
  );
}

interface PlanetProps extends MeshProps {
  planetRef: MutableRefObject<Mesh | null>;
}

const Planet = ({ planetRef, ...props }: PlanetProps) => {
  const [isClicked, setIsClicked] = React.useState(false);
  const mesh = React.useRef<Mesh | null>(null);

  const texture = useLoader(TextureLoader, ceres);

  // 궤도 파라미터 설정
  const semiMajorAxis = 100; // 장축 반지름 (x축 방향)
  const semiMinorAxis = 40; // 단축 반지름 (z축 방향)
  const orbitCenter = [semiMajorAxis / 2, 0, 0]; // 중심점
  const orbitSpeed = 0.2; // 속도

  useFrame(({ clock, scene }) => {
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
  });

  return (
    <mesh
      ref={node => {
        mesh.current = node;
        planetRef.current = node;
      }}
      onClick={() => setIsClicked(prev => !prev)}
      scale={isClicked ? 1.5 : 1}
      {...props}
    >
      <axesHelper args={[5]} />
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial args={[{ map: texture }]} />
      <ParticleSystem
        orbitSpeed={orbitSpeed}
        color="#7DF9FF"
        orbitCenter={orbitCenter}
        planetRef={mesh}
      />
      <ParticleSystem
        orbitSpeed={orbitSpeed}
        dust
        color="#FFD700"
        orbitCenter={orbitCenter}
        planetRef={mesh}
      />
      <ParticleSystem
        orbitSpeed={orbitSpeed}
        dust
        color="#FF4500"
        orbitCenter={orbitCenter}
        planetRef={mesh}
      />
      <ParticleSystem
        orbitSpeed={orbitSpeed}
        color="#6457A6"
        orbitCenter={orbitCenter}
        planetRef={mesh}
      />
    </mesh>
  );
};

function ParticleSystem({
  color,
  dust,
  orbitSpeed,
  orbitCenter,
  planetRef
}: {
  color: string;
  dust?: boolean;
  orbitSpeed: number;
  orbitCenter: number[];
  planetRef: RefObject<Mesh | null>;
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
      const x = dust ? (Math.random() - 0.9) * 5 : (Math.random() - 0.5) * 1.5;
      const y = (Math.random() - 0.5) * 1.5;
      const z = Math.cos(Math.PI * 2) * -distance; // 높이 축 랜덤
      positions.push(
        getRandomPositionFromCenter(),
        getRandomPositionFromCenter(),
        getRandomPositionFromCenter()
      ); // 위치 설정 );
      const velocityFactor = dust ? 0.005 : 0.01;
      velocities.push(
        x * velocityFactor,
        y * velocityFactor,
        z * velocityFactor
      ); // 속도 설정
    }
    return { positions, velocities };
  }, []);
  useFrame(() => {
    if (!particles.current) return;
    const planetWorldPosition = new Vector3();
    planetRef?.current?.getWorldPosition(planetWorldPosition);
    const distanceFromCenter = Math.sqrt(
      (planetWorldPosition.x - 2 * orbitCenter[0]) ** 2 +
        (planetWorldPosition.z - 2 * orbitCenter[2]) ** 2
    );

    const positions = particles.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particlesData.velocities[i * 3]; // x
      positions[i * 3 + 1] += particlesData.velocities[i * 3 + 1]; // y
      positions[i * 3 + 2] += particlesData.velocities[i * 3 + 2]; // z

      // 중심으로부터 멀리 날아가면 다시 초기화
      const dist = Math.sqrt(
        positions[i * 3] ** 2 +
          positions[i * 3 + 1] ** 2 +
          positions[i * 3 + 2] ** 2
      );
      if (dust) {
        positions[i * 3] -= dist * orbitSpeed * 0.01;
      }

      const maxDistance = (distanceFromCenter / 100) ** 2 * 100; // 파티클이 최대 거리를 기준으로 사라지는 값
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
