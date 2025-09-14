import { Vector3 } from "three";
import * as THREE from "three";
import { useRef, useMemo } from "react";

type FlowerProps = {
  position: Vector3;
  onClick?: () => void;
  texture: 'flower1' | 'flower2';
  scale?: number; // density-based scaling
};

// モジュールスコープの簡易テクスチャキャッシュ（重複ロード防止）
const textureCache: Record<string, THREE.Texture> = {};

export function Flower({ position, onClick, texture, scale = 0.15 }: FlowerProps) {
  const spriteRef = useRef<THREE.Sprite>(null);

  const textureUrl = useMemo(() => ({
    flower1: '/flower.PNG',
    flower2: '/flower2.png',
  }[texture]), [texture]);

  const mapTex = useMemo(() => {
    if (!textureCache[textureUrl]) {
      const t = new THREE.TextureLoader().load(textureUrl);
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.minFilter = THREE.LinearFilter; // 透明境界のギザつき軽減
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 4;
      textureCache[textureUrl] = t;
    }
    return textureCache[textureUrl];
  }, [textureUrl]);

  return (
    <sprite
      ref={spriteRef}
      position={position}
      onClick={onClick}
      scale={[scale, scale, 1]}
      renderOrder={2}
    >
      <spriteMaterial
        map={mapTex}
        transparent
        depthWrite={false}  // 透明のソート破綻を抑止
        depthTest={true}
        alphaTest={0.5}     // しきい値以下は描画しない（ハロー対策）
        fog={false}
      />
    </sprite>
  );
}
