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

  // 主要都市のピン情報
  const majorCities = [
    { name: "東京", lat: 35.6895, lon: 139.6917, color: "cyan" },
    { name: "ニューヨーク", lat: 40.7128, lon: -74.006, color: "magenta" },
    { name: "アムステルダム", lat: 52.3676, lon: 4.9041, color: "orange" },
    { name: "シドニー", lat: -33.8688, lon: 151.2093, color: "yellow" },
    { name: "サンパウロ", lat: -23.5505, lon: -46.6333, color: "lime" },
    { name: "ロンドン", lat: 51.5074, lon: -0.1278, color: "red" },
    { name: "パリ", lat: 48.8566, lon: 2.3522, color: "pink" },
    { name: "ベルリン", lat: 52.5200, lon: 13.4050, color: "lightblue" },
    { name: "ローマ", lat: 41.9028, lon: 12.4964, color: "gold" },
    { name: "マドリード", lat: 40.4168, lon: -3.7038, color: "purple" },
    { name: "モスクワ", lat: 55.7558, lon: 37.6173, color: "darkred" },
    { name: "北京", lat: 39.9042, lon: 116.4074, color: "crimson" },
    { name: "ムンバイ", lat: 19.0760, lon: 72.8777, color: "darkorange" },
    { name: "カイロ", lat: 30.0444, lon: 31.2357, color: "tan" },
    { name: "ケープタウン", lat: -33.9249, lon: 18.4241, color: "green" },
    { name: "リオデジャネイロ", lat: -22.9068, lon: -43.1729, color: "aqua" },
    { name: "メキシコシティ", lat: 19.4326, lon: -99.1332, color: "coral" },
    { name: "トロント", lat: 43.6532, lon: -79.3832, color: "lightgreen" },
    { name: "バンコク", lat: 13.7563, lon: 100.5018, color: "violet" },
    { name: "シンガポール", lat: 1.3521, lon: 103.8198, color: "turquoise" },
    { name: "メルボルン", lat: -37.8136, lon: 144.9631, color: "goldenrod" },
    { name: "オークランド", lat: -36.8485, lon: 174.7633, color: "lightcoral" },
    { name: "ウェリントン", lat: -41.2865, lon: 174.7762, color: "mediumseagreen" },
    { name: "ブラジリア", lat: -15.8267, lon: -47.9218, color: "forestgreen" },
  ];

  // Generate fewer random positions on the globe surface
  const randomPins = Array.from({ length: 15 }, () => {
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

      {/* 主要都市のピン */}
      {majorCities.map((city, idx) => (
        <Pin
          key={`city-${idx}`}
          position={toXYZ(city.lat, city.lon, 1.01)}
          color={city.color}
          onClick={() => showMap(toXYZ(city.lat, city.lon, 1.01), city.name)}
        />
      ))}

      {/* ランダムな場所に小さなhana.png画像を配置 */}
      {randomPins.map((pin, idx) => (
        <mesh
          key={`random-${idx}`}
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