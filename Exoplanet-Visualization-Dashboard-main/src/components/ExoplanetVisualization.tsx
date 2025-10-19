import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
interface ExoplanetVisualizationProps {
  texturePath: string;
  atmosphereColor?: string;
  rotationSpeed?: number;
  size?: number;
}
const ExoplanetVisualization: React.FC<ExoplanetVisualizationProps> = ({
  texturePath,
  atmosphereColor = '#4299e1',
  rotationSpeed = 0.001,
  size = 2
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetRef = useRef<THREE.Mesh | null>(null);
  const frameId = useRef<number | null>(null);
  useEffect(() => {
    if (!mountRef.current) return;
    // Scene setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    // Planet
    const textureLoader = new THREE.TextureLoader();
    const planetGeometry = new THREE.SphereGeometry(size, 64, 64);
    textureLoader.load(texturePath, texture => {
      const planetMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.2
      });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      scene.add(planet);
      planetRef.current = planet;
      // Atmosphere (if color provided)
      if (atmosphereColor) {
        const atmosphereGeometry = new THREE.SphereGeometry(size * 1.1, 64, 64);
        const atmosphereMaterial = new THREE.MeshStandardMaterial({
          color: atmosphereColor,
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);
      }
    });
    // Animation
    const animate = () => {
      if (planetRef.current) {
        planetRef.current.rotation.y += rotationSpeed;
      }
      renderer.render(scene, camera);
      frameId.current = requestAnimationFrame(animate);
    };
    animate();
    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId.current !== null) {
        cancelAnimationFrame(frameId.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [texturePath, atmosphereColor, rotationSpeed, size]);
  return <div ref={mountRef} className="w-full h-full min-h-[300px]" />;
};
export default ExoplanetVisualization;