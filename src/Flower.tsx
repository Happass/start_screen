import { Vector3 } from "three";
import * as THREE from "three";
import { useRef, useEffect } from "react";

type FlowerProps = {
  position: Vector3;
  onClick?: () => void;
  texture: 'flower1' | 'flower2' | 'flower3' | 'withered';
};

export function Flower({ position, onClick, texture }: FlowerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const textureUrl = {
    flower1: '/flower.PNG',
    flower2: '/flower2.png',
    flower3: '/flower3.png',
    withered: '/withered_flower.png',
  }[texture];

  // 静止状態での初期向き設定
  useEffect(() => {
    if (meshRef.current) {
      // 地球の中心から外向きに向かせる
      meshRef.current.lookAt(
        position.x * 2,
        position.y * 2,
        position.z * 2
      );
    }
  }, [position]);

  return (
    <mesh ref={meshRef} position={position} onClick={onClick} scale={[0.15, 0.15, 0.15]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={new THREE.TextureLoader().load(textureUrl, texture => {
          texture.center.set(0.5, 0.5);
          texture.needsUpdate = true;
          return texture;
        })}
        transparent
      />
    </mesh>
  );
}
