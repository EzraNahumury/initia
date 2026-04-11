"use client";

import { useRef, useEffect, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
  </svg>
);

const TiLocationArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L4.5 20.3l.7.7L12 18l6.8 3 .7-.7L12 2z"/>
  </svg>
);

function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="three-body">
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
        <div className="three-body__dot"></div>
      </div>
    </motion.div>
  );
}

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    const interactiveElements = document.querySelectorAll("button, a, [data-interactive], .hoverable");
    interactiveElements.forEach(el => {
      el.addEventListener("mouseenter", () => setIsHovering(true));
      el.addEventListener("mouseleave", () => setIsHovering(false));
    });
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div ref={cursorRef} className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block" style={{ opacity: isVisible ? 1 : 0 }}>
      <motion.div className="relative -translate-x-1/2 -translate-y-1/2" animate={{ scale: isHovering ? 1.8 : 1 }} transition={{ duration: 0.15 }}>
        <div className={`w-10 h-10 rounded-full border transition-all duration-150 ${isHovering ? "border-purple-400/80 bg-purple-500/20" : "border-white/30 bg-transparent"}`} />
        {isHovering && <div className="absolute inset-[-8px] rounded-full border border-purple-400/30 animate-pulse" />}
      </motion.div>
    </div>
  );
}

function BentoTilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!itemRef.current) return;
    const { left, top, width, height } = itemRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;
    const tiltX = (relativeY - 0.5) * 8;
    const tiltY = (relativeX - 0.5) * -8;
    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => setTransformStyle("");

  return (
    <div ref={itemRef} className={`transition-transform duration-300 ease-out ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ transform: transformStyle }}>
      {children}
    </div>
  );
}

function BentoCard({ src, title, description, isNew }: { src?: string; title: React.ReactNode; description?: string; isNew?: boolean }) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState(0);
  const hoverButtonRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!hoverButtonRef.current) return;
    const rect = hoverButtonRef.current.getBoundingClientRect();
    setCursorPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <div className="relative size-full">
      {src && (
        <video src={src} loop muted autoPlay className="absolute left-0 top-0 size-full object-cover object-center" />
      )}
      <div className="relative z-10 flex size-full flex-col justify-between p-6">
        <div>
          <h1 className="bento-title special-font text-white">{title}</h1>
          {description && <p className="mt-3 max-w-64 text-sm text-white/60">{description}</p>}
        </div>
        {isNew && (
          <div ref={hoverButtonRef} onMouseMove={handleMouseMove} onMouseEnter={() => setHoverOpacity(1)} onMouseLeave={() => setHoverOpacity(0)} className="border-hsla relative flex w-fit cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-black/50 px-5 py-2 text-xs uppercase text-white/40 backdrop-blur-sm">
            <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300" style={{ opacity: hoverOpacity, background: `radial-gradient(120px circle at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(139,92,246,0.4), transparent)` }} />
            <TiLocationArrow />
            <span className="relative z-20">coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AnimatedTitle({ title, containerClass }: { title: string; containerClass?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const titleAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "100 bottom",
          end: "center bottom",
          toggleActions: "play none none reverse",
        },
      });
      titleAnimation.to(".animated-word", {
        opacity: 1,
        transform: "translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)",
        ease: "power2.inOut",
        stagger: 0.02,
      }, 0);
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`animated-title-container ${containerClass}`}>
      {title.split("<br />").map((line, index) => (
        <div key={index} className="flex flex-wrap gap-3 px-10 md:gap-4">
          {line.split(" ").map((word, idx) => (
            <span key={idx} className="animated-word" dangerouslySetInnerHTML={{ __html: word }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Web3ParticleField({ scrollY, mousePosition }: { scrollY: number; mousePosition: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const particleCount = 200;
  const maxDistance = 3;

  const { positions, linePositions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 25;
      pos[i3 + 1] = (Math.random() - 0.5) * 25;
      pos[i3 + 2] = (Math.random() - 0.5) * 15;
      const color = new THREE.Color();
      color.setHSL(0.7 + Math.random() * 0.2, 0.8, 0.6 + Math.random() * 0.2);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    const linePos = new Float32Array(particleCount * particleCount * 6);
    return { positions: pos, linePositions: linePos };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(particleCount * 3).fill(0.5).map((_, i) => i % 3 === 0 ? 0.4 : i % 3 === 1 ? 0.15 : 0.8), 3));
    return geo;
  }, [positions]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(linePositions.slice(), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(particleCount * particleCount * 6).fill(0.5).map((_, i) => i % 3 === 0 ? 0.3 : i % 3 === 1 ? 0.1 : 0.5), 3));
    return geo;
  }, [linePositions]);

  useFrame((state) => {
    if (!meshRef.current || !lineRef.current) return;
    const time = state.clock.getElapsedTime();
    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    const linePosArray = lineRef.current.geometry.attributes.position.array as Float32Array;
    let lineIndex = 0;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArray[i3] += Math.sin(time * 0.3 + i * 0.1) * 0.002;
      posArray[i3 + 1] += Math.cos(time * 0.2 + i * 0.15) * 0.002;
      posArray[i3 + 2] += Math.sin(time * 0.1 + i * 0.05) * 0.001;
    }

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      for (let j = i + 1; j < particleCount; j++) {
        const j3 = j * 3;
        const dx = posArray[i3] - posArray[j3];
        const dy = posArray[i3 + 1] - posArray[j3 + 1];
        const dz = posArray[i3 + 2] - posArray[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          const alpha = 1 - dist / maxDistance;
          linePosArray[lineIndex++] = posArray[i3];
          linePosArray[lineIndex++] = posArray[i3 + 1];
          linePosArray[lineIndex++] = posArray[i3 + 2];
          linePosArray[lineIndex++] = posArray[j3];
          linePosArray[lineIndex++] = posArray[j3 + 1];
          linePosArray[lineIndex++] = posArray[j3 + 2];
        }
      }
    }

    for (let i = lineIndex; i < linePosArray.length; i++) {
      linePosArray[i] = 0;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    lineRef.current.geometry.attributes.position.needsUpdate = true;
    lineRef.current.geometry.setDrawRange(0, lineIndex / 3);
    meshRef.current.rotation.y = time * 0.03;
    meshRef.current.rotation.x = time * 0.01;
    lineRef.current.rotation.y = time * 0.03;
    lineRef.current.rotation.x = time * 0.01;
  });

  return (
    <>
      <points ref={meshRef} geometry={geometry}>
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  );
}

function Scene3D({ scrollY, mousePosition }: { scrollY: number; mousePosition: { x: number; y: number } }) {
  const { camera } = useThree();
  useFrame(() => {
    const scrollFactor = Math.min(scrollY * 0.0005, 1);
    camera.position.z = 12 - scrollFactor * 4;
    camera.position.x = mousePosition.x * 0.01;
    camera.position.y = mousePosition.y * 0.01;
    camera.lookAt(0, 0, 0);
  });
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[15, 15, 15]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-15, -15, -15]} intensity={0.6} color="#ec4899" />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#06b6d4" />
      <Web3ParticleField scrollY={scrollY} mousePosition={mousePosition} />
    </>
  );
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const navItems = ["Features", "Architecture", "Tokens", "Docs"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 transition-all duration-700 ${scrolled ? "floating-nav bg-black/80 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer hoverable">
          <img src="/logo/logo.png" alt="RupiahRoute" className="h-10 w-10 object-contain" />
          <span className="text-white font-medium tracking-[0.15em] text-sm font-general">RUPIAHROUTE</span>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <span key={item} className="nav-hover-btn text-blue-50 text-xs uppercase font-general cursor-pointer">
              {item}
            </span>
          ))}
        </div>

        <motion.button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium tracking-wider px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity hoverable" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          LAUNCH APP
        </motion.button>
      </div>
    </nav>
  );
}

function HeroSection({ scrollY }: { scrollY: number }) {
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const maxZoomScroll = windowHeight * 1.5;
  const zoomLevel = scrollY < maxZoomScroll ? 1 + (scrollY / windowHeight) * 1.5 : 2.5;
  const contentOpacity = scrollY < maxZoomScroll * 0.5 ? 1 : Math.max(0, 1 - (scrollY - maxZoomScroll * 0.5) / (maxZoomScroll * 0.3));
  const overlayOpacity = scrollY > maxZoomScroll ? Math.min(1, (scrollY - maxZoomScroll) / (windowHeight * 0.3)) : 0;

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden z-0">
        <motion.video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ scale: zoomLevel }} transition={{ duration: 0.1 }}>
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </motion.video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/70 z-[1]" />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center" style={{ opacity: contentOpacity }}>
          <p className="text-purple-400/60 text-[10px] tracking-[0.5em] uppercase mb-4 font-general">Smart DeFi Router on Initia</p>

          <h1 className="special-font hero-heading text-white mb-2">
            RUPIAH
          </h1>
          <h1 className="special-font hero-heading text-white/80">
            ROUTE
          </h1>

          <p className="font-robert-regular text-white/50 text-sm max-w-md mt-6 mb-10">
            One interface, one click, best route.<br />The engine handles pool selection, multi-hop routing, cross-chain bridging.
          </p>

          <motion.button className="bg-yellow-300 text-white text-xs font-medium tracking-wider px-8 py-3 rounded-full hover:bg-yellow-400 transition-colors hoverable flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <TiLocationArrow /> GET STARTED
          </motion.button>

          <div className="absolute bottom-12 flex flex-col items-center gap-3">
            <span className="text-white/20 text-[9px] tracking-[0.4em] uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14m-7-7l7 7 7-7"/>
              </svg>
            </motion.div>
          </div>
        </div>

        <motion.div className="absolute inset-0 z-20 bg-black" style={{ opacity: overlayOpacity }} />
      </div>
      <div className="h-[200vh]" />
    </div>
  );
}

function AbstractBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1;
      meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.2;
    }
    if (particleRef.current) {
      particleRef.current.rotation.y = time * 0.05;
      const positions = particleRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time * 0.3 + i * 0.01) * 0.002;
      }
      particleRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const torusGeometry = useMemo(() => {
    return new THREE.TorusKnotGeometry(4, 1.2, 128, 32, 2, 3);
  }, []);

  const particleGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(3000 * 3);
    const colors = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      const color = new THREE.Color();
      color.setHSL(0.55 + Math.random() * 0.15, 0.7, 0.5 + Math.random() * 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <>
      <mesh ref={meshRef} geometry={torusGeometry}>
        <meshStandardMaterial
          color="#1a0a2e"
          emissive="#2d1b4e"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      <points ref={particleRef} geometry={particleGeometry}>
        <pointsMaterial size={0.04} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

function GlowingGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.03) * 0.05;
    }
    if (outerRef.current) {
      const material = outerRef.current.material as THREE.MeshPhysicalMaterial;
      if (material.opacity) {
        material.opacity = 0.15 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      }
    }
  });

  return (
    <group ref={groupRef} scale={0.3}>
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          color="#0f0a1e"
          emissive="#6d28d9"
          emissiveIntensity={0.4}
          transparent
          opacity={0.4}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[2.6, 64, 64]} />
        <meshPhysicalMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={0.6}
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.7, 32, 32]} />
        <meshBasicMaterial
          color="#c4b5fd"
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} color="#a855f7" distance={15} />
      <pointLight position={[3, 3, 3]} intensity={1} color="#22d3ee" distance={10} />
    </group>
  );
}

function Asset3D({ zoomProgress = 0 }: { zoomProgress?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/asset/scene.gltf");
  const { model, modelPosition, modelScale } = useMemo(() => {
    const nextModel = scene.clone();
    const box = new THREE.Box3().setFromObject(nextModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.35 / maxDim;

    nextModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material) return;
          material.side = THREE.DoubleSide;
          material.needsUpdate = true;
        });
      }
    });

    return {
      model: nextModel,
      modelScale: scale,
      modelPosition: [-center.x * scale, -center.y * scale - 0.15, -center.z * scale] as [number, number, number],
    };
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      const entryProgress = THREE.MathUtils.smootherstep(zoomProgress, 0.2, 1);
      const wobbleStrength = THREE.MathUtils.lerp(0.02, 0.006, entryProgress);
      const rotationX = -0.02 + Math.sin(time * 0.32) * wobbleStrength;
      const rotationY = THREE.MathUtils.lerp(0.55, 0.67, entryProgress) + time * 0.025;
      const rotationZ = Math.cos(time * 0.45) * wobbleStrength * 0.7;
      const targetY = Math.sin(time * 0.8) * 0.03;
      const targetScale = THREE.MathUtils.lerp(0.7, 1.85, entryProgress);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotationX, 0.08);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotationY, 0.08);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, rotationZ, 0.08);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08)
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={model} position={modelPosition} scale={modelScale} />
    </group>
  );
}

useGLTF.preload("/asset/scene.gltf");

function FeatureAssetCameraRig({ zoomProgress = 0 }: { zoomProgress?: number }) {
  const { camera } = useThree();
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const desiredPositionRef = useRef(new THREE.Vector3(0, 0.04, 10.4));
  const desiredLookRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraPath = useMemo(() => ({
    outer: new THREE.Vector3(0, 0.04, 10.4),
    surface: new THREE.Vector3(0, 0.03, 5.8),
    threshold: new THREE.Vector3(0, 0.01, 2.4),
    inner: new THREE.Vector3(0, 0.01, 0.06),
    outerLook: new THREE.Vector3(0.14, 0.03, -0.7),
    surfaceLook: new THREE.Vector3(0.12, 0.03, -1.8),
    thresholdLook: new THREE.Vector3(0.04, 0.02, -3.3),
    innerLook: new THREE.Vector3(-0.55, 0.06, -6.5),
  }), []);

  useFrame(() => {
    const enlargePhase = THREE.MathUtils.smoothstep(zoomProgress, 0, 0.72);
    const thresholdPhase = THREE.MathUtils.smoothstep(zoomProgress, 0.55, 0.82);
    const divePhase = THREE.MathUtils.smootherstep(zoomProgress, 0.8, 1);
    const perspectiveCamera = camera as THREE.PerspectiveCamera;

    desiredPositionRef.current
      .copy(cameraPath.outer)
      .lerp(cameraPath.surface, enlargePhase)
      .lerp(cameraPath.threshold, thresholdPhase)
      .lerp(cameraPath.inner, divePhase);
    desiredLookRef.current
      .copy(cameraPath.outerLook)
      .lerp(cameraPath.surfaceLook, enlargePhase)
      .lerp(cameraPath.thresholdLook, thresholdPhase)
      .lerp(cameraPath.innerLook, divePhase);

    const desiredFov = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(24, 30, enlargePhase),
      78,
      divePhase
    );

    camera.position.lerp(desiredPositionRef.current, 0.06);
    lookTargetRef.current.lerp(desiredLookRef.current, 0.06);
    perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, desiredFov, 0.06);
    perspectiveCamera.near = 0.01;
    perspectiveCamera.far = 80;
    perspectiveCamera.updateProjectionMatrix();
    camera.lookAt(lookTargetRef.current);
  });

  return null;
}

function MagicalParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 3000;
  
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        col[i3] = 0.67; col[i3 + 1] = 0.53; col[i3 + 2] = 1;
      } else if (colorChoice < 0.66) {
        col[i3] = 0.13; col[i3 + 1] = 0.83; col[i3 + 2] = 0.93;
      } else {
        col[i3] = 1; col[i3 + 1] = 0.84; col[i3 + 2] = 0.5;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -state.clock.getElapsedTime() * 0.01;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.005;
      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posArray[i3 + 1] += Math.sin(state.clock.getElapsedTime() * 0.5 + i * 0.1) * 0.003;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.7} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

function VolumetricFog() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[15, 32, 32]} />
      <meshBasicMaterial
        color="#1e1b4b"
        transparent
        opacity={0.15}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function ScrollCamera() {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  useFrame(() => {
    const sectionHeight = window.innerHeight * 5;
    const scrollProgress = Math.min(scrollRef.current / sectionHeight, 1);
    
    const eased = 1 - Math.pow(1 - scrollProgress, 4);
    
    const startZ = 20;
    const endZ = 0;
    
    camera.position.z = startZ + (endZ - startZ) * eased;
    camera.position.y = -eased * 1;
    (camera as THREE.PerspectiveCamera).fov = 45 + eased * 35;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });
  
  return null;
}

function GlitchText({ children, className, style }: { children: string; className?: string; style?: React.CSSProperties }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        x: isHovered ? [0, -2, 2, -1, 1, 0] : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={style}
    >
      {isHovered && (
        <>
          <span className="absolute inset-0 text-red-500/50 blur-[2px]" style={{ transform: "translateX(-2px)" }}>{children}</span>
          <span className="absolute inset-0 text-cyan-500/50 blur-[2px]" style={{ transform: "translateX(2px)" }}>{children}</span>
        </>
      )}
      {children}
    </motion.span>
  );
}

function CinematicCard({ title, subtitle, description, index }: { 
  title: string; 
  subtitle: string;
  description: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 80, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative"
      animate={{
        y: [0, 20, 0],
        rotateZ: isHovered ? 0 : [-1, 1, -1][index % 3],
      }}
      style={{
        width: "100%",
        maxWidth: index === 0 ? "500px" : "380px",
        padding: index === 0 ? "48px" : "36px",
        background: isHovered 
          ? "rgba(20, 25, 40, 0.75)" 
          : "rgba(15, 18, 30, 0.65)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderRadius: "24px",
        border: isHovered 
          ? "1px solid rgba(34, 211, 238, 0.5)" 
          : "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: isHovered
          ? "0 40px 80px -20px rgba(34, 211, 238, 0.3), 0 0 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          : "0 30px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        transformStyle: "preserve-3d",
        transform: isHovered 
          ? `perspective(1000px) rotateX(${-mousePos.y * 5}deg) rotateY(${mousePos.x * 5}deg) scale(1.02)`
          : `perspective(1000px) rotateX(${-mousePos.y * 2}deg) rotateY(${mousePos.x * 2}deg)`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform, box-shadow",
        zIndex: 10 - index,
      }}
    >
      <div 
        className="absolute inset-0 rounded-[24px] pointer-events-none overflow-hidden"
        style={{
          background: isHovered
            ? "linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, transparent 40%, rgba(139, 92, 246, 0.05) 100%)"
            : "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, transparent 50%, rgba(34, 211, 238, 0.02) 100%)",
        }}
      />
      
      <div className="relative z-10">
        <motion.p
          className="text-cyan-400/70 text-[10px] tracking-[0.3em] uppercase mb-4"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
          animate={{ x: isHovered ? [0, 1, 0] : 0 }}
        >
          {subtitle}
        </motion.p>
        
        <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-6"
          style={{ boxShadow: isHovered ? "0 0 20px rgba(34, 211, 238, 0.6)" : "none" }}
        />
        
        <GlitchText className="block text-white mb-4 tracking-wide" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: index === 0 ? "clamp(20px, 2.5vw, 28px)" : "clamp(16px, 2vw, 22px)", fontWeight: 700 }}>
          {title}
        </GlitchText>
        
        <p 
          className="text-white/40 text-sm leading-relaxed"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {description}
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent rounded-b-[24px] pointer-events-none" />
    </motion.div>
  );
}

function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionTopRef = useRef(0);
  const zoomProgressRef = useRef(0);
  const [zoomProgress, setZoomProgress] = useState(0);

  useEffect(() => {
    const updateSectionTop = () => {
      if (!sectionRef.current) return;
      sectionTopRef.current = sectionRef.current.offsetTop;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isPinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
      if (!isPinned) return;

      const currentZoom = zoomProgressRef.current;
      const wantsZoomIn = event.deltaY > 0 && currentZoom < 0.999;
      const wantsZoomOut = event.deltaY < 0 && currentZoom > 0.001;

      if (!wantsZoomIn && !wantsZoomOut) return;

      event.preventDefault();
      window.scrollTo({ top: sectionTopRef.current, behavior: "auto" });
      const nextZoom = THREE.MathUtils.clamp(currentZoom + event.deltaY * 0.0012, 0, 1);
      zoomProgressRef.current = nextZoom;
      setZoomProgress(nextZoom);
    };

    const frame = window.requestAnimationFrame(updateSectionTop);
    window.addEventListener("resize", updateSectionTop);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSectionTop);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const cameraZoomProgress = 1 - Math.pow(1 - zoomProgress, 3);
  const headingOpacity = Math.max(0, 1 - cameraZoomProgress * 2.4);

  return (
    <section 
      ref={sectionRef}
      className="relative h-[180vh] overflow-hidden md:h-[200vh]"
      style={{
        background: "linear-gradient(180deg, #030108 0%, #05020f 30%, #080414 60%, #030108 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[28%] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[150px]" />
        <div className="absolute right-[12%] top-[42%] h-72 w-72 rounded-full bg-amber-300/10 blur-[170px]" />
        <div className="absolute left-[10%] bottom-[10%] h-72 w-72 rounded-full bg-purple-500/15 blur-[180px]" />
      </div>

      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(6,3,15,0.22)_42%,rgba(3,1,8,0.9)_82%)]" />
          <Canvas
            camera={{ position: [0, 0.04, 10.4], fov: 24, near: 0.01, far: 80 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
            style={{ pointerEvents: "none" }}
          >
            <FeatureAssetCameraRig zoomProgress={cameraZoomProgress} />
            <ambientLight intensity={1.1} />
            <hemisphereLight intensity={1.45} color="#f8fafc" groundColor="#0b0516" />
            <directionalLight position={[0, 4, 5]} intensity={2.4} color="#ffe8ba" />
            <pointLight position={[-3.2, 1.4, 3.8]} intensity={2.1} color="#7dd3fc" />
            <pointLight position={[3.2, -0.8, 2.4]} intensity={1.8} color="#c084fc" />
            <pointLight position={[0, -3, -2]} intensity={1.4} color="#f59e0b" />
            <Suspense fallback={null}>
              <Asset3D zoomProgress={cameraZoomProgress} />
            </Suspense>
          </Canvas>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#030108] via-[#030108]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[#030108] via-[#030108]/70 to-transparent" />

        <div className="absolute inset-x-0 top-10 z-20 px-6 md:top-14">
          <div className="mx-auto max-w-3xl text-center" style={{ opacity: headingOpacity }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.p 
            className="text-purple-400/50 text-[10px] tracking-[0.6em] uppercase mb-4"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Core Features
          </motion.p>
          <h2 
            className="text-white mb-4"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 700 }}
          >
            CORE FEATURES
          </h2>
          <p className="text-white/30 text-base max-w-2xl mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
            Everything you need for DeFi on Initia with near-zero gas fees.
          </p>
        </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  const frameRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!frameRef.current) return;
    const { clientX, clientY } = e;
    const rect = frameRef.current.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((yPos - centerY) / centerY) * -10;
    const rotateY = ((xPos - centerX) / centerX) * 10;
    gsap.to(frameRef.current, { duration: 0.3, rotateX, rotateY, transformPerspective: 500, ease: "power1.inOut" });
  };

  const handleMouseLeave = () => {
    if (frameRef.current) {
      gsap.to(frameRef.current, { duration: 0.3, rotateX: 0, rotateY: 0, ease: "power1.inOut" });
    }
  };

  return (
    <div className="min-h-dvh w-screen bg-black text-white py-20">
      <div className="flex flex-col items-center pb-24">
        <p className="font-general text-sm uppercase md:text-[10px] text-white/40">The Multiversal DeFi World</p>

        <AnimatedTitle title="the fu<b>t</b>ure of <br /> defi is <b>h</b>ere" containerClass="mt-8 pointer-events-none relative z-10" />

        <div className="story-img-container mt-12">
          <div className="story-img-mask">
            <div className="story-img-content">
              <img ref={frameRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80" alt="DeFi" className="object-contain" />
            </div>
          </div>
        </div>

        <div className="-mt-64 flex w-full justify-center md:-mt-48 md:me-44 md:justify-end">
          <div className="flex h-full w-fit flex-col items-center md:items-start">
            <p className="mt-3 max-w-sm text-center font-circular-web text-white/40 md:text-start">
              Where DeFi meets innovation. Discover the power of smart routing and shape your financial future.
            </p>
            <motion.button className="mt-5 bg-yellow-300 text-white text-xs font-medium tracking-wider px-6 py-3 rounded-full hover:bg-yellow-400 transition-colors hoverable flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <TiLocationArrow /> EXPLORE
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokensSection() {
  const tokens = [
    { symbol: "INIT", name: "Initia", color: "from-purple-500 to-indigo-500" },
    { symbol: "USDC", name: "USD Coin", color: "from-blue-500 to-cyan-500" },
    { symbol: "WETH", name: "Wrapped Ether", color: "from-gray-400 to-gray-600" },
    { symbol: "TIA", name: "Celestia", color: "from-orange-500 to-yellow-500" },
    { symbol: "IDRX", name: "IDR Stable", color: "from-green-500 to-emerald-500" },
    { symbol: "GAS", name: "Gas Token", color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <section className="relative z-10 py-32 bg-black">
      <div className="container mx-auto px-6 text-center">
        <p className="text-purple-400/50 text-[10px] tracking-[0.4em] mb-4 uppercase">Supported Tokens</p>
        <h2 className="text-4xl md:text-6xl font-zentry font-black text-white tracking-tight mb-12">Multi-Chain <span className="italic text-purple-400">Assets</span></h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tokens.map((token) => (
            <motion.div key={token.symbol} className="border-hsla p-6 rounded-lg hover:bg-white/5 transition-colors cursor-pointer hoverable" whileHover={{ y: -5 }}>
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                {token.symbol.charAt(0)}
              </div>
              <h4 className="text-white font-bold text-sm mb-1">{token.symbol}</h4>
              <p className="text-white/30 text-[10px]">{token.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative z-10 py-32 bg-black">
      <div className="container mx-auto px-6 text-center">
        <div className="border-hsla p-12 md:p-16 rounded-lg bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
            🚀
          </div>
          <h2 className="text-3xl md:text-5xl font-zentry font-black text-white tracking-tight mb-4">Ready to start?</h2>
          <p className="text-white/40 text-sm mb-10 max-w-lg mx-auto">Join the future of DeFi on Initia. One click, best route, zero hassle.</p>
          <motion.button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs tracking-[0.2em] px-10 py-4 rounded-full hover:opacity-90 transition-opacity hoverable" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            LAUNCH APP
          </motion.button>
        </div>
      </div>
    </section>
  );
}

function FooterWeb3Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const particleCount = 1000;
  const maxDistance = 8;

  const { positions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 180;
      pos[i3 + 1] = (Math.random() - 0.5) * 50;
      pos[i3 + 2] = (Math.random() - 0.5) * 15;
    }
    return { positions: pos };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(particleCount * particleCount * 6), 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !lineRef.current) return;
    const time = state.clock.getElapsedTime();
    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    const linePosArray = lineRef.current.geometry.attributes.position.array as Float32Array;
    let lineIndex = 0;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArray[i3] += Math.sin(time * 0.8 + i * 0.15) * 0.02;
      posArray[i3 + 1] += Math.cos(time * 0.6 + i * 0.12) * 0.015;
    }

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      for (let j = i + 1; j < particleCount; j++) {
        const j3 = j * 3;
        const dx = posArray[i3] - posArray[j3];
        const dy = posArray[i3 + 1] - posArray[j3 + 1];
        const dz = posArray[i3 + 2] - posArray[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          linePosArray[lineIndex++] = posArray[i3];
          linePosArray[lineIndex++] = posArray[i3 + 1];
          linePosArray[lineIndex++] = posArray[i3 + 2];
          linePosArray[lineIndex++] = posArray[j3];
          linePosArray[lineIndex++] = posArray[j3 + 1];
          linePosArray[lineIndex++] = posArray[j3 + 2];
        }
      }
    }

    for (let i = lineIndex; i < linePosArray.length; i++) {
      linePosArray[i] = 0;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    lineRef.current.geometry.attributes.position.needsUpdate = true;
    lineRef.current.geometry.setDrawRange(0, lineIndex / 3);
  });

  return (
    <>
      <points ref={meshRef} geometry={geometry}>
        <pointsMaterial size={0.15} color="#a855f7" transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#7c3aed" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  );
}

function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer ref={footerRef} className="relative py-16 bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 25], fov: 90 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#8b5cf6" />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a855f7" />
          <FooterWeb3Particles />
        </Canvas>
      </div>
      
      <div className="relative z-10">
        <div className="w-full overflow-hidden">
          <span 
            className="block w-full text-center text-[6vw] leading-none text-white tracking-wider whitespace-nowrap"
            style={{ fontFamily: '"Press Start 2P", cursive' }}
          >
            RUPIAH ROUTE
          </span>
        </div>
        <div 
          className="relative z-10 mt-8 text-center"
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          <p className="text-[8px] text-white tracking-wider">© 2026 Rupiah Route. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden">
      <LoadingScreen isLoading={isLoading} />
      <CustomCursor />

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
        
        .border-hsla { border: 1px solid rgba(255, 255, 255, 0.2); }
        
        .nav-hover-btn {
          position: relative;
          font-family: "Press Start 2P", cursive;
          text-transform: uppercase;
          font-size: 10px;
          color: #e0e7ff;
        }
        .nav-hover-btn::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #1f1f1f;
          transform-origin: bottom right;
          transition: transform 300ms cubic-bezier(0.65, 0.05, 0.36, 1);
        }
        .nav-hover-btn:hover::after { transform-origin: bottom left; transform: scaleX(1); }
        
        .floating-nav { background: rgba(0, 0, 0, 0.8); border-radius: 8px; }
        
        .special-font b {
          font-family: "Press Start 2P", cursive;
          font-feature-settings: "ss01" on;
        }
        
        .hero-heading {
          font-family: "Press Start 2P", cursive;
          font-weight: 900;
          text-transform: uppercase;
          font-size: clamp(1.5rem, 6vw, 4rem);
          line-height: 1.2;
        }
        
        .font-general { font-family: "Press Start 2P", cursive; }
        .font-circular-web { font-family: "Press Start 2P", cursive; }
        .font-robert-regular { font-family: "Press Start 2P", cursive; }
        .font-zentry { font-family: "Press Start 2P", cursive; }
        
        .animated-title-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-transform: uppercase;
          line-height: 0.85;
          font-size: clamp(1rem, 3vw, 2rem);
          font-family: "Press Start 2P", cursive;
          font-weight: 900;
        }
        
        .animated-word {
          opacity: 0;
          display: inline-block;
          transform: translate3d(10px, 51px, -60px) rotateY(60deg) rotateX(-40deg);
          transform-origin: 50% 50% -150px !important;
          will-change: opacity, transform;
        }
        
        .bento-tilt_1 {
          position: relative;
          overflow: hidden;
          transition: transform 300ms ease-out;
        }
        
        .bento-tilt_2 {
          position: relative;
          overflow: hidden;
        }
        
        .bento-title {
          text-transform: uppercase;
          font-size: clamp(0.6rem, 2vw, 1rem);
          font-family: "Press Start 2P", cursive;
          font-weight: 900;
        }
        
        .story-img-container {
          position: relative;
          height: 70vh;
          width: 100%;
          filter: url("#flt_tag");
        }
        
        .story-img-mask {
          position: absolute;
          left: 20%;
          top: -10%;
          width: 80%;
          height: 100%;
          clip-path: polygon(4% 0, 83% 21%, 100% 73%, 0% 100%);
        }
        
        .story-img-content {
          width: 100%;
          height: 100%;
          transform: translate3d(0, 0, 0) rotateX(0) rotateY(0) rotateZ(0) scale(1);
        }
        
        .three-body {
          --uib-size: 35px;
          --uib-speed: 0.8s;
          --uib-color: #7c3aed;
          position: relative;
          display: inline-block;
          height: var(--uib-size);
          width: var(--uib-size);
          animation: spin78236 calc(var(--uib-speed) * 2.5) infinite linear;
        }
        
        .three-body__dot {
          position: absolute;
          height: 100%;
          width: 30%;
        }
        
        .three-body__dot:after {
          content: "";
          position: absolute;
          height: 0%;
          width: 100%;
          padding-bottom: 100%;
          background-color: var(--uib-color);
          border-radius: 50%;
        }
        
        .three-body__dot:nth-child(1) {
          bottom: 5%;
          left: 0;
          transform: rotate(60deg);
          transform-origin: 50% 85%;
        }
        
        .three-body__dot:nth-child(1)::after {
          bottom: 0;
          left: 0;
          animation: wobble1 var(--uib-speed) infinite ease-in-out;
          animation-delay: calc(var(--uib-speed) * -0.3);
        }
        
        .three-body__dot:nth-child(2) {
          bottom: 5%;
          right: 0;
          transform: rotate(-60deg);
          transform-origin: 50% 85%;
        }
        
        .three-body__dot:nth-child(2)::after {
          bottom: 0;
          left: 0;
          animation: wobble1 var(--uib-speed) infinite calc(var(--uib-speed) * -0.15) ease-in-out;
        }
        
        .three-body__dot:nth-child(3) {
          bottom: -5%;
          left: 0;
          transform: translateX(116.667%);
        }
        
        .three-body__dot:nth-child(3)::after {
          top: 0;
          left: 0;
          animation: wobble2 var(--uib-speed) infinite ease-in-out;
        }
        
        @keyframes spin78236 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes wobble1 {
          0%, 100% { transform: translateY(0%) scale(1); opacity: 1; }
          50% { transform: translateY(-66%) scale(0.65); opacity: 0.8; }
        }
        
        @keyframes wobble2 {
          0%, 100% { transform: translateY(0%) scale(1); opacity: 1; }
          50% { transform: translateY(66%) scale(0.65); opacity: 0.8; }
        }
        
        html { scroll-behavior: smooth; }
        body { cursor: default; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <Scene3D scrollY={scrollY} mousePosition={mousePosition} />
        </Canvas>
      </div>

      <div className="relative z-10">
        <Navigation />
        <HeroSection scrollY={scrollY} />
        <FeaturesSection />
        <StorySection />
        <TokensSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
