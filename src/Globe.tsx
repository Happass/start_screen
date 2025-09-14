import { useState, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { Flower } from "./Flower";
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

// 高品質な地球マテリアルコンポーネント
function EarthMaterial() {
  const [earthTexture, normalMap, specularMap] = useTexture([
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
    "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
  ]);

  return (
    <meshPhongMaterial
      map={earthTexture}
      normalMap={normalMap}
      specularMap={specularMap}
      shininess={100}
      transparent={false}
      side={THREE.FrontSide}
    />
  );
}

// 大気圏エフェクトコンポーネント
function Atmosphere() {
  return (
    <Sphere args={[1.02, 32, 32]}>
      <meshBasicMaterial
        color={0x87CEEB}
        transparent={true}
        opacity={0.15}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

// クリック可能な地球コンポーネント
function ClickableEarth({
  isPlacementMode,
  onPlaceFlower
}: {
  isPlacementMode: boolean;
  onPlaceFlower: (position: THREE.Vector3) => void;
}) {
  const { camera, raycaster } = useThree();
  const earthRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // 地球の回転アニメーションを停止
  // useEffect(() => {
  //   const animate = () => {
  //     if (groupRef.current) {
  //       groupRef.current.rotation.y += 0.001;
  //     }
  //     requestAnimationFrame(animate);
  //   };
  //   animate();
  // }, []);

  const handleClick = (event: any) => {
    if (!isPlacementMode || !earthRef.current) return;

    event.stopPropagation();

    // マウス座標を正規化デバイス座標に変換
    const rect = event.target.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // レイキャスト実行
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(earthRef.current);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const position = intersect.point.clone();
      position.normalize().multiplyScalar(1.01); // 地球表面より少し外側
      onPlaceFlower(position);
    }
  };

  return (
    <group ref={groupRef}>
      <Sphere
        ref={earthRef}
        args={[1, 128, 128]}
        onClick={handleClick}
        onPointerOver={(e) => {
          if (isPlacementMode && e.target) {
            (e.target as HTMLElement).style.cursor = 'crosshair';
          }
        }}
        onPointerOut={(e) => {
          if (e.target) {
            (e.target as HTMLElement).style.cursor = 'auto';
          }
        }}
      >
        <EarthMaterial />
      </Sphere>
      <Atmosphere />
    </group>
  );
}

// 星空を3D空間に配置するコンポーネント
function StarField() {
  const ref = useRef<THREE.Points>(null);
  const [geometry] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(200), // x
        THREE.MathUtils.randFloatSpread(200), // y
        THREE.MathUtils.randFloatSpread(200)  // z
      );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="white" size={0.15} />
    </points>
  );
}

export default function Globe() {
  const [target] = useState<THREE.Vector3 | null>(null);
  const [isPlacementMode, setIsPlacementMode] = useState(false);



  const [userFlowers, setUserFlowers] = useState<{ position: THREE.Vector3; type: 'mine' | 'others'; texture: 'flower1' | 'flower2' | 'flower3'; name: string }[]>([]);

  // 初期化時にテスト花を追加
  useEffect(() => {
    if (userFlowers.length === 0) {
      const testFlowers = [
        {
          position: toXYZ(35.6895, 139.6917, 1.01), // 東京
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: 'テスト花1'
        },
        {
          position: toXYZ(40.7128, -74.006, 1.01), // ニューヨーク
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'テスト花2'
        }
      ];
      setUserFlowers(testFlowers);
    }
  }, []);

  useEffect(() => {
    if (userFlowers.length > 0) {
      localStorage.setItem('userFlowers', JSON.stringify(userFlowers));
    }
  }, [userFlowers]);

  const [mapModal, setMapModal] = useState<{
    isOpen: boolean;
    lat: number;
    lon: number;
    name?: string;
  }>({ isOpen: false, lat: 0, lon: 0 });
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [selectedTexture, setSelectedTexture] = useState<'flower1' | 'flower2' | 'flower3'>('flower1');
  const [filter, setFilter] = useState<'all' | 'mine' | 'others'>('all');

  // 地図を表示する関数
  const showMap = (position: THREE.Vector3, name?: string) => {
    if (isPlacementMode) return; // 配置モード中はモーダルを開かない
    const { lat, lon } = fromXYZ(position, 1.01);
    setMapModal({ isOpen: true, lat, lon, name });
  };

  // 花を配置する関数
  const handlePlaceFlower = (position: THREE.Vector3) => {
    const type = selectedTexture === 'flower1' ? 'mine' : 'others';
    setUserFlowers(prev => [...prev, { position: position.clone(), type, texture: selectedTexture, name: 'New Flower' }]);
  };

  // 配置モードを切り替える関数
  const togglePlacementMode = () => {
    setIsPlacementMode(!isPlacementMode);
  };

  // 座標で花を配置する関数
  const handleAddFlowerByCoordinates = () => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    if (isNaN(lat) || isNaN(lon)) {
      alert('緯度と経度を正しく入力してください。');
      return;
    }

    const position = toXYZ(lat, lon, 1.01);
    const type = selectedTexture === 'flower1' ? 'mine' : 'others';
    setUserFlowers(prev => [...prev, { position: position.clone(), type, texture: selectedTexture, name: 'New Flower' }]);
    setLatInput('');
    setLonInput('');
  };

  return (
    <>
    {/* 花配置ボタン */}
    <button
      onClick={togglePlacementMode}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1001,
        padding: '12px 24px',
        backgroundColor: isPlacementMode ? '#FF6400' : 'rgba(255, 100, 0, 0.2)',
        color: isPlacementMode ? '#000' : '#FF6400',
        border: '2px solid #FF6400',
        borderRadius: '8px',
        cursor: 'pointer',
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        boxShadow: '0 0 20px rgba(255, 100, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
    >
      {isPlacementMode ? '配置モード終了' : '花を配置'}
    </button>

    {isPlacementMode &&
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '20px',
      zIndex: 1001,
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div>
        <button onClick={() => setSelectedTexture('flower1')} style={{ marginRight: '10px', backgroundColor: selectedTexture === 'flower1' ? '#FF6400' : 'grey' }}>自分の花</button>
        <button onClick={() => setSelectedTexture('flower2')} style={{ marginRight: '10px', backgroundColor: selectedTexture === 'flower2' ? '#FF6400' : 'grey' }}>他人の花1</button>
        <button onClick={() => setSelectedTexture('flower3')} style={{ backgroundColor: selectedTexture === 'flower3' ? '#FF6400' : 'grey' }}>他人の花2</button>
      </div>
      <input
        type="text"
        placeholder="緯度 (e.g., 35.68)"
        value={latInput}
        onChange={(e) => setLatInput(e.target.value)}
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #FF6400',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      />
      <input
        type="text"
        placeholder="経度 (e.g., 139.69)"
        value={lonInput}
        onChange={(e) => setLonInput(e.target.value)}
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #FF6400',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      />
      <button
        onClick={handleAddFlowerByCoordinates}
        style={{
          padding: '10px',
          backgroundColor: '#FF6400',
          color: '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        座標で配置
      </button>
    </div>
    }

    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1001,
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      color: 'white'
    }}>
      <label><input type="radio" value="all" checked={filter === 'all'} onChange={() => setFilter('all')} /> 全て</label>
      <label><input type="radio" value="mine" checked={filter === 'mine'} onChange={() => setFilter('mine')} /> 自分の花</label>
      <label><input type="radio" value="others" checked={filter === 'others'} onChange={() => setFilter('others')} /> 他人の花</label>
    </div>

    <Canvas
      camera={{ 
        position: [0, 0, 5], 
        fov: 50,
        near: 0.1,
        far: 1000
      }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      }}
      dpr={[1, 2]}
    >
      {/* カメラワープ制御 */}
      <CameraRig target={target} />

      {/* 星空背景 */}
      <StarField />

      {/* クリック可能な地球本体 */}
      <ClickableEarth
        isPlacementMode={isPlacementMode}
        onPlaceFlower={handlePlaceFlower}
      />

      {/* ユーザーが配置した花 */}
      {userFlowers
        .filter(flower => filter === 'all' || flower.type === filter)
        .map((flower, idx) => (
        <Flower
          key={`user-flower-${idx}`}
          position={flower.position}
          texture={flower.texture}
          onClick={isPlacementMode ? undefined : () => showMap(flower.position, flower.type === 'mine' ? `${flower.name} (あなたの花)` : `${flower.name} (誰かの花)`)}
        />
      ))}

      {/* 高品質な照明設定 */}
      <ambientLight intensity={0.3} color="#404040" />
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow={false}
      />
      <directionalLight 
        position={[-5, -3, -5]} 
        intensity={0.3} 
        color="#87CEEB"
      />
      <pointLight 
        position={[0, 0, 0]} 
        intensity={0.1} 
        color="#ffffff"
        distance={10}
      />

      {/* マウス操作 */}
      <OrbitControls 
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
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