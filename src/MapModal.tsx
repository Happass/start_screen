import { useEffect, useRef, useState } from "react";

interface Memory {
  id: string;
  title: string;
  description: string;
  photo?: string;
  date: string;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName?: string;
}

export function MapModal({ isOpen, onClose, latitude, longitude, locationName }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: "",
    description: "",
    photo: null as File | null
  });

  // ローカルストレージから記憶を読み込む
  useEffect(() => {
    if (isOpen && locationName) {
      const savedMemories = localStorage.getItem(`memories_${locationName}`);
      if (savedMemories) {
        setMemories(JSON.parse(savedMemories));
      }
    }
  }, [isOpen, locationName]);

  // 記憶を保存
  const saveMemory = () => {
    if (!newMemory.title || !newMemory.description) return;

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
              <h4>💭 思い出</h4>
              <button
                className="add-memory-btn"
                onClick={() => setShowAddMemory(!showAddMemory)}
              >
                {showAddMemory ? '✕' : '＋ 記憶を追加'}
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
                    📸 写真を追加
                  </label>
                </div>
                <button onClick={saveMemory} className="save-memory-btn">
                  💾 記憶を保存
                </button>
              </div>
            )}

            <div className="memories-list">
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