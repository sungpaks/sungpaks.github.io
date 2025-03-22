import React, { useCallback, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, Vector3 } from "three";

function Particles({
  color,
  maxDistance = 500
}: {
  color: string;
  maxDistance?: number;
}) {
  const particles = React.useRef<Points>(null);
  const getRandomPositionFromCenter = useCallback(
    () => Math.random() * 1.4 - 0.7,
    []
  );

  const count = 300; // 파티클 수
  const particlesData = React.useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3)
  });

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

      if (Math.random() < probability) {
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
  );
}

export default Particles;
