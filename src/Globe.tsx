import { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";

import { Flower } from "./Flower";
import { CameraRig } from "./CameraRig";
import { MapModal } from "./MapModal";
import { FlowerAPI } from "./services/api";
import { validateAndNormalizeCoordinates, validateCoordinateInput, safeFromXYZ } from "./utils/validation";

// 緯度経度 → XYZ 座標変換
const toXYZ = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// XYZ座標 → 緯度経度 変換（安全版）
const fromXYZ = (position: THREE.Vector3, radius: number) => {
  return safeFromXYZ(position, radius);
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
      shininess={50}
      transparent={false}
      side={THREE.FrontSide}
      emissive="#111111"
      emissiveIntensity={0.2}
    />
  );
}

// 大気圏エフェクトコンポーネント
function Atmosphere() {
  return (
    <Sphere args={[1.02, 32, 32]}>
      <meshBasicMaterial
        color={0xaaddff}
        transparent={true}
        opacity={0.3}
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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isPlacementMode || !earthRef.current) return;

    event.stopPropagation();

    // マウス座標を正規化デバイス座標に変換
    const rect = (event.target as HTMLElement).getBoundingClientRect();
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



  const [userFlowers, setUserFlowers] = useState<{ position: THREE.Vector3; type: 'mine' | 'others'; texture: 'flower1' | 'flower2'; name: string; id?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // API からの花データを取得
  const loadFlowers = async () => {
    try {
      setLoading(true);
      const response = await FlowerAPI.getFlowers();
      const apiFlowers = response.items.map(flower => ({
        id: flower.id,
        position: toXYZ(flower.lat, flower.lon, 1.01),
        type: flower.type,
        texture: flower.texture,
        name: flower.name
      }));
      setUserFlowers(apiFlowers);
    } catch (error) {
      console.error('Failed to load flowers:', error);
      // フォールバックとしてテスト花を表示
      const testFlowers = [
        {
          position: toXYZ(35.6895, 139.6917, 1.01), // 東京
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: '東京タワーの思い出'
        },
        {
          position: toXYZ(40.7128, -74.006, 1.01), // ニューヨーク
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'セントラルパークの桜'
        },
        {
          position: toXYZ(48.8566, 2.3522, 1.01), // パリ
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: 'エッフェル塔の下で'
        },
        {
          position: toXYZ(51.5074, -0.1278, 1.01), // ロンドン
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'テムズ川の朝'
        },
        {
          position: toXYZ(34.0522, -118.2437, 1.01), // ロサンゼルス
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: 'ハリウッドサイン'
        },
        {
          position: toXYZ(-33.8688, 151.2093, 1.01), // シドニー
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'オペラハウスの夕日'
        },
        {
          position: toXYZ(35.3606, 138.7274, 1.01), // 富士山
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: '富士山頂からの眺め'
        },
        {
          position: toXYZ(43.7696, 11.2558, 1.01), // フィレンツェ
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'ドゥオーモの鐘の音'
        },
        {
          position: toXYZ(25.2048, 55.2708, 1.01), // ドバイ
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: 'ブルジュハリファ'
        },
        {
          position: toXYZ(-22.9068, -43.1729, 1.01), // リオデジャネイロ
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'コルコバードの丘'
        },
        {
          position: toXYZ(37.7749, -122.4194, 1.01), // サンフランシスコ
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: 'ゴールデンゲートブリッジ'
        },
        {
          position: toXYZ(1.3521, 103.8198, 1.01), // シンガポール
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'マリーナベイサンズ'
        },
        {
          position: toXYZ(39.9042, 116.4074, 1.01), // 北京
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: '万里の長城'
        },
        {
          position: toXYZ(28.6139, 77.209, 1.01), // ニューデリー
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'インド門の朝'
        },
        {
          position: toXYZ(-34.6037, -58.3816, 1.01), // ブエノスアイレス
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: 'タンゴの街角'
        },
        {
          position: toXYZ(60.1699, 24.9384, 1.01), // ヘルシンキ
          type: 'others' as const,
          texture: 'flower2' as const,
          name: '白夜のサウナ'
        },
        {
          position: toXYZ(64.1466, -21.9426, 1.01), // レイキャビク
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: 'オーロラの夜'
        },
        {
          position: toXYZ(-26.2041, 28.0473, 1.01), // ヨハネスブルグ
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'サファリの思い出'
        },
        {
          position: toXYZ(55.7558, 37.6176, 1.01), // モスクワ
          type: 'mine' as const,
          texture: 'flower1' as const,
          name: '赤の広場の雪'
        },
        {
          position: toXYZ(19.4326, -99.1332, 1.01), // メキシコシティ
          type: 'others' as const,
          texture: 'flower2' as const,
          name: 'テオティワカンの夕暮れ'
        }
      ];
      setUserFlowers(testFlowers);
    } finally {
      setLoading(false);
    }
  };

  // 初期化時にAPI から花データを取得
  useEffect(() => {
    loadFlowers();
  }, []);


  const [mapModal, setMapModal] = useState<{
    isOpen: boolean;
    lat: number;
    lon: number;
    name?: string;
  }>({ isOpen: false, lat: 0, lon: 0 });
  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [selectedTexture, setSelectedTexture] = useState<'flower1' | 'flower2'>('flower1');
  const [textureFilter, setTextureFilter] = useState<'all' | 'flower1' | 'flower2'>('all');

  // 近接する花が重ならないように位置を微調整する（クラスタごとに放射状に配置）
  const { adjustedPositions, scales } = useMemo(() => {
    const step = 0.05; // 緯度経度の量子化ステップ（度）。約5km相当（緯度基準）
    const clusters = new Map<string, number[]>();

    userFlowers.forEach((flower, idx) => {
      const { lat, lon } = fromXYZ(flower.position, 1.01);
      const keyLat = Math.round(lat / step) * step;
      const keyLon = Math.round(lon / step) * step;
      const key = `${keyLat}:${keyLon}`;
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key)!.push(idx);
    });

    const result = userFlowers.map(f => f.position.clone());
    const scaleArr = userFlowers.map(() => 0.15);

    clusters.forEach((indices) => {
      const k = indices.length;
      indices.forEach((idxInCluster, j) => {
        const base = userFlowers[idxInCluster].position;
        const n = base.clone().normalize();
        // 接ベクトルを作る
        let u = new THREE.Vector3().crossVectors(n, new THREE.Vector3(0, 1, 0));
        if (u.lengthSq() < 1e-6) {
          u = new THREE.Vector3().crossVectors(n, new THREE.Vector3(1, 0, 0));
        }
        u.normalize();
        const v = new THREE.Vector3().crossVectors(n, u).normalize();

        // 配置オフセットは控えめに（前回より小さめ）
        const angle = (2 * Math.PI * j) / k;
        const ringRadius = 0.04 + Math.min(0.08, (k - 2) * 0.008);
        const radialLift = 0.015;
        const offset = u.clone().multiplyScalar(Math.cos(angle) * ringRadius)
          .add(v.clone().multiplyScalar(Math.sin(angle) * ringRadius))
          .add(n.clone().multiplyScalar(radialLift));
        result[idxInCluster] = base.clone().add(offset);

        // 密度に応じてスケールを縮小（最小0.06まで）
        const baseScale = 0.15;
        const shrink = Math.min(0.7, (k - 1) * 0.08); // 個数が増えるほど最大70%縮小
        const scale = Math.max(0.06, baseScale * (1 - shrink));
        scaleArr[idxInCluster] = scale;
      });
    });

    return { adjustedPositions: result, scales: scaleArr };
  }, [userFlowers]);

  // 地図を表示する関数
  const showMap = (position: THREE.Vector3, name?: string) => {
    if (isPlacementMode) return; // 配置モード中はモーダルを開かない
    const { lat, lon } = fromXYZ(position, 1.01);
    setMapModal({ isOpen: true, lat, lon, name });
  };

  // 花を配置する関数
  const handlePlaceFlower = async (position: THREE.Vector3) => {
    try {
      setLoading(true);
      const { lat, lon } = fromXYZ(position, 1.01);

      // 座標を検証
      const validation = validateAndNormalizeCoordinates(lat, lon);
      if (!validation.isValid) {
        console.warn('座標検証エラー:', validation.errors);
      }

      const type = selectedTexture === 'flower1' ? 'mine' : 'others';

      const newFlower = await FlowerAPI.createFlower({
        lat: validation.lat,
        lon: validation.lon,
        texture: selectedTexture,
        name: 'New Flower'
      });

      setUserFlowers(prev => [...prev, {
        id: newFlower.id,
        position: position.clone(),
        type,
        texture: selectedTexture,
        name: 'New Flower'
      }]);
    } catch (error) {
      console.error('Failed to create flower:', error);
      alert('花の配置に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 配置モードを切り替える関数
  const togglePlacementMode = () => {
    setIsPlacementMode(!isPlacementMode);
  };

  // 座標で花を配置する関数
  const handleAddFlowerByCoordinates = async () => {
    // 座標を検証
    const validation = validateCoordinateInput(latInput, lonInput);

    if (!validation.isValid) {
      alert(`入力エラー:\n${validation.errors.join('\n')}`);
      return;
    }

    // 警告がある場合は確認
    if (validation.errors.length > 0) {
      const proceed = confirm(`警告:\n${validation.errors.join('\n')}\n\n続行しますか？`);
      if (!proceed) return;
    }

    try {
      setLoading(true);
      const position = toXYZ(validation.lat, validation.lon, 1.01);
      const type = selectedTexture === 'flower1' ? 'mine' : 'others';

      const newFlower = await FlowerAPI.createFlower({
        lat: validation.lat,
        lon: validation.lon,
        texture: selectedTexture,
        name: 'New Flower'
      });

      setUserFlowers(prev => [...prev, {
        id: newFlower.id,
        position: position.clone(),
        type,
        texture: selectedTexture,
        name: 'New Flower'
      }]);
      setLatInput('');
      setLonInput('');
    } catch (error) {
      console.error('Failed to create flower:', error);
      alert('花の配置に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {/* 花配置ボタン */}
    <button
      onClick={togglePlacementMode}
      disabled={loading}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1001,
        padding: '12px 24px',
        backgroundColor: loading ? 'rgba(100, 100, 100, 0.5)' : isPlacementMode ? '#FF6400' : 'rgba(255, 100, 0, 0.2)',
        color: loading ? '#666' : isPlacementMode ? '#000' : '#FF6400',
        border: '2px solid #FF6400',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
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
      {loading ? 'ロード中...' : isPlacementMode ? '配置モード終了' : '花を配置'}
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
      <div role="radiogroup" aria-label="texture selection" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="texture"
            value="flower1"
            checked={selectedTexture === 'flower1'}
            onChange={() => setSelectedTexture('flower1')}
          />
          自分の花
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="texture"
            value="flower2"
            checked={selectedTexture === 'flower2'}
            onChange={() => setSelectedTexture('flower2')}
          />
          他人の花
        </label>
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
        disabled={loading}
        style={{
          padding: '10px',
          backgroundColor: loading ? 'rgba(100, 100, 100, 0.5)' : '#FF6400',
          color: loading ? '#666' : '#000',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? '配置中...' : '座標で配置'}
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
      <fieldset style={{ border: '1px solid #FF6400', borderRadius: '6px', padding: '8px', margin: 0 }}>
        <legend style={{ padding: '0 6px', fontSize: '12px' }}>フィルター</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" value="all" checked={textureFilter === 'all'} onChange={() => setTextureFilter('all')} /> 全て
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" value="flower1" checked={textureFilter === 'flower1'} onChange={() => setTextureFilter('flower1')} /> 自分の花
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" value="flower2" checked={textureFilter === 'flower2'} onChange={() => setTextureFilter('flower2')} /> 他人の花
          </label>
        </div>
      </fieldset>
    </div>

    <Canvas
      camera={{ 
        position: [0, 0, 5], 
        fov: 50,
        near: 0.1,
        far: 1000
      }}
      style={{ width: "100vw", height: "100vh", background: "#0a0a2e" }}
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

      {/* ユーザーが配置した花（テクスチャフィルタ＆重なり回避） */}
      {userFlowers
        .filter(flower => textureFilter === 'all' || flower.texture === textureFilter)
        .map((flower, idx) => (
        <Flower
          key={`user-flower-${flower.id || idx}`}
          position={adjustedPositions[idx]}
          scale={scales[idx]}
          texture={flower.texture}
          onClick={isPlacementMode ? undefined : () => showMap(flower.position, flower.type === 'mine' ? `${flower.name} (あなたの花)` : `${flower.name} (誰かの花)`)}
        />
      ))}

      {/* より明るい照明設定 */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight
        position={[5, 3, 5]}
        intensity={2.0}
        color="#ffffff"
        castShadow={false}
      />
      <directionalLight
        position={[-5, -3, -5]}
        intensity={0.8}
        color="#87CEEB"
      />
      <directionalLight
        position={[0, 5, 0]}
        intensity={1.0}
        color="#ffffff"
      />
      <pointLight
        position={[0, 0, 0]}
        intensity={0.5}
        color="#ffffff"
        distance={15}
      />
      <pointLight
        position={[10, 0, 0]}
        intensity={0.3}
        color="#ffeeaa"
        distance={20}
      />
      <pointLight
        position={[-10, 0, 0]}
        intensity={0.3}
        color="#aaeeff"
        distance={20}
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
