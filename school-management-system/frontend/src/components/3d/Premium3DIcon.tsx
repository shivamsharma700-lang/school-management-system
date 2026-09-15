import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";
import { cn } from "../ui";
import { useWebGLSupport } from "./useWebGLSupport";
import { DashArt, type DashArtName, dashArtForLabel } from "../DashArt";

type IconKind =
  | "student"
  | "teacher"
  | "staff"
  | "campus"
  | "fees"
  | "attendance"
  | "admission"
  | "report"
  | "notice"
  | "bus";

const ART_SET = new Set([
  "student",
  "teacher",
  "staff",
  "campus",
  "fees",
  "attendance",
  "admission",
  "report",
  "notice",
  "add-student",
  "mark-attendance",
  "collect-fee",
  "exam",
  "results",
  "homework",
  "timetable",
  "library",
  "transport",
  "bus",
  "analytics",
  "documents",
  "settings",
  "security",
  "application",
]);

function IconMesh({ kind }: { kind: IconKind }) {
  const ref = useRef<Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.22;
    invalidate();
  });

  const content = useMemo(() => {
    switch (kind) {
      case "student":
        return (
          <group>
            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.32, 20, 20]} />
              <meshStandardMaterial color="#f5efe4" roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.62, 0.62, 0.36]} />
              <meshStandardMaterial color="#26262E" roughness={0.45} />
            </mesh>
          </group>
        );
      case "teacher":
        return (
          <group>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.28, 20, 20]} />
              <meshStandardMaterial color="#f5efe4" roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.32, 0]}>
              <coneGeometry args={[0.4, 0.8, 14]} />
              <meshStandardMaterial color="#3A3A45" roughness={0.5} />
            </mesh>
          </group>
        );
      case "campus":
        return (
          <group>
            <mesh position={[0, -0.12, 0]}>
              <boxGeometry args={[0.85, 0.62, 0.62]} />
              <meshStandardMaterial color="#26262E" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.62, 0.4, 4]} />
              <meshStandardMaterial color="#F0A500" roughness={0.4} metalness={0.2} />
            </mesh>
          </group>
        );
      case "fees":
        return (
          <group>
            {[0, 0.1, 0.2].map((y, i) => (
              <mesh key={i} position={[0, y - 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.08, 28]} />
                <meshStandardMaterial color="#F0A500" metalness={0.65} roughness={0.25} />
              </mesh>
            ))}
          </group>
        );
      case "attendance":
        return (
          <group>
            <mesh>
              <boxGeometry args={[0.75, 0.85, 0.1]} />
              <meshStandardMaterial color="#FFF6E2" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.3, 0.06]}>
              <boxGeometry args={[0.75, 0.18, 0.04]} />
              <meshStandardMaterial color="#26262E" />
            </mesh>
          </group>
        );
      case "admission":
        return (
          <group>
            <mesh rotation={[0.12, 0.25, 0]}>
              <boxGeometry args={[0.62, 0.85, 0.07]} />
              <meshStandardMaterial color="#FFF6E2" roughness={0.5} />
            </mesh>
            <mesh position={[0.22, -0.18, 0.18]}>
              <boxGeometry args={[0.3, 0.4, 0.07]} />
              <meshStandardMaterial color="#F0A500" roughness={0.4} />
            </mesh>
          </group>
        );
      case "report":
        return (
          <group>
            {[0, 0.16, 0.32].map((x, i) => (
              <mesh key={i} position={[x - 0.16, (i - 1) * 0.06, 0]}>
                <boxGeometry args={[0.16, 0.3 + i * 0.16, 0.16]} />
                <meshStandardMaterial color={i === 2 ? "#F0A500" : "#26262E"} roughness={0.45} />
              </mesh>
            ))}
          </group>
        );
      case "notice":
        return (
          <mesh>
            <coneGeometry args={[0.48, 0.8, 3]} />
            <meshStandardMaterial color="#c45c58" roughness={0.4} />
          </mesh>
        );
      case "bus":
        return (
          <group>
            <mesh>
              <boxGeometry args={[1, 0.4, 0.45]} />
              <meshStandardMaterial color="#F0A500" metalness={0.25} roughness={0.35} />
            </mesh>
            <mesh position={[0.32, 0.18, 0]}>
              <boxGeometry args={[0.28, 0.22, 0.42]} />
              <meshStandardMaterial color="#FFF6E2" />
            </mesh>
          </group>
        );
      default:
        return (
          <mesh>
            <boxGeometry args={[0.62, 0.62, 0.4]} />
            <meshStandardMaterial color="#2B2B32" roughness={0.5} />
          </mesh>
        );
    }
  }, [kind]);

  return (
    <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref}>{content}</group>
    </Float>
  );
}

function mapKind(name?: string, label?: string): IconKind {
  const t = `${name ?? ""} ${label ?? ""}`.toLowerCase();
  if (t.includes("teacher")) return "teacher";
  if (t.includes("staff")) return "staff";
  if (t.includes("branch") || t.includes("campus")) return "campus";
  if (t.includes("fee") || t.includes("payment") || t.includes("collect")) return "fees";
  if (t.includes("attend")) return "attendance";
  if (t.includes("admission") || t.includes("admit") || t.includes("application")) return "admission";
  if (t.includes("report") || t.includes("exam") || t.includes("analytics") || t.includes("result")) return "report";
  if (t.includes("notice") || t.includes("send")) return "notice";
  if (t.includes("bus") || t.includes("transport")) return "bus";
  if (t.includes("student") || t.includes("parent") || t.includes("add")) return "student";
  return "campus";
}

function ArtFallback({
  kind,
  label,
  className,
  size,
}: {
  kind?: string;
  label?: string;
  className?: string;
  size: number;
}) {
  const art = (kind && ART_SET.has(kind) ? kind : dashArtForLabel(label || kind || "campus")) as DashArtName;
  return (
    <div className={cn("shrink-0", className)} style={{ width: size, height: size }} aria-hidden>
      <DashArt name={art} />
    </div>
  );
}

export function Premium3DIcon({
  kind,
  label,
  className,
  size = 56,
}: {
  kind?: string;
  label?: string;
  className?: string;
  size?: number;
}) {
  /**
   * Icons render as vector art, not WebGL.
   *
   * Each instance used to mount its own <Canvas>: a dashboard carried twelve
   * live WebGL contexts (browsers cap around sixteen) to draw twelve 40px
   * icons, and at that size the low-poly meshes read as a game rather than a
   * school product. The vector set is sharper, weighs nothing, works without
   * WebGL, and keeps every KPI and nav icon in one visual family.
   *
   * 3D is reserved for places where it earns its cost - see the hero scene.
   */
  return <ArtFallback kind={kind} label={label} className={className} size={size} />;
}
