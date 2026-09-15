import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

export function AcademicProps() {
  const book = useRef<Mesh>(null);
  const cap = useRef<Group>(null);
  useFrame((s) => {
    if (book.current) book.current.rotation.y = s.clock.elapsedTime * 0.3;
    if (cap.current) {
      cap.current.rotation.y = s.clock.elapsedTime * 0.22;
      cap.current.position.y = 1.15 + Math.sin(s.clock.elapsedTime) * 0.06;
    }
  });
  return (
    <group>
      <mesh ref={book} castShadow position={[-0.85, 0.85, 0]} rotation={[0.25, 0.35, 0.08]}>
        <boxGeometry args={[1.05, 0.16, 0.75]} />
        <meshStandardMaterial color="#26262E" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.85, 0.98, 0]} rotation={[0.25, 0.35, 0.08]}>
        <boxGeometry args={[1, 0.1, 0.7]} />
        <meshStandardMaterial color="#F0A500" roughness={0.45} />
      </mesh>
      <group ref={cap} position={[0.95, 1.15, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.26, 24]} />
          <meshStandardMaterial color="#111114" roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.18, 0]}>
          <boxGeometry args={[1.05, 0.05, 1.05]} />
          <meshStandardMaterial color="#111114" roughness={0.35} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0.5, 0.04, 0.5]}>
          <boxGeometry args={[0.07, 0.5, 0.07]} />
          <meshStandardMaterial color="#F0A500" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export function ScienceProps() {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.28;
  });
  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 1, 24]} />
        <meshPhysicalMaterial color="#E8E8EA" transmission={0.3} roughness={0.18} thickness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshPhysicalMaterial color="#7ec8e8" transmission={0.35} roughness={0.12} />
      </mesh>
      <mesh castShadow position={[0.85, 0.65, 0]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.07, 0.1, 1.25, 12]} />
        <meshStandardMaterial color="#2B2B32" metalness={0.55} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function SportsProps() {
  const ball = useRef<Mesh>(null);
  useFrame((s) => {
    if (!ball.current) return;
    ball.current.rotation.x = s.clock.elapsedTime * 0.7;
    ball.current.rotation.y = s.clock.elapsedTime * 0.45;
    ball.current.position.y = 0.65 + Math.abs(Math.sin(s.clock.elapsedTime * 1.3)) * 0.3;
  });
  return (
    <mesh ref={ball} castShadow position={[0, 0.65, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#f4f1ea" roughness={0.55} />
    </mesh>
  );
}

export function BusProps({ progress = 0.5 }: { progress?: number }) {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.position.x = Math.sin(s.clock.elapsedTime * 0.4 + progress) * 0.15;
  });
  return (
    <group ref={ref} rotation={[0, -0.55, 0]}>
      <mesh castShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[2.6, 1, 1.1]} />
        <meshStandardMaterial color="#F0A500" roughness={0.35} metalness={0.22} />
      </mesh>
      <mesh castShadow position={[0.9, 1.05, 0]}>
        <boxGeometry args={[0.65, 0.5, 1.05]} />
        <meshStandardMaterial color="#FFF6E2" roughness={0.45} />
      </mesh>
      {[-0.75, 0.75].map((z) =>
        [-0.75, 0.65].map((x) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.26, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.16, 16]} />
            <meshStandardMaterial color="#2B2B32" />
          </mesh>
        ))
      )}
    </group>
  );
}

export function TrophyProps() {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.35;
  });
  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.22, 24]} />
        <meshStandardMaterial color="#9A6205" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 0.85, 16]} />
        <meshStandardMaterial color="#F0A500" metalness={0.75} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial color="#e8d19a" metalness={0.8} roughness={0.18} />
      </mesh>
    </group>
  );
}
