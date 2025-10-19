import React, { useEffect, useRef } from 'react';

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star properties
    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
    }

    const stars: Star[] = [];
    const numStars = 200;
    const maxDepth = 1000;

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * maxDepth,
        size: Math.random() * 2,
        speed: 0.2 + Math.random() * 0.3
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      stars.forEach(star => {
        // Move star forward
        star.z -= star.speed;

        // Reset star if it goes past camera
        if (star.z <= 0) {
          star.z = maxDepth;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        // Project 3D to 2D
        const scale = 1000 / (1000 + star.z);
        const x = star.x * scale + centerX;
        const y = star.y * scale + centerY;
        const size = star.size * scale;
        const opacity = 1 - star.z / maxDepth;

        // Draw star with glow
        ctx.fillStyle = `rgba(200, 220, 255, ${opacity * 0.8})`;
        ctx.shadowBlur = size * 3;
        ctx.shadowColor = `rgba(100, 180, 255, ${opacity * 0.5})`;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw star trail
        const prevScale = 1000 / (1000 + star.z + 10);
        const prevX = star.x * prevScale + centerX;
        const prevY = star.y * prevScale + centerY;
        
        ctx.strokeStyle = `rgba(150, 180, 255, ${opacity * 0.3})`;
        ctx.lineWidth = size * 0.5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default StarfieldBackground;