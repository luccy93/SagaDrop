import { Suspense, useMemo, useRef, useLayoutEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { ArrowRight, Play, Pause } from "lucide-react";

/* ─── Endless White Library ─── */
const SEG = 6;            // depth of one repeating shelf segment
const NSEG = 10;          // segments per side
const DEPTH = SEG * NSEG; // total corridor depth
const SHELF_X = 3.3;      // corridor half-width
const SHELF_YS = [0.35, 1.25, 2.15, 3.05];
const PALETTE = ["#0a0a0a", "#D90429", "#c9a56a", "#e8e2d5", "#8f0f1c", "#2a2a2a", "#b8b2a6", "#6b0f1a", "#f0ead9", "#1a1a1a"];

function useSegmentBooks() {
  return useMemo(() => {
    const books = [];
    SHELF_YS.forEach((y) => {
      let z = 0.15;
      while (z < SEG - 0.25) {
        const w = 0.09 + Math.random() * 0.11;
        const h = 0.55 + Math.random() * 0.32;
        books.push({
          y: y + h / 2,
          z: z + w / 2,
          w,
          h,
          lean: Math.random() < 0.07 ? (Math.random() - 0.5) * 0.22 : 0,
          inset: Math.random() * 0.06,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
        z += w + (Math.random() < 0.12 ? 0.12 : 0.012);
      }
    });
    return books;
  }, []);
}

function ShelfBooks({ segBooks }) {
  const ref = useRef();
  const count = segBooks.length * NSEG * 2;
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const c = new THREE.Color();
    let i = 0;
    for (let side = -1; side <= 1; side += 2) {
      for (let seg = 0; seg < NSEG; seg++) {
        for (const b of segBooks) {
          p.set(side * (SHELF_X + b.inset), b.y, -1.5 - seg * SEG - b.z);
          e.set(0, 0, b.lean);
          q.setFromEuler(e);
          s.set(0.34, b.h, b.w);
          m.compose(p, q, s);
          ref.current.setMatrixAt(i, m);
          ref.current.setColorAt(i, c.set(b.color));
          i++;
        }
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [segBooks]);
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.75} />
    </instancedMesh>
  );
}

function ShelfStructure() {
  const boards = [];
  for (let side = -1; side <= 1; side += 2) {
    // horizontal shelf boards
    [...SHELF_YS, 3.95].forEach((y, k) => {
      boards.push(
        <mesh key={`b${side}${k}`} position={[side * (SHELF_X + 0.15), y - 0.04, -1.5 - DEPTH / 2]}>
          <boxGeometry args={[0.75, 0.06, DEPTH]} />
          <meshStandardMaterial color="#f4f2ec" roughness={0.6} />
        </mesh>
      );
    });
    // back panel
    boards.push(
      <mesh key={`p${side}`} position={[side * (SHELF_X + 0.5), 2.1, -1.5 - DEPTH / 2]}>
        <boxGeometry args={[0.08, 4.4, DEPTH]} />
        <meshStandardMaterial color="#efece4" roughness={0.7} />
      </mesh>
    );
    // vertical dividers per segment
    for (let seg = 0; seg <= NSEG; seg++) {
      boards.push(
        <mesh key={`d${side}${seg}`} position={[side * (SHELF_X + 0.15), 2.1, -1.5 - seg * SEG]}>
          <boxGeometry args={[0.72, 4.3, 0.09]} />
          <meshStandardMaterial color="#f4f2ec" roughness={0.6} />
        </mesh>
      );
    }
  }
  return <group>{boards}</group>;
}

function Corridor({ enabled }) {
  const group = useRef();
  const off = useRef(0);
  const segBooks = useSegmentBooks();
  useFrame((_, delta) => {
    if (!group.current) return;
    if (enabled) off.current += delta * 0.55;
    group.current.position.z = off.current % SEG;
  });
  return (
    <group ref={group}>
      <ShelfBooks segBooks={segBooks} />
      <ShelfStructure />
    </group>
  );
}

function FlyingBook({ side, shelfPos, aislePos, speed = 0.35, phase = 0, color = "#D90429", scale = 1 }) {
  const g = useRef();
  const t = useRef(phase);
  const from = useMemo(() => new THREE.Vector3(...shelfPos), [shelfPos]);
  const to = useMemo(() => new THREE.Vector3(...aislePos), [aislePos]);
  useFrame((_, delta) => {
    if (!g.current) return;
    t.current += delta * speed;
    const raw = (Math.sin(t.current) + 1) / 2;
    const k = raw * raw * (3 - 2 * raw); // smoothstep
    g.current.position.lerpVectors(from, to, k);
    g.current.position.y += Math.sin(t.current * 2.3) * 0.12;
    g.current.rotation.y = side * (0.4 + k * 1.6) + Math.sin(t.current * 1.4) * 0.15;
    g.current.rotation.z = Math.sin(t.current * 1.1) * 0.25 * k;
    g.current.rotation.x = Math.sin(t.current * 0.8) * 0.18 * k;
  });
  return (
    <group ref={g} scale={scale}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.68, 0.09]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0.012, 0, 0]}>
        <boxGeometry args={[0.46, 0.62, 0.095]} />
        <meshStandardMaterial color="#f7f3e8" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FlyingBooks() {
  const books = [
    { side: -1, shelfPos: [-3.1, 2.3, -5], aislePos: [-0.7, 2.4, -2.2], speed: 0.3, phase: 0, color: "#D90429", scale: 1 },
    { side: 1, shelfPos: [3.1, 1.4, -7], aislePos: [0.9, 2.0, -3.5], speed: 0.24, phase: 2.1, color: "#0a0a0a", scale: 0.9 },
    { side: -1, shelfPos: [-3.1, 3.1, -10], aislePos: [-1.1, 3.0, -5.5], speed: 0.27, phase: 4.2, color: "#c9a56a", scale: 0.85 },
    { side: 1, shelfPos: [3.1, 2.6, -12], aislePos: [1.2, 2.9, -7], speed: 0.21, phase: 1.2, color: "#8f0f1c", scale: 0.8 },
    { side: -1, shelfPos: [-3.1, 1.1, -14], aislePos: [-0.8, 1.8, -9], speed: 0.33, phase: 5.1, color: "#2a2a2a", scale: 0.75 },
    { side: 1, shelfPos: [3.1, 3.3, -4], aislePos: [0.6, 3.2, -1.8], speed: 0.26, phase: 3.3, color: "#D90429", scale: 0.7 },
  ];
  return books.map((b, i) => <FlyingBook key={i} {...b} />);
}

function DustParticles({ count = 320 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = Math.random() * 4;
      arr[i * 3 + 2] = 4 - Math.random() * 22;
    }
    return arr;
  }, [count]);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += 0.0022;
      arr[i] += Math.sin(t * 0.4 + i) * 0.0006;
      if (arr[i + 1] > 4.2) arr[i + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#d8c9a3" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function DollyCamera({ enabled }) {
  const cam = useRef();
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!cam.current) return;
    if (enabled) t.current += delta;
    const tt = t.current;
    cam.current.position.x = Math.sin(tt * 0.14) * 0.18;
    cam.current.position.y = 1.7 + Math.sin(tt * 0.32) * 0.06;
    cam.current.position.z = 5;
    cam.current.lookAt(Math.sin(tt * 0.1) * 0.3, 1.9, -10);
  });
  return <PerspectiveCamera ref={cam} makeDefault position={[0, 1.7, 5]} fov={46} />;
}

function LibraryLights() {
  return (
    <>
      <ambientLight intensity={1.1} color="#ffffff" />
      <directionalLight position={[2, 6, 4]} intensity={0.7} color="#fff8ec" />
      <pointLight position={[0, 3.8, -2]} intensity={0.8} color="#fff4e0" distance={12} />
      <pointLight position={[0, 3.8, -10]} intensity={0.7} color="#fff4e0" distance={12} />
      <pointLight position={[0, 3.8, -18]} intensity={0.6} color="#fff4e0" distance={12} />
    </>
  );
}

function Scene({ enabled }) {
  return (
    <>
      <DollyCamera enabled={enabled} />
      <LibraryLights />
      <fog attach="fog" args={["#ffffff", 5, 22]} />
      <Corridor enabled={enabled} />
      <FlyingBooks />
      <DustParticles />
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -DEPTH / 2 + 5]} receiveShadow>
        <planeGeometry args={[10, DEPTH + 14]} />
        <meshStandardMaterial color="#fafaf7" roughness={0.5} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.35, -DEPTH / 2 + 5]}>
        <planeGeometry args={[10, DEPTH + 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>
    </>
  );
}

/* ─── Hero UI ─── */
export default function Hero3D() {
  const [playing, setPlaying] = useState(true);

  return (
    <section
      id="home"
      data-testid="hero-section"
      className="relative min-h-screen bg-white overflow-hidden grain"
    >
      {/* 3D canvas — right half on desktop, background on mobile */}
      <div className="absolute inset-0 lg:left-[42%]">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Scene enabled={playing} />
        </Canvas>
      </div>

      {/* Overlay content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-24 min-h-screen flex flex-col justify-between">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 items-start">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="eyebrow text-[#D90429] mb-6"
            >
              ● New Season 2026
            </motion.p>
            <motion.h1
              data-testid="hero-headline"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[64px] leading-[0.9] md:text-[104px] md:leading-[0.88] font-black tracking-[-0.03em] text-[#0a0a0a]"
            >
              EVERY <br />
              STORY <br />
              BEGINS <br />
              <span className="text-[#D90429]">HERE.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 text-[15px] md:text-base text-[#555] max-w-[440px] leading-relaxed"
            >
              AI Powered Story Marketplace — timeless classics, modern bestsellers,
              and cinematic new releases, curated for every reader.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <a
                href="#trending"
                data-testid="explore-books-btn"
                className="group inline-flex items-center gap-3 bg-[#D90429] hover:bg-[#B00320] text-white px-8 py-4 no-underline transition-colors"
              >
                <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">Explore Books</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#customizer"
                data-testid="customize-book-btn"
                className="group inline-flex items-center gap-3 border border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white text-[#0a0a0a] px-8 py-4 no-underline transition-colors"
              >
                <span className="text-[13px] font-semibold tracking-[0.15em] uppercase">Customize Your Book</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between pt-14">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-[1px] h-14 bg-[#0a0a0a] animate-pulse" />
            <div>
              <div className="eyebrow text-[10px]">Scroll</div>
              <div className="text-[10px] text-[#555] tracking-[0.2em] uppercase mt-1">To Discover</div>
            </div>
          </motion.div>

          <button
            onClick={() => setPlaying((v) => !v)}
            data-testid="toggle-3d-btn"
            className="hidden md:inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#0a0a0a]"
          >
            <span className="w-9 h-9 grid place-items-center bg-[#D90429] text-white">
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </span>
            {playing ? "3D Animation Playing" : "Animation Paused"}
          </button>
        </div>
      </div>
    </section>
  );
}
