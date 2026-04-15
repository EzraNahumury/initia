"use client";

import { useRef, useEffect, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, useScroll, useTransform } from "framer-motion";
import { useGLTF } from "@react-three/drei";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import PixelBlast from "@/components/PixelBlast";

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
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
          }
          rafRef.current = 0;
        });
      }
      if (!isVisible) setIsVisible(true);
    };
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [data-interactive], .hoverable")) {
        setIsHovering(true);
      }
    };
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [data-interactive], .hoverable")) {
        setIsHovering(false);
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isVisible]);

  return (
    <div ref={cursorRef} className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:block" style={{ opacity: isVisible ? 1 : 0, willChange: "transform" }}>
      <div className={`relative -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ${isHovering ? "scale-[1.8]" : "scale-100"}`}>
        <div className={`w-10 h-10 rounded-full border transition-all duration-150 ${isHovering ? "border-purple-400/80 bg-purple-500/20" : "border-white/30 bg-transparent"}`} />
        {isHovering && <div className="absolute inset-[-8px] rounded-full border border-purple-400/30 animate-pulse" />}
      </div>
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
            <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300" style={{ opacity: hoverOpacity, background: `radial-gradient(120px circle at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(159,41,255,0.4), transparent)` }} />
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
          toggleActions: "play none none none",
        },
      });
      titleAnimation.to(".animated-word", {
        opacity: 1,
        transform: "translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)",
        ease: "power2.inOut",
        stagger: 0.02,
        duration: 0.5,
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

function Web3ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const particleCount = 80;
  const maxDistance = 3;
  const maxLines = 300;

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
    const linePos = new Float32Array(maxLines * 6);
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
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(maxLines * 6).fill(0.5).map((_, i) => i % 3 === 0 ? 0.3 : i % 3 === 1 ? 0.1 : 0.5), 3));
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

    for (let i = 0; i < particleCount && lineIndex < maxLines * 6; i++) {
      const i3 = i * 3;
      for (let j = i + 1; j < particleCount && lineIndex < maxLines * 6; j++) {
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

function Scene3D({ scrollYRef, mousePosRef }: { scrollYRef: React.RefObject<number>; mousePosRef: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  useFrame(() => {
    const scrollFactor = Math.min((scrollYRef.current ?? 0) * 0.0005, 1);
    camera.position.z = 12 - scrollFactor * 4;
    camera.position.x = (mousePosRef.current?.x ?? 0) * 0.01;
    camera.position.y = (mousePosRef.current?.y ?? 0) * 0.01;
    camera.lookAt(0, 0, 0);
  });
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[15, 15, 15]} intensity={0.8} color="#9f29ff" />
      <pointLight position={[-15, -15, -15]} intensity={0.6} color="#ec4899" />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#06b6d4" />
      <Web3ParticleField />
    </>
  );
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastYRef = useRef(0);
  const navItems = [
    { label: "Problem", href: "#problem" },
    { label: "Features", href: "#features" },
    { label: "How", href: "#how" },
    { label: "Impact", href: "#impact" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Docs", href: "https://docsrupiahroute.vercel.app/", external: true }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      // hide when scrolling DOWN past a small threshold; reveal on any upward motion
      if (y > lastYRef.current + 4 && y > 120) {
        setHidden(true);
      } else if (y < lastYRef.current - 4) {
        setHidden(false);
      }
      lastYRef.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      const element = document.querySelector(href) as HTMLElement | null;
      if (element) {
        smoothScrollTo(element, 700);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-5 transition-all duration-500 ease-out ${scrolled ? "floating-nav bg-black/80 backdrop-blur-xl" : "bg-transparent"} ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 cursor-pointer hoverable">
          <Image src="/logo/logo.png" alt="RupiahRoute" width={40} height={40} className="h-10 w-10 object-contain" priority />
          <span className="text-white font-medium tracking-[0.15em] text-sm font-general">RUPIAHROUTE</span>
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-hover-btn text-blue-50 text-xs uppercase font-general cursor-pointer"
              >
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href!)}
                className="nav-hover-btn text-blue-50 text-xs uppercase font-general cursor-pointer bg-transparent border-none"
              >
                {item.label}
              </button>
            )
          ))}
        </div>

        <button className="bg-[#9f29ff] hover:bg-[#a78bfa] text-white text-xs font-medium tracking-wider px-6 py-2.5 rounded-full hoverable transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(159,41,255,0.35)]">
          LAUNCH APP
        </button>
      </div>
    </nav>
  );
}

function HeroSection({ scrollYRef }: { scrollYRef: React.RefObject<number> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animFrame: number;
    const update = () => {
      const scrollY = scrollYRef.current ?? 0;
      const windowHeight = window.innerHeight;
      const maxZoomScroll = windowHeight * 1.5;
      const zoomLevel = scrollY < maxZoomScroll ? 1 + (scrollY / windowHeight) * 1.5 : 2.5;
      const contentOpacity = scrollY < maxZoomScroll * 0.5 ? 1 : Math.max(0, 1 - (scrollY - maxZoomScroll * 0.5) / (maxZoomScroll * 0.3));
      const overlayOpacity = scrollY > maxZoomScroll ? Math.min(1, (scrollY - maxZoomScroll) / (windowHeight * 0.3)) : 0;

      if (videoRef.current) videoRef.current.style.transform = `scale(${zoomLevel})`;
      if (contentRef.current) contentRef.current.style.opacity = String(contentOpacity);
      if (overlayRef.current) overlayRef.current.style.opacity = String(overlayOpacity);

      animFrame = requestAnimationFrame(update);
    };
    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [scrollYRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let reverseFrame = 0;
    let lastTs = 0;

    const stepReverse = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      const next = video.currentTime - dt;
      if (next <= 0) {
        video.currentTime = 0;
        video.play().catch(() => {});
        return;
      }
      video.currentTime = next;
      reverseFrame = requestAnimationFrame(stepReverse);
    };

    const onEnded = () => {
      video.pause();
      video.currentTime = Math.max(0, video.duration - 0.001);
      lastTs = performance.now();
      reverseFrame = requestAnimationFrame(stepReverse);
    };

    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("ended", onEnded);
      if (reverseFrame) cancelAnimationFrame(reverseFrame);
    };
  }, []);

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden z-0">
        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover will-change-transform origin-center">
          <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-purple-950/40 to-black/90 z-[1]" />
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.65) 85%, rgba(0,0,0,0.9) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-[2] pointer-events-none mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 55%, rgba(139, 92, 246, 0.18), transparent 70%)",
          }}
        />

        <div ref={contentRef} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-purple-400/60 text-[10px] tracking-[0.5em] uppercase mb-4 font-general">Built for Initia MiniEVM</p>

          <h1 className="special-font hero-heading text-white mb-2">
            RUPIAH
          </h1>
          <h1 className="special-font hero-heading text-white/80">
            ROUTE
          </h1>

          <p className="text-white/50 text-sm max-w-md mt-6 mb-10 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
            One interface, one click, best route.<br />The engine handles pool selection, multi-hop routing, cross-chain bridging.
          </p>

          <button className="bg-[#9f29ff] hover:bg-[#a78bfa] text-white text-xs font-medium tracking-wider px-8 py-3 rounded-full hoverable flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_24px_rgba(159,41,255,0.4)]">
            <TiLocationArrow /> GET STARTED
          </button>

          <div className="absolute bottom-12 flex flex-col items-center gap-3">
            <span className="text-white/20 text-[9px] tracking-[0.4em] uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14m-7-7l7 7 7-7"/>
              </svg>
            </motion.div>
          </div>
        </div>

        <div ref={overlayRef} className="absolute inset-0 z-20 bg-black" style={{ opacity: 0 }} />
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

  // Phase 1 (zoom 0→0.25): fly from outer into cave center
  // Phase 2 (zoom 0.25→0.95): 360° rotation inside cave, features at 0°/90°/180°/270°
  // Phase 3 (zoom 0.95→1.0): stay inside, fade to black transition
  const outerPos = useMemo(() => new THREE.Vector3(0, 0.04, 10.4), []);
  const outerLook = useMemo(() => new THREE.Vector3(0, 0.03, -0.7), []);
  const caveCenter = useMemo(() => new THREE.Vector3(0, 0.02, 0.0), []);

  // Initialize refs to match the outer starting state — no initial lerp jump
  const lookTargetRef = useRef(new THREE.Vector3(0, 0.03, -0.7));
  const desiredPositionRef = useRef(new THREE.Vector3(0, 0.04, 10.4));
  const desiredLookRef = useRef(new THREE.Vector3(0, 0.03, -0.7));

  // 360° look targets: the camera sits at cave center and rotates to look outward
  const rotationRadius = 6;
  const rotationY = 0.05;

  useFrame(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    const z = zoomProgress;

    if (z <= 0.25) {
      // Phase 1: Fly into cave
      const p = THREE.MathUtils.smootherstep(z / 0.25, 0, 1);
      desiredPositionRef.current.lerpVectors(outerPos, caveCenter, p);
      desiredLookRef.current.lerpVectors(outerLook, new THREE.Vector3(0, rotationY, -rotationRadius), p);
      const desiredFov = THREE.MathUtils.lerp(24, 78, p);
      perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, desiredFov, 0.08);
    } else {
      // Phase 2 & 3: 360° rotation inside cave
      const rotateProgress = THREE.MathUtils.clamp((z - 0.25) / 0.70, 0, 1);
      const angle = rotateProgress * Math.PI * 2; // full 360°

      desiredPositionRef.current.copy(caveCenter);
      desiredLookRef.current.set(
        Math.sin(angle) * rotationRadius,
        rotationY,
        -Math.cos(angle) * rotationRadius
      );
      perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, 78, 0.08);
    }

    camera.position.lerp(desiredPositionRef.current, 0.08);
    lookTargetRef.current.lerp(desiredLookRef.current, 0.08);
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
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
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
  const [zoomProgress, setZoomProgress] = useState(0);

  const features = useMemo(() => [
    {
      number: "01",
      title: "SWAP",
      subtitle: "Instant Exchange",
      description: "Swap tokens instantly with the best rates across all Initia DEX pools. Smart routing finds the optimal path for every trade.",
    },
    {
      number: "02",
      title: "BRIDGE",
      subtitle: "Cross-Chain Transfer",
      description: "Bridge assets seamlessly across chains. Move tokens between Initia rollups in seconds with minimal fees.",
    },
    {
      number: "03",
      title: "MULTI-HOP",
      subtitle: "Smart Routing",
      description: "Advanced multi-hop routing discovers optimal paths through multiple liquidity pools, maximizing returns on every transaction.",
    },
    {
      number: "04",
      title: "NEAR-ZERO GAS",
      subtitle: "Minimal Fees",
      description: "Experience DeFi with near-zero gas fees powered by Initia's innovative architecture. Trade more, pay less.",
    },
    {
      number: "05",
      title: "USERNAMES",
      subtitle: "Send to .init Names",
      description: "Transfer to alice.init instead of 0x… addresses. Resolved on-chain via Initia's Cosmos precompile — no copy-paste, no typos.",
    },
  ], []);

  // Scroll → zoom mapping
  // Phase 1: 0→0.25 zoom = fly into cave (scroll 0-15%)
  // Phase 2: 0.25→0.95 zoom = 360° rotation with 5 feature plateaus (scroll 15-92%)
  // Phase 3: 0.95→1.0 zoom = fade to black, transition out (scroll 92-100%)
  const scrollToZoom = (t: number): number => {
    const W: [number, number][] = [
      [0.00, 0.00],   // outer
      [0.15, 0.25],   // arrived inside cave
      [0.18, 0.34],   // feature 0 starts
      [0.28, 0.42],   // feature 0 plateau
      [0.31, 0.46],   // feature 1 starts
      [0.41, 0.54],   // feature 1 plateau
      [0.44, 0.58],   // feature 2 starts
      [0.54, 0.66],   // feature 2 plateau
      [0.57, 0.70],   // feature 3 starts
      [0.67, 0.78],   // feature 3 plateau
      [0.70, 0.82],   // feature 4 starts
      [0.80, 0.90],   // feature 4 plateau
      [0.92, 0.95],   // rotation done
      [1.00, 1.00],   // fade complete
    ];
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    for (let i = 0; i < W.length - 1; i++) {
      if (t <= W[i + 1][0]) {
        const [s0, z0] = W[i];
        const [s1, z1] = W[i + 1];
        const p = (t - s0) / (s1 - s0);
        return z0 + (z1 - z0) * p;
      }
    }
    return 1;
  };

  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollRange = sectionRef.current.offsetHeight - window.innerHeight;
        if (scrollRange <= 0) return;
        const rawProgress = Math.max(0, Math.min(1, -rect.top / scrollRange));
        setZoomProgress(scrollToZoom(rawProgress));
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial computation
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Asset zoom: ramps up during fly-in, stays full inside cave
  const assetZoomLevel = THREE.MathUtils.smoothstep(zoomProgress, 0, 0.25);

  // Heading fades out quickly as the fly-in begins
  const headingOpacity = Math.max(0, 1 - zoomProgress / 0.05);

  // Features only appear after fully settled inside the cave (zoom 0.34→0.92)
  // Delayed start gives the fly-in time to resolve before any card appears.
  const featureZoneStart = 0.34;
  const featureZoneEnd = 0.92;
  const featurePhaseProgress = THREE.MathUtils.clamp(
    (zoomProgress - featureZoneStart) / (featureZoneEnd - featureZoneStart), 0, 1
  );
  // Hard gate: no cards until we're past the fly-in entirely
  const insideCave = zoomProgress >= featureZoneStart;

  // Vignette: visible once inside the cave
  const featureOverlayOpacity = (() => {
    if (zoomProgress < 0.22) return 0;
    if (zoomProgress < 0.30) return THREE.MathUtils.smoothstep(zoomProgress, 0.22, 0.30);
    if (zoomProgress < 0.90) return 1;
    if (zoomProgress < 0.97) return 1 - THREE.MathUtils.smoothstep(zoomProgress, 0.90, 0.97);
    return 0;
  })();

  // Fade to black at the end for transition to Story
  const exitFadeOpacity = THREE.MathUtils.smoothstep(zoomProgress, 0.92, 1.0);

  // "Stuck on the cave wall": each card slides in from the right as the camera's
  // clockwise rotation brings its wall into view, settles centered at plateau,
  // then slides off to the left as the next wall rotates in. A subtle rotateY
  // tilt adds parallax so the card reads as embedded in a curving surface.
  const getFeatureVisibility = (index: number) => {
    const numFeatures = features.length;
    const featureStart = index / numFeatures;
    const featureEnd = (index + 1) / numFeatures;
    const fadeIn = 0.08;
    const fadeOut = 0.08;

    if (featurePhaseProgress < featureStart || featurePhaseProgress > featureEnd) {
      return { opacity: 0, translateX: 0, rotateY: 0, scale: 0.94 };
    }

    const slide = 180; // px — travel distance across entry/exit
    const tilt = 14;   // deg — perspective tilt at edges

    let opacity: number;
    let translateX: number;
    let rotateY: number;

    if (featurePhaseProgress < featureStart + fadeIn) {
      const t = THREE.MathUtils.smoothstep(featurePhaseProgress, featureStart, featureStart + fadeIn);
      opacity = t;
      translateX = (1 - t) * slide;
      rotateY = (1 - t) * -tilt; // tilted as if seen from the right wall
    } else if (featurePhaseProgress > featureEnd - fadeOut) {
      const t = THREE.MathUtils.smoothstep(featurePhaseProgress, featureEnd - fadeOut, featureEnd);
      opacity = 1 - t;
      translateX = -t * slide;
      rotateY = t * tilt; // tilts as the camera pans past to the left
    } else {
      opacity = 1;
      translateX = 0;
      rotateY = 0;
    }

    return { opacity, translateX, rotateY, scale: 0.94 + opacity * 0.06 };
  };

  const activeFeatureIndex = Math.min(
    features.length - 1,
    Math.floor(featurePhaseProgress * features.length)
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="snap-section relative h-[500vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #030108 0%, #05020f 30%, #080414 60%, #030108 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[28%] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[150px]" />
          <div className="absolute right-[12%] top-[42%] h-72 w-72 rounded-full bg-cyan-300/8 blur-[170px]" />
          <div className="absolute left-[10%] bottom-[10%] h-72 w-72 rounded-full bg-purple-500/15 blur-[180px]" />
        </div>
        <div className="absolute inset-0">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(6,3,15,0.22)_42%,rgba(3,1,8,0.9)_82%)]" />
          <Canvas
            camera={{ position: [0, 0.04, 10.4], fov: 24, near: 0.01, far: 80 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
            style={{ pointerEvents: "none" }}
          >
            <FeatureAssetCameraRig zoomProgress={zoomProgress} />
            <ambientLight intensity={1.1} />
            <hemisphereLight intensity={1.45} color="#f8fafc" groundColor="#0b0516" />
            <directionalLight position={[0, 4, 5]} intensity={2.4} color="#ffe8ba" />
            <pointLight position={[-3.2, 1.4, 3.8]} intensity={2.1} color="#7dd3fc" />
            <pointLight position={[3.2, -0.8, 2.4]} intensity={1.8} color="#c084fc" />
            <pointLight position={[0, -3, -2]} intensity={1.4} color="#f59e0b" />
            <Suspense fallback={null}>
              <Asset3D zoomProgress={assetZoomLevel} />
            </Suspense>
          </Canvas>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#030108] via-[#030108]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[#030108] via-[#030108]/70 to-transparent" />

        <div className="absolute inset-x-0 top-6 z-20 px-6 md:top-8">
          <div className="mx-auto max-w-2xl text-center" style={{ opacity: headingOpacity }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <p
                className="text-purple-400/50 text-[10px] tracking-[0.6em] uppercase mb-2"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Core Features
              </p>
              <h2
                className="text-white mb-2"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(24px, 4vw, 48px)", fontWeight: 700 }}
              >
                CORE FEATURES
              </h2>
              <p className="text-white/30 text-sm max-w-lg mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
                Everything you need for DeFi on Initia with near-zero gas fees.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Subtle vignette during feature showcase */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 12,
            opacity: featureOverlayOpacity * 0.35,
            background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.9) 100%)"
          }}
        />

        {/* Feature cards — only rendered once we're fully inside the cave */}
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ perspective: "1400px", perspectiveOrigin: "center center" }}>
          {insideCave && features.map((feature, index) => {
            const { opacity, translateX, rotateY, scale } = getFeatureVisibility(index);
            if (opacity <= 0.01) return null;
            const isLeft = index % 2 === 0;

            return (
              <div key={feature.number} className="absolute inset-0 flex items-center">
                <div
                  className={`mx-auto w-full max-w-5xl px-6 md:px-16 flex ${isLeft ? "justify-start" : "justify-end"}`}
                  style={{
                    opacity,
                    transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="relative w-full max-w-xs md:max-w-md p-7 md:p-10 rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(8, 12, 28, 0.75)",
                      backdropFilter: "blur(40px)",
                      WebkitBackdropFilter: "blur(40px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                    <span
                      className="absolute -right-4 -top-6 text-[120px] font-black leading-none select-none"
                      style={{ fontFamily: "Space Grotesk, sans-serif", color: "rgba(255,255,255,0.03)" }}
                    >
                      {feature.number}
                    </span>
                    <div className="relative z-10">
                      <span
                        className="text-cyan-400/60 text-[10px] tracking-[0.4em] uppercase"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {feature.subtitle}
                      </span>
                      <h3
                        className="text-white text-2xl md:text-3xl font-bold tracking-wide mt-3 mb-4"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {feature.title}
                      </h3>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-5" />
                      <p
                        className="text-white/40 text-sm leading-relaxed"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress indicator dots */}
        {featureOverlayOpacity > 0.01 && (
          <div
            className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3"
            style={{ opacity: featureOverlayOpacity }}
          >
            {features.map((_, index) => (
              <div
                key={index}
                className="rounded-full"
                style={{
                  width: "6px",
                  height: activeFeatureIndex === index ? "28px" : "6px",
                  backgroundColor: activeFeatureIndex === index ? "rgba(34, 211, 238, 0.8)" : "rgba(255, 255, 255, 0.15)",
                  boxShadow: activeFeatureIndex === index ? "0 0 12px rgba(34, 211, 238, 0.4)" : "none",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            ))}
          </div>
        )}

        {/* Fade to black at end — seamless transition to Story */}
        {exitFadeOpacity > 0 && (
          <div className="absolute inset-0 z-40 bg-black pointer-events-none" style={{ opacity: exitFadeOpacity }} />
        )}
      </div>
    </section>
  );
}

// SVG icons for contract blocks — clean line art, no emojis
const BlockIcons = {
  router: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  pool: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6m0 8v6M2 12h6m8 0h6"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/>
    </svg>
  ),
  bridge: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="6" height="6" rx="1"/><rect x="16" y="6" width="6" height="6" rx="1"/><path d="M8 9h8"/><path d="M6 15v3m12-3v3"/><path d="M2 21h20"/>
    </svg>
  ),
  validator: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  oracle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealProgress, setRevealProgress] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const tiltRef = useRef<HTMLDivElement>(null);

  const blocks = useMemo(() => [
    { label: "ROUTER", icon: BlockIcons.router, x: "25%", y: "22%", color: "#a78bfa" },
    { label: "POOL", icon: BlockIcons.pool, x: "72%", y: "18%", color: "#22d3ee" },
    { label: "BRIDGE", icon: BlockIcons.bridge, x: "20%", y: "72%", color: "#f59e0b" },
    { label: "VALIDATOR", icon: BlockIcons.validator, x: "78%", y: "68%", color: "#34d399" },
    { label: "ORACLE", icon: BlockIcons.oracle, x: "50%", y: "45%", color: "#c084fc" },
  ], []);

  const connections = useMemo(() => [
    { from: 0, to: 4 }, { from: 1, to: 4 }, { from: 2, to: 4 },
    { from: 3, to: 4 }, { from: 0, to: 2 }, { from: 1, to: 3 },
  ], []);

  // Scroll-driven reveal: each block appears one at a time
  useEffect(() => {
    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollRange = sectionRef.current.offsetHeight - window.innerHeight;
        if (scrollRange <= 0) return;
        const p = Math.max(0, Math.min(1, -rect.top / scrollRange));
        setRevealProgress(p);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("scroll", handleScroll); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 8,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -8,
    });
  };

  // Each block reveals at an even interval, description at the end
  const getBlockOpacity = (index: number) => {
    const blockCount = blocks.length;
    // First 80% of scroll reveals blocks, last 20% shows description
    const revealZone = 0.80;
    const blockStart = (index / blockCount) * revealZone;
    const blockFadeIn = revealZone / blockCount * 0.4;
    if (revealProgress < blockStart) return 0;
    if (revealProgress < blockStart + blockFadeIn) return (revealProgress - blockStart) / blockFadeIn;
    return 1;
  };

  // Connection line appears after both its blocks are visible
  const getLineOpacity = (connIndex: number) => {
    const conn = connections[connIndex];
    const a = getBlockOpacity(conn.from);
    const b = getBlockOpacity(conn.to);
    return Math.min(a, b);
  };

  const descriptionOpacity = Math.max(0, (revealProgress - 0.82) / 0.15);
  const titleOpacity = Math.max(0, Math.min(1, revealProgress / 0.08));

  return (
    <div ref={sectionRef} id="architecture" className="relative h-[350vh] bg-black -mt-[50vh] z-[1]">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center text-white">

        {/* Title */}
        <div className="absolute inset-x-0 top-12 z-20 px-6" style={{ opacity: titleOpacity }}>
          <p className="text-center font-general text-sm uppercase md:text-[10px] text-white/40">The Multiversal DeFi World</p>
          <div className="mt-8">
            <AnimatedTitle title="the fu<b>t</b>ure of <br /> defi is <b>h</b>ere" containerClass="pointer-events-none relative z-10" />
          </div>
        </div>

        {/* Block visualization */}
        <div
          ref={tiltRef}
          className="relative w-full max-w-3xl mx-auto px-6"
          style={{ height: "55vh", perspective: "1000px", marginTop: "8vh" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        >
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(159,41,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(159,41,255,0.05) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
                opacity: Math.min(1, revealProgress * 3),
              }}
            />

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(159,41,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(34,211,238,0.3)" />
                  <stop offset="100%" stopColor="rgba(159,41,255,0.4)" />
                </linearGradient>
              </defs>
              {connections.map((conn, i) => (
                <line
                  key={i}
                  x1={blocks[conn.from].x} y1={blocks[conn.from].y}
                  x2={blocks[conn.to].x} y2={blocks[conn.to].y}
                  stroke="url(#line-grad)"
                  strokeWidth="1"
                  style={{ opacity: getLineOpacity(i), transition: "opacity 0.5s ease" }}
                />
              ))}
            </svg>

            {/* Blocks */}
            {blocks.map((block, i) => {
              const opacity = getBlockOpacity(i);
              const Icon = block.icon;
              return (
                <div
                  key={block.label}
                  className="absolute hoverable"
                  style={{
                    left: block.x, top: block.y,
                    transform: `translate(-50%, -50%) scale(${0.6 + opacity * 0.4}) translateY(${(1 - opacity) * 30}px)`,
                    opacity,
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                  }}
                >
                  <div
                    className="relative p-4 md:p-5 rounded-xl cursor-pointer group"
                    style={{
                      background: "rgba(10, 12, 25, 0.85)",
                      border: `1px solid ${opacity > 0.9 ? block.color + "40" : "rgba(255,255,255,0.06)"}`,
                      backdropFilter: "blur(20px)",
                      boxShadow: opacity > 0.9 ? `0 12px 40px -10px ${block.color}30` : "0 10px 40px -10px rgba(0,0,0,0.6)",
                      transition: "all 0.4s ease",
                    }}
                  >
                    <div className="mb-2 transition-colors" style={{ color: block.color }}><Icon /></div>
                    <p className="text-white/80 text-[10px] md:text-xs font-bold tracking-wider" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{block.label}</p>
                    <div className="absolute -inset-px rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${block.color}20, transparent 60%)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description — appears after all blocks revealed */}
        <div
          className="absolute bottom-12 inset-x-0 px-6 flex justify-center md:justify-end md:pr-20"
          style={{ opacity: descriptionOpacity, transform: `translateY(${(1 - descriptionOpacity) * 20}px)`, transition: "opacity 0.4s ease, transform 0.4s ease" }}
        >
          <div className="flex flex-col items-center md:items-start max-w-sm">
            <p className="text-center text-white/40 md:text-start text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Where DeFi meets innovation. Smart contracts, routing, and bridging — all connected in one seamless protocol.
            </p>
            <button className="mt-4 bg-[#9f29ff] hover:bg-[#a78bfa] text-white text-xs font-medium tracking-wider px-6 py-3 rounded-full hoverable flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(159,41,255,0.35)]">
              <TiLocationArrow /> EXPLORE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenCard({ token, index }: { token: { symbol: string; name: string; logo: string; glow: string; ring: string }; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="relative cursor-pointer hoverable group"
      style={{
        transform: isHovered
          ? `perspective(600px) rotateX(${-mousePos.y * 12}deg) rotateY(${mousePos.x * 12}deg) scale(1.05)`
          : "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        className="relative p-6 md:p-8 rounded-xl overflow-hidden"
        style={{
          background: isHovered ? "rgba(20, 22, 35, 0.9)" : "rgba(12, 14, 25, 0.7)",
          border: isHovered ? `1px solid ${token.ring}` : "1px solid rgba(255,255,255,0.06)",
          boxShadow: isHovered ? `0 20px 50px -12px rgba(0,0,0,0.8), 0 0 30px ${token.glow}` : "0 8px 30px -8px rgba(0,0,0,0.5)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Hover gradient overlay */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${50 + mousePos.x * 50}% ${50 + mousePos.y * 50}%, ${token.glow} 0%, transparent 70%)`,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            className="w-14 h-14 md:w-16 md:h-16 mb-4 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: isHovered ? `0 0 24px ${token.glow}, 0 0 48px ${token.glow}` : "none",
              transition: "box-shadow 0.4s ease",
            }}
            animate={isHovered ? { rotate: [0, -5, 5, -3, 0], scale: [1, 1.1, 1.05, 1.1, 1] } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <img
              src={token.logo}
              alt={token.symbol}
              className="w-full h-full object-contain rounded-full"
            />
          </motion.div>

          <h4
            className="text-white font-bold text-sm mb-1 tracking-wide"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {token.symbol}
          </h4>
          <p className="text-white/30 text-[10px] tracking-wider">{token.name}</p>

          {/* Animated underline on hover */}
          <motion.div
            className="mt-3 h-0.5 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${token.ring}, transparent)` }}
            animate={{ width: isHovered ? "80%" : "0%" }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function TokensSection() {
  const tokens = [
    { symbol: "INIT", name: "Initia", logo: "/tokens/init.png", glow: "rgba(159,41,255,0.15)", ring: "rgba(159,41,255,0.5)" },
    { symbol: "USDC", name: "USD Coin", logo: "/tokens/usdc.png", glow: "rgba(59,130,246,0.15)", ring: "rgba(59,130,246,0.5)" },
    { symbol: "WETH", name: "Wrapped Ether", logo: "/tokens/weth.png", glow: "rgba(156,163,175,0.15)", ring: "rgba(156,163,175,0.5)" },
    { symbol: "TIA", name: "Celestia", logo: "/tokens/tia.png", glow: "rgba(168,85,247,0.15)", ring: "rgba(168,85,247,0.5)" },
    { symbol: "IDRX", name: "IDR Stable", logo: "/tokens/idrx.png", glow: "rgba(16,185,129,0.15)", ring: "rgba(16,185,129,0.5)" },
    { symbol: "GAS", name: "Gas Token", logo: "/tokens/gas.svg", glow: "rgba(245,158,11,0.15)", ring: "rgba(245,158,11,0.5)" },
  ];

  return (
    <section id="tokens" className="snap-section relative z-10 py-32 bg-black">
      <div className="container mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.4 }}
          className="text-purple-400/50 text-[10px] tracking-[0.4em] mb-4 uppercase"
        >
          Supported Tokens
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl md:text-6xl font-zentry font-black text-white tracking-tight mb-16"
        >
          Multi-Chain <span className="italic text-purple-400">Assets</span>
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {tokens.map((token, index) => (
            <TokenCard key={token.symbol} token={token} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="cta" className="snap-section relative z-10 py-40 bg-black overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-[500px] h-[500px] rounded-full bg-[#B19EEF]/10 blur-[120px]"
        />
        <motion.div
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute w-[350px] h-[350px] rounded-full bg-purple-500/15 blur-[100px]"
        />
        <motion.div
          animate={{ 
            scale: [0.9, 1.1, 0.9],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute w-[250px] h-[250px] rounded-full bg-purple-400/10 blur-[80px]"
        />
      </div>
      
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: false }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: false }}
            className="mb-10"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Image
                src="/logo/logo.png"
                alt="Initia"
                width={64}
                height={64}
                className="mx-auto rounded-2xl"
              />
            </motion.div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            viewport={{ once: false }}
            className="text-5xl md:text-7xl font-zentry font-black text-white tracking-tight mb-6 leading-[1.05]"
          >
            Ready to start?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            viewport={{ once: false }}
            className="text-white/50 text-base md:text-lg mb-12 max-w-md mx-auto leading-relaxed"
          >
            Join the future of DeFi on Initia. One click, best route, zero hassle.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            viewport={{ once: false }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="group relative px-8 py-4 bg-[#9f29ff] hover:bg-[#a78bfa] text-white font-semibold text-sm tracking-wide rounded-full overflow-hidden shadow-[0_0_32px_rgba(159,41,255,0.4)]"
            >
              <span className="relative z-10">Launch App</span>
              <div className="absolute -inset-[1px] bg-[#9f29ff] rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300 blur-[3px]" />
            </motion.button>
            
            <motion.a
              href="https://docsrupiahroute.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="px-8 py-4 border border-white/15 text-white/80 font-medium text-sm tracking-wide rounded-full hover:bg-white/5 hover:border-white/25 hover:text-white transition-all duration-200"
            >
              Learn more
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setFooterVisible(true); },
      { rootMargin: "200px" }
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="relative py-16 bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {footerVisible && (
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#B19EEF"
            patternScale={2}
            patternDensity={1}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.5}
            edgeFade={0.25}
            transparent
          />
        )}
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
        <div className="relative z-10 mt-8 text-center">
          <p className="text-[10px] text-white/50 tracking-[0.15em]" style={{ fontFamily: "Inter, sans-serif" }}>
            © 2026 Rupiah Route. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SceneWrapper({
  children,
  intensity = "normal",
}: {
  children: React.ReactNode;
  intensity?: "subtle" | "normal" | "dramatic";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 35%"],
  });

  const config = {
    subtle:   { scaleFrom: 0.97, opacityFrom: 0.55, yFrom: 30, blurFrom: 3 },
    normal:   { scaleFrom: 0.92, opacityFrom: 0.25, yFrom: 60, blurFrom: 6 },
    dramatic: { scaleFrom: 0.85, opacityFrom: 0.0,  yFrom: 90, blurFrom: 10 },
  }[intensity];

  const scale = useTransform(scrollYProgress, [0, 1], [config.scaleFrom, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [config.opacityFrom, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [config.yFrom, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [config.blurFrom, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <div ref={ref} className="relative z-10">
      <motion.div
        style={{
          scale,
          opacity,
          y,
          filter,
          transformOrigin: "center 35%",
          willChange: "transform, opacity, filter",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function smoothScrollTo(target: HTMLElement, duration = 700) {
  const startY = window.scrollY;
  const navOffset = 80; // accounts for fixed nav height
  const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;
  const startTime = performance.now();
  let cancelled = false;
  let rafId = 0;

  const cancel = () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
  };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", cancel);

  const step = (now: number) => {
    if (cancelled) return;
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart — snappy finish
    window.scrollTo(0, startY + distance * eased);
    if (t < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      cancel();
    }
  };
  rafId = requestAnimationFrame(step);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function useStageSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const handler = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollRange = sectionRef.current.offsetHeight - window.innerHeight;
        if (scrollRange <= 0) return;
        const p = Math.max(0, Math.min(1, -rect.top / scrollRange));
        setProgress(p);
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handler);
    };
  }, []);

  return { sectionRef, progress };
}

// Reveal-then-grid layout: cards slide in one by one to fixed grid slots, then stay parked there.
// `slot` is the final {x: vw, y: vh} position relative to the section center.
// Cards enter from off-screen right, settle at slot, no overlap with other cards.
function getRevealLayout(
  progress: number,
  index: number,
  slot: { x: number; y: number },
  entryStart: number,
  entryDuration: number,
  stagger: number,
  settledScale: number = 0.85
) {
  const cardEntryStart = entryStart + index * stagger;
  const cardEntryEnd = cardEntryStart + entryDuration;
  const enterT = smoothstep(cardEntryStart, cardEntryEnd, progress);

  // Pure fade-in at the slot — no horizontal slide, no rotation.
  // Scale has a gentle two-phase curve: 0.92 → 1.0 (flourish) → settledScale.
  const peakT = 0.7;
  const scale =
    enterT < peakT
      ? 0.92 + (1 - 0.92) * (enterT / peakT)
      : 1 - (1 - settledScale) * ((enterT - peakT) / (1 - peakT));

  return {
    translateX: slot.x,              // vw — card stays at slot, fades in in place
    translateY: slot.y,              // vh
    opacity: enterT,
    scale,
    rotate: 0,
    zIndex: 50 + index,
  };
}

function StageIndicator({
  count,
  active,
  color = "rgba(34, 211, 238, 0.8)",
}: {
  count: number;
  active: number;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: "6px",
            height: active === i ? "28px" : "6px",
            backgroundColor: active === i ? color : "rgba(255, 255, 255, 0.15)",
            boxShadow: active === i ? `0 0 12px ${color}` : "none",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      ))}
    </div>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      // Show: scrolling up by a meaningful amount AND not near the top
      if (delta < -8 && y > 500) {
        setVisible(true);
      } else if (delta > 8 || y < 200) {
        // Hide: scrolling down, or we're near the top already
        setVisible(false);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setVisible(false);
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 left-6 z-[95] hoverable transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 pointer-events-none translate-y-2 scale-95"
      }`}
    >
      <div
        className="relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full text-white transition-all duration-200 hover:scale-[1.04] active:scale-95"
        style={{
          background: "#9f29ff",
          boxShadow: "0 0 32px rgba(139, 92, 246, 0.45), 0 12px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="relative w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 15 12 9 18 15" />
          </svg>
        </div>
        <span className="text-[10px] tracking-[0.22em] uppercase font-general whitespace-nowrap pr-0.5">
          To Top
        </span>
      </div>
    </button>
  );
}

function AutoPlayButton() {
  const [playing, setPlaying] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const playingRef = useRef(false);
  const rafRef = useRef(0);

  const dismissHint = () => {
    setHintVisible(false);
    setHintDismissed(true);
  };

  const stopPlay = () => {
    playingRef.current = false;
    setPlaying(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    // Restore CSS scroll-snap so the user's manual scroll keeps its snap feel.
    document.documentElement.style.scrollSnapType = "";
  };

  const startPlay = () => {
    playingRef.current = true;
    setPlaying(true);
    dismissHint();
    // CSS scroll-snap fights programmatic rAF-driven scrolling at section
    // boundaries (scroll gets "pulled" back to the snap anchor). Disable it
    // for the duration of the tour.
    document.documentElement.style.scrollSnapType = "none";

    // Adaptive speed by section type:
    //  - Sticky animated (cave, capabilities, etc.): slow so staged animations play out
    //  - Info-dense / card-grid (tokens, stats, roadmap): medium so cards breathe
    //  - Flat gaps between sections: fast so viewer isn't stuck in empty scroll
    const animatedSectionIds = ["problem", "features", "architecture", "how", "capabilities"];
    const readableSectionIds = ["tokens", "impact", "roadmap"];
    const SLOW = 3.5;   // ~210 px/s — dense animated sections (5-card cave, 6-card capabilities)
    const MEDIUM = 3;   // ~180 px/s — slow enough to read card grids
    const FAST = 11;    // ~660 px/s

    // Absolute document-top of an element, robust to positioned ancestors
    // (e.g. SceneWrapper wraps sections in a `relative` div, which makes
    // `offsetTop` return a small value relative to the wrapper, not the doc).
    const absTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

    const pxPerFrame = (): number => {
      const y = window.scrollY;
      const h = window.innerHeight;
      // Sticky animated sections: slow across the full sticky scroll range
      for (const id of animatedSectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = absTop(el);
        const bottom = top + el.offsetHeight - h;
        if (y >= top && y <= bottom) return SLOW;
      }
      // Card-grid sections: slow while any portion of the section is on screen
      for (const id of readableSectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = absTop(el);
        const bottom = top + el.offsetHeight;
        if (y + h >= top && y <= bottom) return MEDIUM;
      }
      return FAST;
    };

    const step = () => {
      if (!playingRef.current) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentY = window.scrollY;
      if (currentY >= maxScroll - 1) {
        stopPlay();
        return;
      }
      window.scrollTo(0, Math.min(currentY + pxPerFrame(), maxScroll));
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  // Stop on any user-initiated input (wheel / touch / keys) — the user taking
  // over is the only way to end the tour now that there's no pause button.
  useEffect(() => {
    if (!playing) return;
    const cancel = () => stopPlay();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", "Space", "Escape"].includes(e.code)) {
        stopPlay();
      }
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing]);

  // Hide when user is at the very bottom of the page
  useEffect(() => {
    const check = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setAtBottom(window.scrollY >= maxScroll - 20);
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  // First-appearance hint: show after a brief delay, auto-dismiss on timeout or scroll
  useEffect(() => {
    const showTimer = setTimeout(() => setHintVisible(true), 2200);
    const hideTimer = setTimeout(() => dismissHint(), 11000);
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.35) dismissHint();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const showHint = hintVisible && !hintDismissed && !playing;
  // Hide entire control while the tour is running — user scrolls to stop.
  const hidden = atBottom || playing;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[95] flex items-center gap-3 transition-all duration-400 ${
        hidden ? "opacity-0 pointer-events-none translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      {/* First-time hint bubble */}
      <div
        className={`relative hidden sm:flex items-center rounded-full bg-black/85 backdrop-blur-md border border-purple-400/40 pl-4 pr-5 py-2.5 shadow-[0_0_28px_rgba(159,41,255,0.3)] transition-all duration-400 ${
          showHint ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
        }`}
        aria-hidden={!showHint}
      >
        <span className="text-purple-100 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap font-general">
          Watch the pitch — scroll anytime to exit
        </span>
        <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-black/85 border-r border-t border-purple-400/40" />
      </div>

      {/* Play button (single-state — hides while tour runs) */}
      <button
        onClick={startPlay}
        aria-label="Start auto-scroll tour"
        className="hoverable group"
      >
        <div
          className="relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full text-white transition-all duration-200 hover:scale-[1.04] active:scale-95"
          style={{
            background: "#9f29ff",
            boxShadow: "0 0 32px rgba(139, 92, 246, 0.45), 0 12px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Attention pulse — only while the hint is active */}
          {showHint && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "2px solid #a78bfa" }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          <div className="relative w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ transform: "translateX(1px)" }}>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </div>
          <span className="text-[10px] tracking-[0.22em] uppercase font-general whitespace-nowrap pr-0.5">
            Play Tour
          </span>
        </div>
      </button>
    </div>
  );
}

function ProblemSection() {
  const { sectionRef, progress } = useStageSection();
  const problems = [
    {
      stat: "$10",
      statSub: "per $100 swap",
      title: "EXPENSIVE",
      description: "Ethereum gas burns retail traders alive. A $100 trade shouldn't cost $10 in fees — but it does.",
      color: "#c4b5fd",
    },
    {
      stat: "5+",
      statSub: "DEXs to check",
      title: "FRAGMENTED",
      description: "Liquidity scattered across Uniswap, Curve, Balancer. Users compare manually. MEV takes the rest.",
      color: "#a78bfa",
    },
    {
      stat: "300M+",
      statSub: "locked out",
      title: "EXCLUSIONARY",
      description: "Indonesia has no IDR on-ramp to global DeFi. The world's 4th-largest population is invisible.",
      color: "#9f29ff",
    },
  ];

  // Title: hero → top
  const titleProgress = smoothstep(0.05, 0.22, progress);
  const titleTopVh = 40 - 32 * titleProgress;
  const titleScale = 1.3 - 0.3 * titleProgress;
  const titleOpacity = progress < 0.80 ? 1 : Math.max(0, 1 - (progress - 0.80) / 0.06);

  // Card grid slots — 3 cards in a row, never overlapping after settled
  const problemSlots = [
    { x: -30, y: 0 },
    { x: 0, y: 0 },
    { x: 30, y: 0 },
  ];
  const entryStart = 0.20;
  const entryDuration = 0.08;
  const stagger = 0.11; // ~30vh of dwell between cards so users don't miss them

  const activeIndex = Math.min(
    problems.length - 1,
    Math.max(0, Math.floor((progress - entryStart) / stagger))
  );

  // Cards settle, dwell, then fade out so end message can take over
  const cardFadeStart = 0.62;
  const cardFadeEnd = 0.72;
  const cardGlobalAlpha = progress < cardFadeStart
    ? 1
    : progress < cardFadeEnd
      ? 1 - (progress - cardFadeStart) / (cardFadeEnd - cardFadeStart)
      : 0;

  // End message — fades in and holds for generous readability
  const endMessageOpacity = smoothstep(0.68, 0.80, progress);
  const exitFade = Math.max(0, (progress - 0.94) / 0.06);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="problem"
      className="snap-section relative h-[500vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-96 w-96 rounded-full bg-purple-500/6 blur-[150px]" />
          <div className="absolute right-[15%] bottom-[15%] h-96 w-96 rounded-full bg-purple-400/5 blur-[180px]" />
        </div>

        <div
          className="absolute inset-x-0 z-20 px-6 text-center"
          style={{
            top: `${titleTopVh}vh`,
            transform: `scale(${titleScale})`,
            transformOrigin: "center center",
            opacity: titleOpacity,
            willChange: "top, transform, opacity",
          }}
        >
          <p className="text-purple-300/60 text-[10px] tracking-[0.6em] uppercase mb-3 font-general">
            The Problem
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-zentry tracking-tight leading-[1.1]">
            DEFI IS <span className="italic text-purple-300">BROKEN</span>
          </h2>
          <p className="text-white/40 text-xs md:text-sm max-w-lg mx-auto mt-4" style={{ fontFamily: "Inter, sans-serif" }}>
            Three failures. Scroll to see each.
          </p>
        </div>

        <div className="absolute inset-x-0 top-[22vh] md:top-[25vh] bottom-0 z-10 flex items-center justify-center px-6">
          {problems.map((problem, i) => {
            const { opacity, translateX, translateY, rotate, scale, zIndex } = getRevealLayout(
              progress, i, problemSlots[i], entryStart, entryDuration, stagger, 0.92
            );
            if (opacity <= 0.01 && cardGlobalAlpha <= 0.01) return null;
            return (
              <div
                key={problem.title}
                className="absolute inset-0 flex items-center justify-center px-6"
                style={{
                  opacity: opacity * cardGlobalAlpha,
                  transform: `translate(${translateX}vw, ${translateY}vh) scale(${scale}) rotate(${rotate}deg)`,
                  zIndex,
                }}
              >
                <div
                  className="relative w-full max-w-xs p-6 md:p-8 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(12, 14, 25, 0.88)",
                    border: `1px solid ${problem.color}50`,
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    boxShadow: `0 50px 100px -20px ${problem.color}30, 0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${problem.color}, transparent)` }}
                  />
                  <div
                    className="absolute -right-3 -top-4 text-[120px] font-black leading-none select-none"
                    style={{ fontFamily: "Space Grotesk, sans-serif", color: `${problem.color}0D` }}
                  >
                    0{i + 1}
                  </div>

                  <div className="relative z-10">
                    <div
                      className="text-4xl md:text-5xl font-black tracking-tight mb-2"
                      style={{ color: problem.color, fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {problem.stat}
                    </div>
                    <p className="text-white/40 text-[10px] md:text-xs tracking-wider uppercase mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                      {problem.statSub}
                    </p>

                    <div className="w-12 h-0.5 rounded-full mb-4" style={{ background: problem.color }} />

                    <h3
                      className="text-white text-lg md:text-xl font-bold tracking-wide mb-3"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {problem.title}
                    </h3>
                    <p className="text-white/55 text-xs md:text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                      {problem.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="absolute inset-x-0 top-[22vh] md:top-[25vh] bottom-0 z-10 flex items-center justify-center px-6 pointer-events-none"
          style={{ opacity: endMessageOpacity }}
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/40" />
              <p className="text-white/70 text-[10px] tracking-[0.4em] uppercase font-general">So we built</p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/40" />
            </div>
            <h3 className="text-white text-5xl md:text-7xl font-zentry tracking-tight leading-[1.1]">
              RUPIAH<span className="italic text-purple-400">ROUTE</span>
            </h3>
          </div>
        </div>

        {progress > 0.18 && progress < 0.68 && (
          <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30">
            <StageIndicator count={problems.length} active={activeIndex} color="rgba(167, 139, 250, 0.8)" />
          </div>
        )}

        {exitFade > 0 && (
          <div className="absolute inset-0 z-40 bg-black pointer-events-none" style={{ opacity: exitFade }} />
        )}
      </div>
    </section>
  );
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 40%"],
  });
  const animated = useTransform(scrollYProgress, [0, 1], [0, value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    return animated.on("change", (v) => setDisplay(v));
  }, [animated]);

  return <span ref={ref}>{display.toFixed(decimals)}</span>;
}

function StatsSection() {
  const stats = [
    { value: 100, unit: "ms", label: "Block Time", sublabel: "75× faster than Ethereum", color: "#67e8f9" },
    { value: 99, unit: "%", label: "Gas Saved", sublabel: "vs mainnet baseline", color: "#22d3ee" },
    { value: 5, unit: "+", label: "Route Sources", sublabel: "scanned per swap", color: "#06b6d4" },
    { value: 3, unit: "", label: "Languages", sublabel: "EN · ID · ZH", color: "#0891b2" },
    { value: 0.3, unit: "%", label: "Swap Fee", sublabel: "transparent, on-chain", decimals: 1, color: "#22d3ee" },
    { value: 7, unit: "s", label: "End-to-End", sublabel: "signed to finalized", color: "#67e8f9" },
  ];

  return (
    <section id="impact" className="snap-section relative z-10 py-24 md:py-32 bg-black overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(159,41,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(159,41,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]"
          style={{
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 md:mb-16"
        >
          <p className="text-cyan-400/60 text-[10px] tracking-[0.6em] uppercase mb-4 font-general">
            By the Numbers
          </p>
          <h2 className="text-white text-4xl md:text-6xl font-zentry tracking-tight leading-[1.1]">
            PROOF IN <span className="italic text-cyan-400">NUMBERS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div
                className="relative p-6 md:p-8 rounded-2xl h-full overflow-hidden"
                style={{
                  background: "rgba(10, 12, 22, 0.7)",
                  border: `1px solid ${stat.color}25`,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 16px 40px -12px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${stat.color}70, transparent)` }}
                />
                <div className="relative z-10">
                  <div
                    className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-2 flex items-baseline gap-1"
                    style={{ color: stat.color, fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    <AnimatedNumber value={stat.value} decimals={stat.decimals ?? 0} />
                    <span className="text-2xl md:text-3xl lg:text-4xl">{stat.unit}</span>
                  </div>
                  <p className="text-white/80 text-sm md:text-base font-bold tracking-wide mb-1" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {stat.label}
                  </p>
                  <p className="text-white/40 text-xs tracking-wide" style={{ fontFamily: "Inter, sans-serif" }}>
                    {stat.sublabel}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { sectionRef, progress } = useStageSection();
  const steps = [
    {
      num: "01",
      title: "ENTER",
      short: "Pick tokens + amount",
      description: "Select input (IDRX, USDC) and output (WETH, TIA). Enter amount. That's it.",
      color: "#67e8f9",
    },
    {
      num: "02",
      title: "SCAN",
      short: "5 routes in parallel",
      description: "Engine queries Initia AMM + LiFi + OpenOcean + KyberSwap + ParaSwap simultaneously.",
      color: "#22d3ee",
    },
    {
      num: "03",
      title: "COMPARE",
      short: "Best path wins",
      description: "Routes ranked by output minus gas. Direct, multi-hop, and cross-chain all considered.",
      color: "#06b6d4",
    },
    {
      num: "04",
      title: "EXECUTE",
      short: "7 seconds, one click",
      description: "Atomic swap on Initia L2. Finalized in ~7s. Near-zero gas. Done.",
      color: "#0891b2",
    },
  ];

  const titleProgress = smoothstep(0.05, 0.22, progress);
  const titleTopVh = 40 - 32 * titleProgress;
  const titleScale = 1.3 - 0.3 * titleProgress;
  const titleOpacity = progress < 0.92 ? 1 : Math.max(0, 1 - (progress - 0.92) / 0.06);

  // 4 steps in a horizontal row
  const stepSlots = [
    { x: -33, y: 0 },
    { x: -11, y: 0 },
    { x: 11, y: 0 },
    { x: 33, y: 0 },
  ];
  const entryStart = 0.20;
  const entryDuration = 0.08;
  const stagger = 0.12; // dwell between steps
  const activeIndex = Math.min(
    steps.length - 1,
    Math.max(0, Math.floor((progress - entryStart) / stagger))
  );

  const exitFade = Math.max(0, (progress - 0.94) / 0.06);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="how"
      className="snap-section relative h-[500vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-cyan-500/5 blur-[200px]" />
        </div>

        <div
          className="absolute inset-x-0 z-20 px-6 text-center"
          style={{
            top: `${titleTopVh}vh`,
            transform: `scale(${titleScale})`,
            transformOrigin: "center center",
            opacity: titleOpacity,
            willChange: "top, transform, opacity",
          }}
        >
          <p className="text-cyan-400/60 text-[10px] tracking-[0.6em] uppercase mb-3 font-general">
            How it Works
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-zentry tracking-tight leading-[1.1]">
            FOUR STEPS, <span className="italic text-cyan-400">SEVEN SECONDS</span>
          </h2>
        </div>

        <div className="absolute inset-x-0 top-[22vh] md:top-[25vh] bottom-0 z-10 flex items-center justify-center px-6">
          {steps.map((step, i) => {
            const { opacity, translateX, translateY, rotate, scale, zIndex } = getRevealLayout(
              progress, i, stepSlots[i], entryStart, entryDuration, stagger, 0.88
            );
            if (opacity <= 0.01) return null;
            return (
              <div
                key={step.num}
                className="absolute inset-0 flex items-center justify-center px-6"
                style={{
                  opacity,
                  transform: `translate(${translateX}vw, ${translateY}vh) scale(${scale}) rotate(${rotate}deg)`,
                  zIndex,
                }}
              >
                <div className="flex flex-col items-center text-center max-w-[20vw] md:max-w-[18vw]">
                  <div className="relative mb-5 md:mb-7">
                    <div
                      className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center relative"
                      style={{
                        background: "rgba(10, 12, 22, 0.95)",
                        border: `3px solid ${step.color}`,
                        boxShadow: `0 0 40px ${step.color}60, 0 0 80px ${step.color}20, inset 0 0 30px ${step.color}20`,
                      }}
                    >
                      <span
                        className="text-4xl md:text-5xl font-black"
                        style={{ color: step.color, fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {step.num}
                      </span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: step.color }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.55, 0, 0.55] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>

                  <h3
                    className="text-white text-xl md:text-2xl font-bold tracking-wide mb-1"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-xs md:text-sm font-medium mb-3"
                    style={{ color: step.color, fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {step.short}
                  </p>
                  <p className="text-white/55 text-xs md:text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {progress > 0.18 && progress < 0.94 && (
          <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30">
            <StageIndicator count={steps.length} active={activeIndex} color="rgba(34, 211, 238, 0.8)" />
          </div>
        )}

        {exitFade > 0 && (
          <div className="absolute inset-0 z-40 bg-black pointer-events-none" style={{ opacity: exitFade }} />
        )}
      </div>
    </section>
  );
}

function AdvancedCapabilitiesSection() {
  const { sectionRef, progress } = useStageSection();
  const capabilities = [
    {
      title: "LIMIT ORDERS",
      tagline: "Set the price. Walk away.",
      description: "Place orders at target price. Keepers execute on-chain when the market hits. 0.1% executor fee. Fully decentralized.",
      color: "#c4b5fd",
    },
    {
      title: "BATCH SWAP",
      tagline: "Rebalance in one transaction.",
      description: "Split one input across multiple outputs. Atomic execution. Built for portfolios that move together or not at all.",
      color: "#b197fc",
    },
    {
      title: "SEND TO USERNAME",
      tagline: "alice.init → just works.",
      description: "Transfer to .init usernames. Resolved on-chain via Cosmos precompile. No more copy-paste addresses, no more typos.",
      color: "#a78bfa",
    },
    {
      title: "ROUTE COMPARISON",
      tagline: "LiFi · OpenOcean · KyberSwap · ParaSwap",
      description: "We query four external aggregators in parallel with our on-chain router. You see every quote, ranked. You pick.",
      color: "#9370db",
    },
    {
      title: "TRILINGUAL UX",
      tagline: "EN · ID · ZH",
      description: "Bahasa Indonesia first-class. Mandarin supported. IDR formatting native. Built for global users, not just Western.",
      color: "#9f29ff",
    },
    {
      title: "IDR GATEWAY",
      tagline: "300M users. On-chain.",
      description: "IDRX as the anchor. Indonesia's first DeFi-native on-ramp. The world's 4th-largest nation, finally a first-class citizen.",
      color: "#7c3aed",
    },
  ];

  const titleProgress = smoothstep(0.05, 0.22, progress);
  const titleTopVh = 40 - 32 * titleProgress;
  const titleScale = 1.3 - 0.3 * titleProgress;
  const titleOpacity = progress < 0.92 ? 1 : Math.max(0, 1 - (progress - 0.92) / 0.06);

  // 6 cards in a 3×2 grid — bottom row raised so it doesn't crowd the viewport bottom
  const capSlots = [
    { x: -30, y: -20 }, { x: 0, y: -20 }, { x: 30, y: -20 },
    { x: -30, y: 14 },  { x: 0, y: 14 },  { x: 30, y: 14 },
  ];
  const entryStart = 0.20;
  const entryDuration = 0.08;
  const stagger = 0.09; // dwell between cards
  const activeIndex = Math.min(
    capabilities.length - 1,
    Math.max(0, Math.floor((progress - entryStart) / stagger))
  );

  const exitFade = Math.max(0, (progress - 0.94) / 0.06);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="capabilities"
      className="snap-section relative h-[600vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[10%] top-[15%] h-96 w-96 rounded-full bg-purple-500/6 blur-[180px]" />
          <div className="absolute left-[10%] bottom-[15%] h-96 w-96 rounded-full bg-purple-400/5 blur-[180px]" />
        </div>

        <div
          className="absolute inset-x-0 z-20 px-6 text-center"
          style={{
            top: `${titleTopVh}vh`,
            transform: `scale(${titleScale})`,
            transformOrigin: "center center",
            opacity: titleOpacity,
            willChange: "top, transform, opacity",
          }}
        >
          <p className="text-purple-400/60 text-[10px] tracking-[0.6em] uppercase mb-3 font-general">
            Beyond the Swap
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-zentry tracking-tight leading-[1.1]">
            THE <span className="italic text-purple-400">FULL STACK</span>
          </h2>
        </div>

        <div className="absolute inset-x-0 top-[22vh] md:top-[25vh] bottom-0 z-10 flex items-center justify-center px-6">
          {capabilities.map((cap, i) => {
            const { opacity, translateX, translateY, rotate, scale, zIndex } = getRevealLayout(
              progress, i, capSlots[i], entryStart, entryDuration, stagger, 0.88
            );
            if (opacity <= 0.01) return null;
            return (
              <div
                key={cap.title}
                className="absolute inset-0 flex items-center justify-center px-6"
                style={{
                  opacity,
                  transform: `translate(${translateX}vw, ${translateY}vh) scale(${scale}) rotate(${rotate}deg)`,
                  zIndex,
                }}
              >
                <div
                  className="relative w-full max-w-sm p-6 md:p-8 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(10, 12, 22, 0.88)",
                    border: `1px solid ${cap.color}55`,
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    boxShadow: `0 30px 60px -15px ${cap.color}30, 0 0 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-70"
                    style={{ background: `radial-gradient(circle at center, ${cap.color}15, transparent 70%)` }}
                  />
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${cap.color}, transparent)` }}
                  />

                  <div className="relative z-10 text-center">
                    <div
                      className="text-[10px] md:text-xs tracking-[0.4em] uppercase mb-2 font-general"
                      style={{ color: `${cap.color}` }}
                    >
                      {String(i + 1).padStart(2, "0")} / {String(capabilities.length).padStart(2, "0")}
                    </div>
                    <p
                      className="text-xs tracking-[0.2em] uppercase mb-3"
                      style={{ color: `${cap.color}DD`, fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {cap.tagline}
                    </p>
                    <h3
                      className="text-white text-xl md:text-2xl font-bold tracking-wide mb-3"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {cap.title}
                    </h3>
                    <div
                      className="w-10 h-0.5 rounded-full mx-auto mb-3"
                      style={{ background: cap.color, boxShadow: `0 0 8px ${cap.color}` }}
                    />
                    <p className="text-white/65 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                      {cap.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {progress > 0.18 && progress < 0.94 && (
          <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30">
            <StageIndicator count={capabilities.length} active={activeIndex} color="rgba(167, 139, 250, 0.8)" />
          </div>
        )}

        {exitFade > 0 && (
          <div className="absolute inset-0 z-40 bg-black pointer-events-none" style={{ opacity: exitFade }} />
        )}
      </div>
    </section>
  );
}

function RoadmapSection() {
  const phases = [
    {
      phase: "01",
      status: "Shipping",
      statusColor: "#c4b5fd",
      period: "Q2 2026",
      title: "MVP Launch",
      description: "Core protocol deployed. Feature-complete DeFi stack on Initia L2.",
      items: ["Smart Swap + routing", "Limit Orders (keeper-based)", "Batch Swap rebalancer", "L1 ↔ L2 Bridge", "Multi-language UX"],
      color: "#a78bfa",
    },
    {
      phase: "02",
      status: "Up next",
      statusColor: "#a78bfa",
      period: "Q3 2026",
      title: "Multi-L2 Routing",
      description: "Expand quote sources across Arbitrum, Optimism, Base. Failover when Initia is congested.",
      items: ["Arbitrum integration", "Optimism integration", "Automatic failover", "Gas optimization v2"],
      color: "#9f29ff",
    },
    {
      phase: "03",
      status: "On deck",
      statusColor: "#9f29ff",
      period: "Q4 2026",
      title: "Mainnet + EIR",
      description: "Graduate from testnet to production. Enter Initia's Entrepreneur in Residence program.",
      items: ["Initia mainnet launch", "EIR admission", "Security audit", "Fundraising round"],
      color: "#7c3aed",
    },
    {
      phase: "04",
      status: "Horizon",
      statusColor: "#a78bfa",
      period: "2027 →",
      title: "Intelligence Layer",
      description: "AI-driven route advice. Messaging-app native swaps. Confidential settlement.",
      items: ["AI route advisor", "Telegram bot interface", "Confidential swaps (iExec Nox)", "Cross-chain aggregator"],
      color: "#6d28d9",
    },
  ];

  return (
    <section
      id="roadmap"
      className="snap-section relative bg-black py-24 md:py-32 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(159,41,255,0.08),transparent_60%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20 md:mb-28"
        >
          <p className="text-purple-400/60 text-[10px] tracking-[0.6em] uppercase mb-4 font-general">
            Roadmap
          </p>
          <h2 className="text-white text-4xl md:text-6xl font-zentry tracking-tight leading-[1.1]">
            THE <span className="italic text-purple-400">JOURNEY</span>
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto mt-6" style={{ fontFamily: "Inter, sans-serif" }}>
            From hackathon MVP to multi-L2 aggregator to AI-native swap layer.
            Each phase unlocks the next.
          </p>
        </motion.div>

        {/* Vertical timeline — regular scroll flow within the section */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central line */}
          <div
            className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(196,181,253,0.4) 15%, rgba(167,139,250,0.4) 40%, rgba(159,41,255,0.4) 65%, rgba(124,58,237,0.4) 85%, rgba(109,40,217,0.4) 95%, transparent 100%)",
            }}
          />

          {phases.map((phase, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.35 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className={`relative flex items-start mb-20 md:mb-28 last:mb-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Phase dot on the timeline */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 top-6 z-10">
                  <div className="relative">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{
                        background: phase.color,
                        boxShadow: `0 0 16px ${phase.color}, 0 0 32px ${phase.color}40`,
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${phase.color}` }}
                      animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* Spacer for desktop alternating layout */}
                <div className="hidden md:block md:flex-1" />

                {/* Phase card */}
                <div className="flex-1 pl-20 md:pl-0 md:max-w-[45%]">
                  <div
                    className="relative p-7 md:p-8 rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(10, 12, 22, 0.82)",
                      border: `1px solid ${phase.color}45`,
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: `0 30px 60px -15px ${phase.color}25, 0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${phase.color}, transparent)` }}
                    />
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-40"
                      style={{ background: `radial-gradient(circle at top right, ${phase.color}20, transparent 60%)` }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="text-6xl md:text-7xl font-black leading-none"
                          style={{ color: `${phase.color}45`, fontFamily: "Space Grotesk, sans-serif" }}
                        >
                          {phase.phase}
                        </span>
                        <span
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase"
                          style={{
                            background: `${phase.statusColor}18`,
                            color: phase.statusColor,
                            border: `1px solid ${phase.statusColor}55`,
                            fontFamily: "Space Grotesk, sans-serif",
                            boxShadow: `0 0 16px ${phase.statusColor}30`,
                          }}
                        >
                          {phase.status}
                        </span>
                      </div>

                      <p className="text-white/45 text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                        {phase.period}
                      </p>
                      <h3
                        className="text-white text-xl md:text-2xl font-bold tracking-wide mb-3"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {phase.title}
                      </h3>
                      <p className="text-white/60 text-sm md:text-base leading-relaxed mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
                        {phase.description}
                      </p>

                      <ul className="space-y-2">
                        {phase.items.map((item, idx) => (
                          <motion.li
                            key={item}
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 0.45, delay: 0.35 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center gap-3 text-white/70 text-sm"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: phase.color, boxShadow: `0 0 8px ${phase.color}` }}
                            />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    const handleScroll = () => { scrollYRef.current = window.scrollY; };
    const handleMouseMove = (e: MouseEvent) => { mousePosRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white" style={{ overflowX: "clip" }}>
      <LoadingScreen isLoading={isLoading} />
      <CustomCursor />

      <style jsx global>{`
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
          gap: 6px;
          text-transform: uppercase;
          line-height: 1.1;
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
        
        html {
          scroll-behavior: auto;
          scroll-padding-top: 80px;
        }
        body { cursor: default; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
          <Scene3D scrollYRef={scrollYRef} mousePosRef={mousePosRef} />
        </Canvas>
      </div>

      <div className="relative z-10">
        <Navigation />
        <HeroSection scrollYRef={scrollYRef} />
        <ProblemSection />
        <FeaturesSection />
        <StorySection />
        <SceneWrapper intensity="normal"><TokensSection /></SceneWrapper>
        <HowItWorksSection />
        <AdvancedCapabilitiesSection />
        <SceneWrapper intensity="subtle"><StatsSection /></SceneWrapper>
        <SceneWrapper intensity="subtle"><RoadmapSection /></SceneWrapper>
        <SceneWrapper intensity="subtle"><CTASection /></SceneWrapper>
        <Footer />
      </div>
      <AutoPlayButton />
      <BackToTopButton />
    </div>
  );
}
