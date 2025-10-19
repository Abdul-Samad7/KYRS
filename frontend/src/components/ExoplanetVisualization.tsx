import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ExoplanetVisualizationProps {
  texturePath?: string;
  atmosphereColor?: string;
  planetColor?: string;
  rotationSpeed?: number;
  size?: number;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
}

const ExoplanetVisualization: React.FC<ExoplanetVisualizationProps> = ({
  texturePath = '',
  atmosphereColor = '#4299e1',
  planetColor = '#4a90e2',
  rotationSpeed = 0.001,
  size = 2,
  emissiveIntensity = 0.2,
  roughness = 0.7,
  metalness = 0.2
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0x88ccff, 1.2);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);

    // Atmospheric glow point light
    const atmosphereLight = new THREE.PointLight(atmosphereColor, 1.5, 100);
    atmosphereLight.position.set(0, 0, 3);
    scene.add(atmosphereLight);

    // Create procedural planet texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Generate texture based on planet color
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    const baseColor = new THREE.Color(planetColor);
    const darkColor = baseColor.clone().multiplyScalar(0.5);
    const lightColor = baseColor.clone().multiplyScalar(1.3);

    gradient.addColorStop(0, `#${lightColor.getHexString()}`);
    gradient.addColorStop(0.5, `#${baseColor.getHexString()}`);
    gradient.addColorStop(1, `#${darkColor.getHexString()}`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add noise/detail
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 3;
      const opacity = Math.random() * 0.3;
      ctx.fillStyle = `rgba(${Math.random() * 50}, ${Math.random() * 50}, ${Math.random() * 50}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // Create bump map for surface detail
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 512;
    const bumpCtx = bumpCanvas.getContext('2d')!;
    
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 2;
      const intensity = Math.random() * 255;
      bumpCtx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
      bumpCtx.beginPath();
      bumpCtx.arc(x, y, radius, 0, Math.PI * 2);
      bumpCtx.fill();
    }
    const bumpMap = new THREE.CanvasTexture(bumpCanvas);

    // Planet geometry with more detail
    const planetGeometry = new THREE.SphereGeometry(size, 128, 128);

    // Enhanced planet material
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      roughness: roughness,
      metalness: metalness,
      emissive: planetColor,
      emissiveIntensity: emissiveIntensity,
      envMapIntensity: 0.5
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.castShadow = true;
    planet.receiveShadow = true;
    scene.add(planet);
    planetRef.current = planet;

    // Add cloud layer for atmosphere-rich planets (roughness > 0.5)
    if (roughness > 0.5) {
      const cloudGeometry = new THREE.SphereGeometry(size * 1.01, 64, 64);
      
      // Create cloud texture
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 512;
      cloudCanvas.height = 512;
      const cloudCtx = cloudCanvas.getContext('2d')!;
      
      // Generate wispy clouds
      cloudCtx.fillStyle = 'rgba(255, 255, 255, 0)';
      cloudCtx.fillRect(0, 0, 512, 512);
      
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 10 + Math.random() * 30;
        const opacity = 0.1 + Math.random() * 0.3;
        
        const cloudGradient = cloudCtx.createRadialGradient(x, y, 0, x, y, radius);
        cloudGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        cloudCtx.fillStyle = cloudGradient;
        cloudCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
      
      const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
      
      const cloudMaterial = new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.4,
        depthWrite: false
      });
      
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      scene.add(clouds);
      cloudsRef.current = clouds;
    }

    // Enhanced atmosphere with layered effect
    const atmosphereGeometry = new THREE.SphereGeometry(size * 1.15, 64, 64);
    
    // Create custom shader for better atmosphere
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        atmosphereColor: { value: new THREE.Color(atmosphereColor) },
        intensity: { value: 0.8 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform float intensity;
        varying vec3 vNormal;
        
        void main() {
          float atmosphereStrength = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(atmosphereColor, atmosphereStrength * intensity);
        }
      `
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Add inner glow
    const innerGlowGeometry = new THREE.SphereGeometry(size * 1.08, 64, 64);
    const innerGlowMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        glowColor: { value: new THREE.Color(atmosphereColor) },
        intensity: { value: 0.3 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        varying vec3 vNormal;
        
        void main() {
          float glowStrength = pow(dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(glowColor, glowStrength * intensity);
        }
      `
    });
    
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    scene.add(innerGlow);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      if (planetRef.current) {
        planetRef.current.rotation.y += rotationSpeed;
        planetRef.current.rotation.x += rotationSpeed * 0.1;
        
        // Add subtle wobble for realism
        planetRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
      }
      
      // Rotate clouds slightly faster
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += rotationSpeed * 1.2;
      }
      
      // Gentle camera sway
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(time * 0.3) * 0.2;
        cameraRef.current.position.y = Math.cos(time * 0.2) * 0.2;
        cameraRef.current.lookAt(0, 0, 0);
      }
      
      // Rotate stars slowly
      stars.rotation.y += 0.0001;
      
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
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material?.dispose();
            }
          }
        });
        sceneRef.current.clear();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current?.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      texture.dispose();
      bumpMap.dispose();
    };
  }, [atmosphereColor, planetColor, rotationSpeed, size, emissiveIntensity, roughness, metalness]);

  return <div ref={mountRef} className="w-full h-full min-h-[300px]" />;
};

export default ExoplanetVisualization;