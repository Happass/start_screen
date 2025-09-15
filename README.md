# 🌸 Start Screen - Interactive 3D Globe Memory Platform

## 📖 Abstract

**Start Screen** は、3D地球儀上に思い出を花として配置し、世界中の人々と思い出を共有できるインタラクティブなプラットフォームです。React、Three.js、TypeScriptを使用して構築され、美しい3D可視化と直感的なユーザーエクスペリエンスを提供します。

ユーザーは地球上の任意の場所に「花」を植え、その場所での思い出や体験を記録できます。各花にはflower1（自分の花）とflower2（他人の花）の2つのテクスチャがあり、コミュニティ主導の思い出共有体験を創造します。

## 🏗️ Architecture & Tech Stack

### **Frontend Technologies**
- **React 19.1.1** - モダンUIフレームワーク
- **TypeScript 5.8.3** - 型安全性とコード品質
- **Three.js 0.180.0** - 3Dレンダリングエンジン
- **@react-three/fiber** - React用Three.jsライブラリ
- **@react-three/drei** - Three.js用コンポーネントコレクション
- **@react-spring/three** - 3Dアニメーション
- **Vite 7.1.2** - 高速ビルドツール

### **Backend Integration**
- **REST API** - Cloudflare Workers API (`https://planty-api.shakenokiri.me/`)
- **Geohash Location System** - 位置ベースのデータ管理
- **API Endpoints**:
  - `GET/POST /flowers` - 花の管理
  - `GET/POST /locations/{locationId}/memories` - 位置別メモリー管理

### **Development Tools**
- **ESLint** - コード品質とスタイル
- **TypeScript ESLint** - TypeScript専用linting
- **Claude Code** - AI開発支援ツール

## 📁 Directory Structure

```
start_screen/
├── 📁 public/
│   ├── 📁 data/
│   │   └── mock-flowers.json      # モックデータ（110+ flowers）
│   ├── 📁 textures/               # 3D テクスチャファイル
│   ├── flower.PNG                 # Flower1 テクスチャ
│   ├── flower2.png                # Flower2 テクスチャ
│   ├── flower3.png                # Flower3 テクスチャ
│   ├── locations.json             # 地域データ
│   └── vite.svg                   # アイコン
├── 📁 src/
│   ├── 📁 components/
│   │   ├── Start.tsx              # スタート画面コンポーネント
│   │   └── Main.tsx               # メインアプリケーション
│   ├── 📁 services/
│   │   └── api.ts                 # API統合レイヤー
│   ├── 📁 utils/
│   │   └── validation.ts          # 座標検証ユーティリティ
│   ├── 📁 lib/
│   │   └── utils.ts               # 汎用ユーティリティ
│   ├── App.tsx                    # ルートコンポーネント
│   ├── Globe.tsx                  # メイン3D地球儀コンポーネント
│   ├── MapModal.tsx               # 地図モーダル＆メモリー管理
│   ├── Flower.tsx                 # 3D花コンポーネント
│   ├── CameraRig.tsx              # 3Dカメラ制御
│   ├── Pin.tsx                    # 位置ピン
│   └── main.tsx                   # アプリケーションエントリーポイント
├── 📁 dist/                       # ビルド出力
├── package.json                   # 依存関係設定
├── tsconfig.json                  # TypeScript設定
├── vite.config.ts                # Vite設定
├── eslint.config.js               # ESLint設定
└── README.md                      # このファイル
```

## 🌟 Core Features

### **🌍 Interactive 3D Globe**
- **高品質地球レンダリング** - リアルな地球テクスチャと大気圏エフェクト
- **スムーズインタラクション** - OrbitControls による直感的な操作
- **動的照明システム** - 複数光源による美しい3Dライティング
- **星空背景** - 10,000個のランダム配置された星

### **🌸 Flower Placement System**
- **クリック配置** - 地球上の任意の場所をクリックして花を配置
- **座標入力** - 正確な緯度・経度による配置
- **テクスチャ選択** - flower1（自分）/ flower2（他人）の選択
- **座標検証** - 緯度経度の自動正規化と検証
- **重複回避** - 近接する花の自動配置調整

### **🗺️ Memory Management**
- **位置ベースメモリー** - Geohash による地域別メモリー管理
- **インタラクティブマップ** - OpenStreetMap統合
- **リッチメモリー** - タイトル、説明、写真、日付
- **ローカライズ** - 都市別のカスタムメモリー体験

### **🔍 Advanced Filtering**
- **テクスチャフィルター** - 自分の花/他人の花を切り替え
- **リアルタイム更新** - フィルター変更時の即座な表示更新
- **スマートUI** - 直感的なラジオボタンインターフェース

### **🛠️ Technical Excellence**
- **完全TypeScript** - anyタイプを排除した厳密な型安全性
- **API統合** - Cloudflare Workers との完全統合
- **エラーハンドリング** - 堅牢なフォールバック機構
- **パフォーマンス最適化** - useCallback/useMemo による最適化
- **レスポンシブデザイン** - 全デバイス対応

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- npm/yarn/pnpm

### **Installation**
```bash
# プロジェクトクローン
git clone <repository-url>
cd start_screen

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで開く
open http://localhost:5173
```

### **Available Scripts**
```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run preview  # ビルド後プレビュー
npm run lint     # コード品質チェック
```

## 🔮 Next Actions & Development Roadmap

### **🎯 Immediate Next Steps (Short-term)**

#### **1. Enhanced User Experience**
- [ ] **ユーザー認証システム** - OAuth/JWT による個人識別
- [ ] **花の削除機能** - 自分の花を削除する機能
- [ ] **花の編集機能** - 既存の花の名前や情報を編集
- [ ] **アニメーション強化** - 花の配置/削除時のスムーズトランジション

#### **2. Memory System Expansion**
- [ ] **写真アップロード** - 実際の画像アップロード機能実装
- [ ] **音声メモ** - 音声録音による思い出記録
- [ ] **メモリータグ** - カテゴリー別タグシステム
- [ ] **メモリー検索** - キーワード/日付/場所による検索

#### **3. Social Features**
- [ ] **フレンド機能** - 友達の花を特別表示
- [ ] **コメントシステム** - 他人の花/メモリーへのコメント
- [ ] **いいね機能** - メモリーへの評価システム
- [ ] **共有機能** - SNS連携による共有

### **🚀 Medium-term Enhancements**

#### **4. Advanced Visualization**
- [ ] **ヒートマップ** - 花の密度可視化
- [ ] **時系列アニメーション** - メモリーの時間的変化表示
- [ ] **AR機能** - WebXR による拡張現実体験
- [ ] **VR対応** - VRヘッドセット対応

#### **5. Performance & Scalability**
- [ ] **バーチャライゼーション** - 大量の花の効率的レンダリング
- [ ] **PWA対応** - オフライン機能とアプリ化
- [ ] **データキャッシュ** - IndexedDB による高速ローカルキャッシュ
- [ ] **CDN最適化** - 3Dアセットの配信最適化

#### **6. Analytics & Insights**
- [ ] **使用統計** - ユーザー行動分析
- [ ] **人気地域** - よく訪問される場所の可視化
- [ ] **メモリートレンド** - 時期別メモリー傾向分析
- [ ] **パーソナルサマリー** - 個人の思い出レポート

### **🌟 Long-term Vision**

#### **7. AI & Machine Learning**
- [ ] **AI推奨システム** - 訪問すべき場所の提案
- [ ] **感情分析** - メモリーの感情的分析
- [ ] **自動タグ付け** - AIによる自動的なメモリー分類
- [ ] **翻訳機能** - 多言語対応による国際的体験

#### **8. Enterprise Features**
- [ ] **教育機関向け** - 学校での地理・歴史教育ツール
- [ ] **企業向け** - チームビルディング・出張記録ツール
- [ ] **観光業向け** - 観光地プロモーションプラットフォーム
- [ ] **API開放** - サードパーティ開発者向けAPI

#### **9. Platform Expansion**
- [ ] **モバイルアプリ** - React Native による iOS/Android アプリ
- [ ] **デスクトップアプリ** - Electron による デスクトップ版
- [ ] **スマートウォッチ** - 位置ベース通知機能
- [ ] **IoT連携** - スマートホームデバイスとの連携

## 🛡️ Technical Specifications

### **Code Quality Standards**
- **TypeScript Strict Mode** - anyタイプ完全排除
- **ESLint Configuration** - 厳格なコードスタイル
- **React Best Practices** - hooks最適化とmemo使用
- **API Error Handling** - 包括的エラー処理

### **Performance Metrics**
- **Build Size**: ~1.09MB (gzipped: ~307KB)
- **Lighthouse Score**: Target 90+ for all metrics
- **Three.js Optimization**: 60fps target rendering
- **API Response Time**: <500ms target

### **Browser Support**
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **WebGL Requirements**: WebGL 2.0 支援必須
- **Mobile Support**: iOS 14+, Android 10+

## 🤝 Contributing

### **Development Workflow**
1. ESLint チェックを実行: `npm run lint`
2. TypeScript コンパイル確認: `npm run build`
3. 機能テスト実行
4. プルリクエスト作成

### **Code Style**
- TypeScriptファーストアプローチ
- 関数型プログラミングパターン
- React Hooks最適化
- コンポーネント設計パターン

## 📊 API Integration

### **Flower API**
```typescript
// 花を取得
GET /flowers
// 新しい花を作成
POST /flowers { lat, lon, texture, name }
// 花を削除
DELETE /flowers/{id}
```

### **Memory API**
```typescript
// 位置別メモリー取得
GET /locations/{locationId}/memories
// 新しいメモリー作成
POST /locations/{locationId}/memories { title, description, lat, lon }
// メモリー更新
PATCH /memories/{id}
// メモリー削除
DELETE /memories/{id}
```

## 📈 Success Metrics

### **User Engagement**
- **花配置数**: 1日あたりの新規花配置
- **メモリー作成数**: 1日あたりの新規メモリー
- **セッション時間**: 平均セッション継続時間
- **リピート率**: 週間アクティブユーザー率

### **Technical KPIs**
- **ページロード時間**: <3秒
- **エラー率**: <1%
- **API応答時間**: <500ms
- **フレームレート**: 60fps維持

---

**Start Screen** は、技術的革新と人間的な思い出を繋ぐ、次世代の地理的メモリープラットフォームです。🌍✨


