// @ts-nocheck
"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Utility: Generate Cross Texture (Client Side) ---
const useCrossTexture = () => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, 64, 64);

        // Glow
        ctx.shadowColor = "white";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "white";

        // Draw Cross
        const cx = 32, cy = 32, size = 22, thick = 6;
        ctx.fillRect(cx - size, cy - thick / 2, size * 2, thick);
        ctx.fillRect(cx - thick / 2, cy - size, thick, size * 2);

        const tex = new THREE.CanvasTexture(canvas);
        setTexture(tex);
    }, []);

    return texture;
};

// --- Component: Dense Star Field (Dots) ---
function StarField({ count = 6000 }) {
    const mesh = useRef<THREE.Points>(null);

    // Create geometry data once
    const { positions, sizes, timeOffsets } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const t = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // x: -600 to 600, y: -400 to 400, z: -200 to 400
            p[i * 3] = (Math.random() - 0.5) * 1200;
            p[i * 3 + 1] = (Math.random() - 0.5) * 800;
            p[i * 3 + 2] = (Math.random() - 0.5) * 600;

            s[i] = Math.random() * 2.5;
            t[i] = Math.random() * 50;
        }
        return { positions: p, sizes: s, timeOffsets: t };
    }, [count]);

    // Stable uniforms object
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
    }), []);

    useFrame((state) => {
        // Update the UNIFORM VALUE directly
        uniforms.uTime.value = state.clock.getElapsedTime();

        if (mesh.current) {
            // Slow rotation drift
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.002;
        }
    });

    const onBeforeCompile = (shader: any) => {
        shader.uniforms.uTime = uniforms.uTime;

        shader.vertexShader = `
      uniform float uTime;
      attribute float timeOffset;
      attribute float aSize;
      varying float vAlpha;
      ${shader.vertexShader}
    `;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
      #include <begin_vertex>
      float twinkle = sin(uTime * 2.0 + timeOffset) * 0.5 + 0.5;
      vAlpha = 0.3 + twinkle * 0.7; // Base opacity + twinkle
      gl_PointSize = aSize * (1.0 + twinkle * 0.3); 
      `
        );

        shader.fragmentShader = `
      varying float vAlpha;
      ${shader.fragmentShader}
    `;

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            `
      #include <color_fragment>
      diffuseColor.a = diffuseColor.a * vAlpha;
      `
        );
    };

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aSize" count={sizes.length} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-timeOffset" count={timeOffsets.length} array={timeOffsets} itemSize={1} />
            </bufferGeometry>
            {/* Use standard size to ensure debug visibility if shader fails */}
            <pointsMaterial
                size={2}
                sizeAttenuation={true}
                color="white"
                transparent
                opacity={1}
                depthWrite={false}
                onBeforeCompile={onBeforeCompile}
            />
        </points>
    );
}

// --- Component: Cross Stars (Accent) ---
function CrossStars({ count = 200 }) {
    const mesh = useRef<THREE.Points>(null);
    const texture = useCrossTexture(); // Use hook

    const positions = useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            temp[i * 3] = (Math.random() - 0.5) * 800;
            temp[i * 3 + 1] = (Math.random() - 0.5) * 600;
            temp[i * 3 + 2] = (Math.random() - 0.5) * 400;
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.005;
        }
    });

    if (!texture) return null; // Don't render until texture is ready

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                map={texture}
                size={10}
                sizeAttenuation={true}
                transparent
                depthWrite={false}
                opacity={0.8}
                color="#ffffff"
            />
        </points>
    );
}

// --- Component: Milky Way ---
function MilkyWay() {
    const count = 400;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const texture = useMemo(() => {
        if (typeof document === 'undefined') return new THREE.Texture();
        const c = document.createElement("canvas");
        c.width = 128; c.height = 128;
        const ctx = c.getContext("2d");
        if (ctx) {
            const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            grd.addColorStop(0, "rgba(255,255,255,0.2)");
            grd.addColorStop(0.6, "rgba(100,120,255,0.05)");
            grd.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(c);
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (!mesh.current) return;

        for (let i = 0; i < count; i++) {
            // Spiral arm shape
            const angle = i * 0.05;
            const radius = 50 + i * 0.5;
            const spread = (Math.random() - 0.5) * 50;

            const x = Math.cos(angle) * radius + spread;
            const y = Math.sin(angle) * (radius * 0.5) + spread; // Flattened
            const z = (Math.random() - 0.5) * 200 - 100;

            dummy.position.set(x, y, z);
            dummy.rotation.z = Math.random() * Math.PI;
            const scale = 50 + Math.random() * 50;
            dummy.scale.set(scale, scale, 1);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
    }, [dummy, count]);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.z = state.clock.getElapsedTime() * 0.001;
        }
    })

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.3}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}

// --- Shooting Stars ---
function ShootingStars() {
    const [trails, setTrails] = useState<{ id: number, startPos: THREE.Vector3, velocity: THREE.Vector3, startTime: number }[]>([]);
    const nextId = useRef(0);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (Math.random() < 0.01) { // 1% chance per frame (~once per 1.6s)
            const spawnX = (Math.random() - 0.5) * 600;
            const spawnY = 300;
            const start = new THREE.Vector3(spawnX, spawnY, -50);
            const vel = new THREE.Vector3((Math.random() - 0.5) * 100, -300 - Math.random() * 200, 0);

            setTrails(prev => [...prev, {
                id: nextId.current++,
                startPos: start,
                velocity: vel,
                startTime: time
            }]);
        }
        setTrails(prev => prev.filter(t => time - t.startTime < 0.8));
    });

    return (
        <group>
            {trails.map(t => <Trail key={t.id} trail={t} />)}
        </group>
    );
}

function Trail({ trail }: { trail: any }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            const elapsed = state.clock.getElapsedTime() - trail.startTime;
            // Move
            ref.current.position.copy(trail.startPos).addScaledVector(trail.velocity, elapsed);
            // Orient to velocity
            // Simple visual: thin long line
            // Only fading out?
            const material = ref.current.material as THREE.MeshBasicMaterial;
            material.opacity = 1.0 - (elapsed / 0.8);
        }
    });

    return (
        <mesh ref={ref}>
            <coneGeometry args={[0.8, 30, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={1} />
        </mesh>
    );
}

// --- MAIN EXPORT ---
export function StarryBackground() {
    return (
        // FORCED DIMENSIONS & DEBUG BACKGROUND
        <div
            className="fixed top-0 left-0 w-screen h-screen z-0 bg-slate-900 pointer-events-none"
            style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
        >
            <Canvas camera={{ position: [0, 0, 300], fov: 60 }} gl={{ antialias: false, alpha: true }}>
                <StarField />
                <CrossStars />
                <MilkyWay />
                <ShootingStars />
            </Canvas>
        </div>
    );
}
