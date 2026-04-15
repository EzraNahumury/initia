"use client";

import { useEffect, useRef } from "react";
import { Color, Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, PointLight } from "three";
import ThreeGlobe from "three-globe";

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: { lat: number; lng: number };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

export function World({ globeConfig, data }: WorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.offsetWidth || 360;
    const height = container.offsetHeight || 360;

    // Renderer
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new Scene();

    // Camera
    const camera = new PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.set(0, 0, 300);

    // Lights
    const ambientLight = new AmbientLight(
      new Color(globeConfig.ambientLight || "#38bdf8"),
      0.6
    );
    scene.add(ambientLight);

    const dirLight1 = new DirectionalLight(
      new Color(globeConfig.directionalLeftLight || "#ffffff"),
      1
    );
    dirLight1.position.set(-400, 100, 400);
    scene.add(dirLight1);

    const dirLight2 = new DirectionalLight(
      new Color(globeConfig.directionalTopLight || "#ffffff"),
      1
    );
    dirLight2.position.set(-200, 500, 200);
    scene.add(dirLight2);

    const pLight = new PointLight(
      new Color(globeConfig.pointLight || "#ffffff"),
      0.8
    );
    pLight.position.set(-200, 500, 200);
    scene.add(pLight);

    // Globe with Earth texture
    const globe = new ThreeGlobe({ animateIn: true })
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .showAtmosphere(globeConfig.showAtmosphere !== false)
      .atmosphereColor(globeConfig.atmosphereColor || "#3a8fd6")
      .atmosphereAltitude(globeConfig.atmosphereAltitude || 0.15);

    scene.add(globe);

    // Build point data from arcs
    interface GlobePoint {
      size: number;
      order: number;
      color: (t: number) => string;
      lat: number;
      lng: number;
    }
    const points: GlobePoint[] = [];
    for (const arc of data) {
      const rgb = hexToRgb(arc.color)!;
      const colorFn = (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`;
      points.push({ size: globeConfig.pointSize || 4, order: arc.order, color: colorFn, lat: arc.startLat, lng: arc.startLng });
      points.push({ size: globeConfig.pointSize || 4, order: arc.order, color: colorFn, lat: arc.endLat, lng: arc.endLng });
    }
    const filteredPoints = points.filter(
      (v, i, a) => a.findIndex((v2) => v2.lat === v.lat && v2.lng === v.lng) === i
    );

    // Arcs — three-globe accessor callbacks receive the arc datum
    globe
      .arcsData(data)
      .arcStartLat((d: object) => (d as Position).startLat)
      .arcStartLng((d: object) => (d as Position).startLng)
      .arcEndLat((d: object) => (d as Position).endLat)
      .arcEndLng((d: object) => (d as Position).endLng)
      .arcColor((e: object) => (e as Position).color)
      .arcAltitude((e: object) => (e as Position).arcAlt)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(globeConfig.arcLength || 0.9)
      .arcDashInitialGap((e: object) => (e as Position).order)
      .arcDashGap(15)
      .arcDashAnimateTime(() => globeConfig.arcTime || 1000);


    // Auto-rotation
    let rotY = 0;
    const autoRotateSpeed = globeConfig.autoRotateSpeed || 0.5;
    const shouldRotate = globeConfig.autoRotate !== false;

    // Animation loop
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (shouldRotate) {
        rotY += autoRotateSpeed * 0.002;
        globe.rotation.y = rotY;
      }
      renderer.render(scene, camera);
    }
    animId = requestAnimationFrame(animate);

    // Resize
    function onResize() {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }} />;
}
