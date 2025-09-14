import { useEffect, useRef, useState, useCallback } from "react";
import { MemoryAPI } from "./services/api";

interface Memory {
  id: string;
  title: string;
  description: string;
  photo?: string;
  date: string;
  memoryDate?: string;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName?: string;
}

// 位置情報に基づいてモックメモリーを生成
const generateMockMemoriesForLocation = (lat: number, lon: number): Memory[] => {
  const mockMemoriesData: { [key: string]: Memory[] } = {
    // 日本
    'tokyo': [
      {
        id: '1',
        title: '桜の季節',
        description: '上野公園でお花見をしました。満開の桜が美しく、友人たちと楽しい時間を過ごしました。',
        date: '2024/04/05'
      },
      {
        id: '2',
        title: '初めての寿司体験',
        description: '築地市場で新鮮な寿司を食べました。マグロの味が忘れられません。',
        date: '2024/03/22'
      }
    ],
    'newyork': [
      {
        id: '3',
        title: 'セントラルパークの朝',
        description: '朝のジョギングで見た霧に包まれた公園は幻想的でした。',
        date: '2024/05/15'
      },
      {
        id: '4',
        title: 'ブロードウェイミュージカル',
        description: '人生初のブロードウェイショー！感動で涙が止まりませんでした。',
        date: '2024/05/14'
      }
    ],
    'paris': [
      {
        id: '5',
        title: 'エッフェル塔の夜景',
        description: 'ライトアップされたエッフェル塔を見ながらワインを飲みました。ロマンチックな夜でした。',
        date: '2024/06/20'
      },
      {
        id: '6',
        title: 'ルーヴル美術館',
        description: 'モナリザを実際に見ることができました。想像以上に小さくて驚きました。',
        date: '2024/06/19'
      }
    ],
    'london': [
      {
        id: '7',
        title: 'テムズ川クルーズ',
        description: '川から見るロンドンブリッジとタワーブリッジの景色は格別でした。',
        date: '2024/07/10'
      },
      {
        id: '8',
        title: 'アフタヌーンティー',
        description: '本場のアフタヌーンティーを体験。スコーンがとても美味しかったです。',
        date: '2024/07/09'
      }
    ],
    'sydney': [
      {
        id: '9',
        title: 'オペラハウスでのコンサート',
        description: '世界的に有名なオペラハウスでクラシックコンサートを鑑賞しました。',
        date: '2024/08/25'
      },
      {
        id: '10',
        title: 'ハーバーブリッジ登頂',
        description: 'ブリッジクライムで頂上まで登りました。シドニー湾の景色は息をのむ美しさでした。',
        date: '2024/08/24'
      }
    ]
  };

  // 位置情報から都市を判定
  let cityKey = 'default';

  // 東京周辺
  if (lat > 35.5 && lat < 36.0 && lon > 139.0 && lon < 140.0) {
    cityKey = 'tokyo';
  }
  // ニューヨーク周辺
  else if (lat > 40.0 && lat < 41.0 && lon > -75.0 && lon < -73.0) {
    cityKey = 'newyork';
  }
  // パリ周辺
  else if (lat > 48.0 && lat < 49.0 && lon > 2.0 && lon < 3.0) {
    cityKey = 'paris';
  }
  // ロンドン周辺
  else if (lat > 51.0 && lat < 52.0 && lon > -1.0 && lon < 1.0) {
    cityKey = 'london';
  }
  // シドニー周辺
  else if (lat > -34.0 && lat < -33.0 && lon > 150.0 && lon < 152.0) {
    cityKey = 'sydney';
  }

  // デフォルトのメモリー
  const defaultMemories: Memory[] = [
    {
      id: 'default1',
      title: 'この場所での思い出',
      description: `座標 ${lat.toFixed(4)}, ${lon.toFixed(4)} での特別な瞬間。新しい場所を発見する喜びを感じました。`,
      date: '2024/09/14'
    },
    {
      id: 'default2',
      title: '旅の記録',
      description: '知らない場所を歩くことで、新しい発見がありました。地図にない小さな路地や、現地の人々との出会いが印象的でした。',
      date: '2024/09/13'
    }
  ];

  return mockMemoriesData[cityKey] || defaultMemories;
};

export function MapModal({ isOpen, onClose, latitude, longitude, locationName }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    photo: null as File | null
  });

  // APIから記憶を読み込む（緯度経度ベース）
  const loadMemories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await MemoryAPI.getMemoriesByLocation(latitude, longitude);
      const apiMemories = response.items.map(memory => ({
        id: memory.id,
        title: memory.title,
        description: memory.description,
        date: new Date(memory.createdAt).toLocaleDateString('ja-JP'),
        memoryDate: memory.memoryDate
      }));
      setMemories(apiMemories);
    } catch (error) {
      console.error('Failed to load memories:', error);
      // フォールバック: ローカルストレージから読み込むか、モックデータを表示
      if (locationName) {
        const savedMemories = localStorage.getItem(`memories_${locationName}`);
        if (savedMemories) {
          setMemories(JSON.parse(savedMemories));
        } else {
          // モックメモリーデータを地域別に表示
          const mockMemories = generateMockMemoriesForLocation(latitude, longitude);
          setMemories(mockMemories);
        }
      } else {
        // 座標ベースのモックデータ
        const mockMemories = generateMockMemoriesForLocation(latitude, longitude);
        setMemories(mockMemories);
      }
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, locationName]);

  useEffect(() => {
    if (isOpen && latitude && longitude) {
      loadMemories();
    }
  }, [isOpen, latitude, longitude, loadMemories]);

  // 記憶を保存
  const saveMemory = async () => {
    if (!newMemory.title || !newMemory.description) return;

    try {
      setLoading(true);
      const memoryData = {
        title: newMemory.title,
        description: newMemory.description,
        lat: latitude,
        lon: longitude,
        locationName: locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      };

      const createdMemory = await MemoryAPI.createMemory(latitude, longitude, memoryData);

      const newMemoryItem: Memory = {
        id: createdMemory.id,
        title: createdMemory.title,
        description: createdMemory.description,
        photo: newMemory.photo ? URL.createObjectURL(newMemory.photo) : undefined,
        date: new Date(createdMemory.createdAt).toLocaleDateString('ja-JP'),
        memoryDate: createdMemory.memoryDate
      };

      setMemories(prev => [...prev, newMemoryItem]);
      setNewMemory({ title: "", description: "", photo: null });
      setShowAddMemory(false);
    } catch (error) {
      console.error('Failed to save memory:', error);
      alert('記憶の保存に失敗しました');

      // フォールバック: ローカルストレージに保存
      const memory: Memory = {
        id: Date.now().toString(),
        title: newMemory.title,
        description: newMemory.description,
        photo: newMemory.photo ? URL.createObjectURL(newMemory.photo) : undefined,
        date: new Date().toLocaleDateString('ja-JP')
      };

      const updatedMemories = [...memories, memory];
      setMemories(updatedMemories);

      if (locationName) {
        localStorage.setItem(`memories_${locationName}`, JSON.stringify(updatedMemories));
      }

      setNewMemory({ title: "", description: "", photo: null });
      setShowAddMemory(false);
    } finally {
      setLoading(false);
    }
  };

  // 写真アップロード処理
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMemory({ ...newMemory, photo: file });
    }
  };

  useEffect(() => {
    if (isOpen && mapRef.current) {
      // iframeを作成してOpenStreetMapを表示
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';

      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(iframe);
    }
  }, [isOpen, latitude, longitude]);

  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay">
      <div className="map-modal">
        <div className="map-modal-header">
          <h3>{locationName || `位置: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="map-modal-content">
          <div className="map-container" ref={mapRef}></div>

          <div className="memories-section">
            <div className="memories-header">
              <h4>思い出</h4>
              <button
                className="add-memory-btn"
                onClick={() => setShowAddMemory(!showAddMemory)}
                disabled={loading}
              >
                {loading ? 'ロード中...' : showAddMemory ? '✕' : '＋ 記憶を追加'}
              </button>
            </div>

            {showAddMemory && (
              <div className="add-memory-form">
                <input
                  type="text"
                  placeholder="思い出のタイトル..."
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  className="memory-input"
                />
                <textarea
                  placeholder="思い出を詳しく書いてください..."
                  value={newMemory.description}
                  onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                  className="memory-textarea"
                />
                <div className="photo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="photo-input"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="photo-label">
                     写真を追加
                  </label>
                </div>
                <button
                  onClick={saveMemory}
                  className="save-memory-btn"
                  disabled={loading || !newMemory.title || !newMemory.description}
                >
                  {loading ? '保存中...' : ' 記憶を保存'}
                </button>
              </div>
            )}

            <div className="memories-list">
              {loading && memories.length === 0 && (
                <div className="loading-message">記憶を読み込み中...</div>
              )}
              {memories.map((memory) => (
                <div key={memory.id} className="memory-card">
                  {memory.photo && (
                    <div className="memory-photo">
                      <img src={memory.photo} alt={memory.title} />
                      <div className="speech-bubble">
                        <div className="memory-content">
                          <h5>{memory.title}</h5>
                          <p>{memory.description}</p>
                          <span className="memory-date">{memory.date}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {!memory.photo && (
                    <div className="memory-text-only">
                      <div className="speech-bubble-text">
                        <h5>{memory.title}</h5>
                        <p>{memory.description}</p>
                        <span className="memory-date">{memory.date}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}