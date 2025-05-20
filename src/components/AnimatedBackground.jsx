import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';

// Define a harmonious color palette (calm, techy theme)
const techColors = ['#5F9EA0', '#4682B4', '#ADD8E6']; // CadetBlue, SteelBlue, LightBlue

// Helper component for individual shapes
const FloatingShape = ({ initialPosition, color, rotationSpeedFactor, geometryType }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002 * rotationSpeedFactor;
      meshRef.current.rotation.y += 0.002 * rotationSpeedFactor;
    }
  });

  return (
    <mesh ref={meshRef} position={initialPosition}>
      {geometryType === 'tetrahedron' && <tetrahedronGeometry args={[0.5, 0]} />}
      {geometryType === 'cube' && <boxGeometry args={[0.8, 0.8, 0.8]} />}
      <meshStandardMaterial 
        color={color} 
        roughness={0.6} // Slightly less shiny
      />
    </mesh>
  );
};

// Component containing the main scene and scroll-linked animations
const SceneContent = () => {
  const { camera, scene } = useThree(); // Get scene object
  const scroll = useScroll();
  const initialCameraZ = 5; // Camera's initial Z position

  // Shape configuration
  const shapeCount = 15; // Increased number of shapes
  const shapes = useMemo(() => {
    return Array.from({ length: shapeCount }, (_, i) => {
      // Define the volume for shape distribution
      const x = THREE.MathUtils.randFloatSpread(14); // X between -7 and 7
      const y = THREE.MathUtils.randFloatSpread(10); // Y between -5 and 5
      const z = THREE.MathUtils.randFloat(-15, 0);   // Z between -15 (far) and 0 (closer to camera's initial plane)
      
      return {
        id: i,
        initialPosition: [x, y, z],
        color: techColors[i % techColors.length], // Cycle through the color palette
        rotationSpeedFactor: THREE.MathUtils.randFloat(0.5, 1.5), // Vary rotation speed
        geometryType: Math.random() > 0.5 ? 'cube' : 'tetrahedron', // Mix of shapes
      };
    });
  }, []);

  useFrame(() => {
    // Animate camera Z position based on scroll offset
    // scroll.offset goes from 0 to 1
    const targetZ = initialCameraZ - scroll.offset * 7; // Zoom in: move camera closer (decrease Z). Adjusted factor for less extreme zoom.
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05); // Smooth interpolation

    // Optional: Animate scene rotation based on scroll
    scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, scroll.offset * Math.PI * 0.1, 0.05); // Smooth rotation
    scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, scroll.offset * Math.PI * 0.05, 0.05); // Slight X rotation
  });
  

  return (
    <>
      <ambientLight intensity={0.8} /> {/* Slightly increased ambient light */}
      <directionalLight position={[5, 10, 7]} intensity={1.2} /> {/* Adjusted directional light */}
      
      {shapes.map(shape => (
        <FloatingShape 
          key={shape.id} 
          initialPosition={shape.initialPosition}
          color={shape.color}
          rotationSpeedFactor={shape.rotationSpeedFactor}
          geometryType={shape.geometryType}
        />
      ))}
    </>
  );
};

// Main AnimatedBackground component wrapper
const AnimatedBackground = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1, touchAction: 'none' }}> {/* Added touchAction: 'none' */}
      <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}>
        {/* ScrollControls pages determines the scroll range for animations. Adjust based on main content length. */}
        <ScrollControls pages={3} damping={0.1}> 
          <SceneContent />
        </ScrollControls>
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;
