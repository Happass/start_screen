import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Pin } from "./Pin";
import { CameraRig } from "./CameraRig";
import { MapModal } from "./MapModal";

// 緯度経度 → XYZ 座標変換
const toXYZ = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// XYZ座標 → 緯度経度 変換
const fromXYZ = (position: THREE.Vector3, radius: number) => {
  const x = position.x;
  const y = position.y;
  const z = position.z;

  const lat = (Math.PI / 2 - Math.acos(y / radius)) * (180 / Math.PI);
  const lon = Math.atan2(z, -x) * (180 / Math.PI) - 180;

  return { lat, lon };
};

export default function Globe() {
  const [target] = useState<THREE.Vector3 | null>(null);
  const [mapModal, setMapModal] = useState<{
    isOpen: boolean;
    lat: number;
    lon: number;
    name?: string;
  }>({ isOpen: false, lat: 0, lon: 0 });

  // 地図を表示する関数
  const showMap = (position: THREE.Vector3, name?: string) => {
    const { lat, lon } = fromXYZ(position, 1.01);
    setMapModal({ isOpen: true, lat, lon, name });
  };

  // Generate 30 random positions on the globe surface
  const randomPins = Array.from({ length: 30 }, () => {
    const lat = Math.random() * 180 - 90; // -90 to 90
    const lon = Math.random() * 360 - 180; // -180 to 180
    return { position: toXYZ(lat, lon, 1.01), lat, lon };
  });

  return (
    <>
    <Canvas
      camera={{ position: [0, 0, 5] }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      {/* カメラワープ制御 */}
      <CameraRig target={target} />

      {/* 星空背景 */}
      <Stars radius={300} depth={60} count={20000} factor={7} />

      {/* 地球本体 */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial
          map={new THREE.TextureLoader().load(
            "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
          )}
        />
      </Sphere>

      {/* ピン：東京（固定、クリックで地図表示） */}
      <Pin
        position={toXYZ(35.6895, 139.6917, 1.01)}
        color="cyan"
        onClick={() => showMap(toXYZ(35.6895, 139.6917, 1.01), "東京")}
      />

      {/* ピン：ニューヨーク（クリックで地図表示） */}
      <Pin
        position={toXYZ(40.7128, -74.006, 1.01)}
        color="magenta"
        onClick={() => showMap(toXYZ(40.7128, -74.006, 1.01), "ニューヨーク")}
      />

      {/* 30個の小さなhana.png画像をランダムに配置 */}
      {randomPins.map((pin, idx) => (
        <mesh
          key={idx}
          position={pin.position}
          scale={[0.1, 0.1, 0.1]}
          onClick={() => showMap(pin.position, `ランダムピン ${idx + 1}`)}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={new THREE.TextureLoader().load("/hana.png")}
            transparent
          />
        </mesh>
      ))}

      {/* 照明 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />

      {/* マウス操作 */}
      <OrbitControls />
    </Canvas>

    {/* 地図モーダル */}
    <MapModal
      isOpen={mapModal.isOpen}
      onClose={() => setMapModal({ ...mapModal, isOpen: false })}
      latitude={mapModal.lat}
      longitude={mapModal.lon}
      locationName={mapModal.name}
    />
    </>
  );
}