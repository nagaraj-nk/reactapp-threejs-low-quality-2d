import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const Box = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
};

const Scene = () => {
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <Canvas camera={{ position: [3, 3, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Box />
      </Canvas>
    </div>
  );
};

export default Scene;
