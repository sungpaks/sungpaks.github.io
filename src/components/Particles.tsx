import React, { useCallback, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, Vector3 } from "three";

const PARTICLE_LIFETIME = 3000; // ms 단위로 파티클 생명주기
const SPAWN_RATE = 10; // 매 프레임마다 생성되는 파티클 수
const REMOVE_PROBABILITY = 0.05; // 제거 확률

function Particles({
  color,
  maxDistance = 500
}: {
  color: string;
  maxDistance?: number;
}) {
  const particles = React.useRef<Points>(null);
  const trailCount = 5; // 잔상 레이어 수
  const getRandomPositionFromCenter = useCallback(
    () => Math.random() * 1.4 - 0.7,
    []
  );

  const count = 200; // 파티클 수
  const particlesData = React.useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3)
  });

  // 잔상 배열
  const trailLayers = React.useRef(
    Array.from({ length: trailCount }, () => ({
      positions: new Float32Array(count * 3),
      opacity: 0 // 기본 투명도
    }))
  );

  // 초기화
  for (let i = 0; i < count; i++) {
    const distance = 5 + Math.random() * 5;
    const x = (Math.random() - 0.5) * 0.5;
    const y = (Math.random() - 1) * 10;
    const z = (Math.random() - 0.5) * 0.5;

    particlesData.current.positions[i * 3] = getRandomPositionFromCenter();
    particlesData.current.positions[i * 3 + 1] = getRandomPositionFromCenter();
    particlesData.current.positions[i * 3 + 2] = getRandomPositionFromCenter();
    particlesData.current.velocities[i * 3] = x * 0.01;
    particlesData.current.velocities[i * 3 + 1] = y * 0.01;
    particlesData.current.velocities[i * 3 + 2] = z * 0.01;
  }

  useFrame(() => {
    if (!particles.current) return;

    const positions = particlesData.current.positions;
    const velocities = particlesData.current.velocities;

    // 잔상 레이어 업데이트
    for (let t = trailCount - 1; t > 0; t--) {
      trailLayers.current[t].positions.set(
        trailLayers.current[t - 1].positions
      );
      trailLayers.current[t].opacity -= 0.1; // 잔상 투명도 점점 줄이기
    }

    // trailLayers[0]에 현재 파티클의 위치 저장
    trailLayers.current[0].positions.set(positions);
    trailLayers.current[0].opacity = 0.6;

    for (let i = 0; i < count; i++) {
      const particlePosition = new Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );

      particlePosition.x += velocities[i * 3];
      particlePosition.y += velocities[i * 3 + 1];
      particlePosition.z += velocities[i * 3 + 2];

      const dist = particlePosition.length();
      const minProbability = 0.01;
      const maxProbability = 0.99;
      const probability =
        Math.pow(dist / maxDistance, 2) * (maxProbability - minProbability) +
        minProbability;

      if (Math.random() < probability / 2) {
        positions[i * 3] = getRandomPositionFromCenter();
        positions[i * 3 + 1] = getRandomPositionFromCenter();
        positions[i * 3 + 2] = getRandomPositionFromCenter();
      } else {
        positions[i * 3] = particlePosition.x;
        positions[i * 3 + 1] = particlePosition.y;
        positions[i * 3 + 2] = particlePosition.z;
      }
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particlesData.current.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.3} color={color} transparent opacity={0.8} />
      </points>
      {trailLayers.current.map((trail, index) => (
        <points key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={count}
              array={trail.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color={color}
            transparent
            opacity={trail.opacity}
          />
        </points>
      ))}
    </>
  );
}

export default Particles;
