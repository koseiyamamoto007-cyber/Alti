// @ts-nocheck
"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Utility: Generate Cross Texture ---
const createCrossTexture = () => {
    if (typeof document === 'undefined') return new THREE.Texture();
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();

    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = "white";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 4;

    // Draw Cross
    const cx = 32, cy = 32, size = 20, thick = 6;
    ctx.fillRect(cx - size, cy - thick / 2, size * 2, thick);
    ctx.fillRect(cx - thick / 2, cy - size, thick, size * 2);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
};

// --- Component: Dense Star Field (Dots) ---
function StarField({ count = 5000 }) {
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const timeOffsets = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 800; // Wide spread
            const y = (Math.random() - 0.5) * 800;
            const z = (Math.random() - 0.5) * 600 - 100; // Depth
            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = z;

            sizes[i] = Math.random() * 2; // Varying size
            timeOffsets[i] = Math.random() * 100;
        }
        return { positions: temp, sizes, timeOffsets };
    }, [count]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#ffffff") }
    }), []);

    useFrame((state) => {
        const { clock } = state;
        if (mesh.current && mesh.current.material) {
            // @ts-ignore
            mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
            // Drift effect: Rotate slighty
            mesh.current.rotation.y = clock.getElapsedTime() * 0.005;
            mesh.current.rotation.x = clock.getElapsedTime() * 0.002;
        }
    });

    // Custom Shader for Twinkling
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
      float twinkle = sin(uTime * 1.5 + timeOffset) * 0.5 + 0.5;
      vAlpha = twinkle;
      gl_PointSize = aSize * (1.0 + twinkle * 0.5); // Size pulse
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
                <bufferAttribute attach="attributes-position" count={particles.positions.length / 3} array={particles.positions} itemSize={3} />
                <bufferAttribute attach="attributes-aSize" count={particles.sizes.length} array={particles.sizes} itemSize={1} />
                <bufferAttribute attach="attributes-timeOffset" count={particles.timeOffsets.length} array={particles.timeOffsets} itemSize={1} />
            </bufferGeometry>
            <pointsMaterial
                size={1.5}
                sizeAttenuation={true}
                color="white"
                transparent
                depthWrite={false}
                opacity={0.8}
                onBeforeCompile={onBeforeCompile}
            />
        </points>
    );
}

// --- Component: Cross Stars (Accent) ---
function CrossStars({ count = 250 }) {
    const mesh = useRef<THREE.Points>(null);
    const texture = useMemo(() => createCrossTexture(), []);

    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            temp[i * 3] = (Math.random() - 0.5) * 600;
            temp[i * 3 + 1] = (Math.random() - 0.5) * 600;
            temp[i * 3 + 2] = (Math.random() - 0.5) * 400; // Closer range
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.007;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                map={texture}
                size={8} // Larger for cross
                sizeAttenuation={true}
                transparent
                depthWrite={false}
                opacity={0.9}
                alphaTest={0.01}
                color="#fff" // Clean white
            />
        </points>
    );
}

// --- Component: Milky Way (Volumetric Clouds) ---
function MilkyWay() {
    const count = 300;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const texture = useMemo(() => {
        if (typeof document === 'undefined') return new THREE.Texture();
        // Simple cloud texture via canvas
        const c = document.createElement("canvas");
        c.width = 128; c.height = 128;
        const ctx = c.getContext("2d");
        if (ctx) {
            const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            grd.addColorStop(0, "rgba(255,255,255,0.4)"); // Brighter core
            grd.addColorStop(0.5, "rgba(255,255,255,0.1)");
            grd.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(c);
    }, []);

    useMemo(() => {
        const tempObj = new THREE.Object3D();
        if (!mesh.current) return;

        for (let i = 0; i < count; i++) {
            // Spiral / Band distribution
            const t = i / count;
            const angle = t * Math.PI * 4; // Long spiral
            const radius = 50 + Math.random() * 100;

            // Position along a diagonal band
            const x = (Math.random() - 0.5) * 600;
            const y = (Math.random() - 0.5) * 100 + x * 0.5; // Slope
            const z = (Math.random() - 0.5) * 200 - 150; // Background layer

            tempObj.position.set(x, y, z);
            tempObj.rotation.z = Math.random() * Math.PI;
            const scale = 30 + Math.random() * 50;
            tempObj.scale.set(scale, scale, 1);
            tempObj.updateMatrix();
            mesh.current.setMatrixAt(i, tempObj.matrix);
        }
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.z = state.clock.getElapsedTime() * 0.002; // Slow rotation of the galaxy
        }
    })

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.3} // Accumulative opacity
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </instancedMesh>
    );
}

// --- Component: Shooting Stars ---
function ShootingStars() {
    const [trails, setTrails] = useState<{ id: number, startPos: THREE.Vector3, velocity: THREE.Vector3, startTime: number }[]>([]);
    const nextId = useRef(0);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Spawn logic: ~1 every 3-10 seconds
        if (Math.random() < 0.005) { // Adjust prob for frequency
            const spawnX = (Math.random() - 0.5) * 600;
            const spawnY = (Math.random() - 0.5) * 400 + 200; // Start high

            const start = new THREE.Vector3(spawnX, spawnY, -50 + Math.random() * 50);
            // Velocity: down and random side
            const vel = new THREE.Vector3((Math.random() - 0.5) * 200, -200 - Math.random() * 100, 0);

            setTrails(prev => [...prev, {
                id: nextId.current++,
                startPos: start,
                velocity: vel,
                startTime: time
            }]);
        }

        // Cleanup old trails
        setTrails(prev => prev.filter(t => time - t.startTime < 1.0)); // 1 sec lifetime
    });

    return (
        <group>
            {trails.map(t => (
                <ShootingStar key={t.id} trail={t} />
            ))}
        </group>
    );
}

function ShootingStar({ trail }: { trail: any }) {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const elapsed = state.clock.getElapsedTime() - trail.startTime;
        if (mesh.current) {
            // Move head
            const currentPos = trail.startPos.clone().add(trail.velocity.clone().multiplyScalar(elapsed));
            mesh.current.position.copy(currentPos);

            // Scale tail (Scale Y stretches it)
            // Actually, better to use LookAt and scale Z? 
            // Simple approach: A long thin plane rotated to velocity
        }
    });

    // Orient logic is complex in simple loop, assume simple line style
    // Or use a Trail component?
    // Let's just use a simple glowing bright dot moving fast, visual persistence does the rest + trailing tail mesh?

    return (
        <mesh ref={mesh} position={trail.startPos}>
            <coneGeometry args={[0.5, 15, 8]} />
            <meshBasicMaterial color="#aaddff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}


// --- Main Component ---
export function StarryBackground() {
    return (
        <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-b from-black to-[#090a0f]">
            <Canvas camera={{ position: [0, 0, 300], fov: 60 }} gl={{ antialias: false, alpha: true }}>
                <StarField count={8000} />
                <CrossStars count={150} />
                <MilkyWay />
                <ShootingStars />
            </Canvas>
        </div>
    );
}
