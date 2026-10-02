"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { C, Interactive } from "@/components/room/kit";
import { say, useRoom } from "@/components/room/store";

const ROOT: [number, number, number] = [0.15, 0, -1.32];
const SEAT = 0.52;
// rotation that turns the chair to face the default camera
const FACE_CAMERA = Math.PI + 0.72;

const LINES = [
  "Hey, I'm Satvik. I build backend systems and the AI plumbing behind them.",
  "Click my monitor. That is where the work lives.",
  "Yes, I am on call. Yes, that is my third chai.",
  "The cat is called Kafka. She only processes events she likes.",
  "Go, TypeScript, Temporal, Postgres. Ask the sticky notes.",
  "Want to drive around Delhi? The little auto on the shelf.",
];

export function greeting() {
  const h = new Date().getHours();
  let visits = 1;
  try {
    visits = Number(localStorage.getItem("visits") ?? "0") + 1;
    localStorage.setItem("visits", String(visits));
  } catch {}
  const time =
    h < 5
      ? "You are up late. Same."
      : h < 12
        ? "Good morning."
        : h < 17
          ? "Good afternoon."
          : h < 21
            ? "Good evening."
            : "Late night? Same.";
  const back = visits > 1 ? ` Welcome back, visit number ${visits}.` : "";
  return `${time}${back} I'm Satvik. Click around, everything here does something.`;
}

export function Avatar() {
  const focus = useRoom((s) => s.focus);
  const roller = useRef<THREE.Group>(null);
  const swivel = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const rFore = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const lFore = useRef<THREE.Group>(null);
  const turned = useRef(false);
  const turnUntil = useRef(0);
  const line = useRef(0);
  const eyes = useRef<THREE.Group>(null);

  const turnAround = (text: string, ms = 4200) => {
    turned.current = true;
    turnUntil.current = performance.now() + ms;
    say("avatar", text, ms);
  };

  useEffect(() => {
    const t = setTimeout(() => turnAround(greeting(), 5200), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (focus === "monitor") say("avatar", "All yours. Try the icons.", 2400);
  }, [focus]);

  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime;
    if (turned.current && performance.now() > turnUntil.current)
      turned.current = false;
    const k = Math.min(1, dt * 4);

    const aside = focus === "monitor";
    if (roller.current) {
      roller.current.position.x +=
        ((aside ? 0.95 : 0) - roller.current.position.x) * k;
      roller.current.position.z +=
        ((aside ? 0.35 : 0) - roller.current.position.z) * k;
    }
    const s = swivel.current;
    if (s)
      s.rotation.y +=
        ((turned.current ? FACE_CAMERA : aside ? 0.9 : 0) - s.rotation.y) * k;

    // occasional glance over the shoulder toward the cursor
    const glance = !turned.current && t % 11 > 8.6;
    const h = head.current;
    if (h) {
      const yaw = turned.current
        ? pointer.x * 0.35
        : glance
          ? -1.25 + pointer.x * 0.2
          : Math.sin(t * 0.7) * 0.06;
      const pitch = turned.current
        ? -pointer.y * 0.2
        : glance
          ? -0.1
          : 0.12 + Math.sin(t * 1.3) * 0.02;
      h.rotation.y += (yaw - h.rotation.y) * k;
      h.rotation.x += (pitch - h.rotation.x) * k;
    }

    // blink
    if (eyes.current) eyes.current.scale.y = t % 3.7 < 0.12 ? 0.1 : 1;

    // arms: typing at the desk, waving when turned
    if (rArm.current && rFore.current && lArm.current && lFore.current) {
      if (turned.current) {
        rArm.current.rotation.x += (-0.2 - rArm.current.rotation.x) * k;
        rArm.current.rotation.z += (2.5 - rArm.current.rotation.z) * k;
        rFore.current.rotation.x += (0 - rFore.current.rotation.x) * k;
        rFore.current.rotation.z = 0.3 + Math.sin(t * 12) * 0.45;
        lArm.current.rotation.x += (-0.3 - lArm.current.rotation.x) * k;
        lFore.current.rotation.x += (-1.1 - lFore.current.rotation.x) * k;
      } else {
        const tap = (o: number) => Math.max(0, Math.sin(t * 16 + o)) * 0.08;
        rArm.current.rotation.x += (-0.95 - rArm.current.rotation.x) * k;
        rArm.current.rotation.z += (0.12 - rArm.current.rotation.z) * k;
        rFore.current.rotation.z += (0 - rFore.current.rotation.z) * k;
        rFore.current.rotation.x = -0.62 + tap(0);
        lArm.current.rotation.x += (-0.95 - lArm.current.rotation.x) * k;
        lFore.current.rotation.x = -0.62 + tap(1.7);
      }
    }
  });

  const hoodie = C.accent;
  const jeans = "#3b4a6b";

  return (
    <group position={ROOT}>
      <group ref={roller}>
        <group ref={swivel}>
          <Interactive
            name="avatar"
            hoverLift={0}
            onClick={() => {
              turnAround(LINES[line.current % LINES.length]);
              line.current++;
            }}
          >
            {/* chair */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.3, 0.04, 5]} />
              <meshStandardMaterial color={C.ink} />
            </mesh>
            <mesh position={[0, 0.27, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial
                color="#888"
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>
            <RoundedBox
              args={[0.5, 0.08, 0.48]}
              radius={0.04}
              position={[0, SEAT - 0.04, 0]}
              castShadow
            >
              <meshStandardMaterial color={C.slate} />
            </RoundedBox>
            <RoundedBox
              args={[0.46, 0.4, 0.07]} radius={0.04} position={[0, SEAT + 0.27, 0.27]} rotation={[0.12, 0, 0]}
              castShadow
            >
              <meshStandardMaterial color={C.slate} />
            </RoundedBox>

            {/* legs */}
            {[-0.1, 0.1].map((x) => (
              <group key={x}>
                <RoundedBox
                  args={[0.13, 0.13, 0.42]}
                  radius={0.05}
                  position={[x, SEAT + 0.07, -0.2]}
                  castShadow
                >
                  <meshStandardMaterial color={jeans} />
                </RoundedBox>
                <RoundedBox
                  args={[0.12, 0.46, 0.13]}
                  radius={0.05}
                  position={[x, SEAT - 0.19, -0.38]}
                  castShadow
                >
                  <meshStandardMaterial color={jeans} />
                </RoundedBox>
                <RoundedBox
                  args={[0.13, 0.07, 0.2]}
                  radius={0.03}
                  position={[x, 0.04, -0.43]}
                  castShadow
                >
                  <meshStandardMaterial color={C.white} />
                </RoundedBox>
              </group>
            ))}

            {/* torso */}
            <RoundedBox
              args={[0.4, 0.48, 0.25]}
              radius={0.09}
              position={[0, SEAT + 0.32, 0.02]}
              rotation={[-0.08, 0, 0]}
              castShadow
            >
              <meshStandardMaterial color={hoodie} roughness={0.85} />
            </RoundedBox>
            <RoundedBox
              args={[0.3, 0.12, 0.12]}
              radius={0.05}
              position={[0, SEAT + 0.55, 0.13]}
              castShadow
            >
              <meshStandardMaterial color="#e85a2f" roughness={0.9} />
            </RoundedBox>

            {/* arms */}
            <Arm side={1} arm={rArm} fore={rFore} color={hoodie} />
            <Arm side={-1} arm={lArm} fore={lFore} color={hoodie} />

            {/* head */}
            <group ref={head} position={[0, SEAT + 0.72, 0]}>
              <mesh position={[0, -0.08, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.08, 10]} />
                <meshStandardMaterial color={C.skin} />
              </mesh>
              <mesh castShadow>
                <sphereGeometry args={[0.13, 24, 20]} />
                <meshStandardMaterial color={C.skin} roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.035, 0.028]} castShadow>
                <sphereGeometry args={[0.135, 24, 20]} />
                <meshStandardMaterial color={C.hair} roughness={0.9} />
              </mesh>
              {/* face, on the -z side */}
              <group ref={eyes} position={[0, 0.0, -0.118]}>
                {[-0.045, 0.045].map((x) => (
                  <mesh key={x} position={[x, 0, 0]}>
                    <sphereGeometry args={[0.014, 10, 10]} />
                    <meshStandardMaterial color="#141414" />
                  </mesh>
                ))}
              </group>
              {[-0.045, 0.045].map((x) => (
                <mesh key={x} position={[x, 0, -0.122]}>
                  <torusGeometry args={[0.03, 0.005, 8, 20]} />
                  <meshStandardMaterial color="#141414" />
                </mesh>
              ))}
              <mesh position={[0, 0.0, -0.124]}>
                <boxGeometry args={[0.03, 0.006, 0.006]} />
                <meshStandardMaterial color="#141414" />
              </mesh>
              <mesh position={[0, -0.06, -0.112]} rotation={[0.3, 0, Math.PI]}>
                <torusGeometry args={[0.028, 0.006, 6, 14, Math.PI]} />
                <meshStandardMaterial color="#5a2a1c" />
              </mesh>
              {/* headphones */}
              <mesh position={[0, 0.02, 0.01]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.15, 0.014, 8, 24, Math.PI]} />
                <meshStandardMaterial color={C.ink} />
              </mesh>
              {[-1, 1].map((sx) => (
                <mesh
                  key={sx}
                  position={[sx * 0.14, -0.01, 0.01]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
                  <meshStandardMaterial color={sx > 0 ? C.accent : C.ink} />
                </mesh>
              ))}
            </group>
          </Interactive>
        </group>
      </group>
    </group>
  );
}

function Arm({
  side,
  arm,
  fore,
  color,
}: {
  side: number;
  arm: React.RefObject<THREE.Group | null>;
  fore: React.RefObject<THREE.Group | null>;
  color: string;
}) {
  return (
    <group
      ref={arm}
      position={[side * 0.23, SEAT + 0.5, 0.02]}
      rotation={[-0.95, 0, side * 0.12]}
    >
      <RoundedBox
        args={[0.1, 0.27, 0.1]}
        radius={0.045}
        position={[0, -0.12, 0]}
        castShadow
      >
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <group ref={fore} position={[0, -0.25, 0]} rotation={[-0.62, 0, 0]}>
        <RoundedBox
          args={[0.09, 0.27, 0.09]}
          radius={0.04}
          position={[0, -0.12, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>
        <mesh position={[0, -0.27, 0]} castShadow>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={C.skin} />
        </mesh>
      </group>
    </group>
  );
}
