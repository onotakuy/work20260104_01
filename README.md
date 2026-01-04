# Building 3D Generator

Google Earthの画像から範囲を選択して建物の3次元オブジェクトを生成し、二次元マップに配置するWebアプリケーション。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Better Auth (未実装)
- **ストレージ**: Cloudflare R2
- **決済**: Polar (未実装)
- **マップ**: Mapbox GL JS
- **3D表示**: Three.js

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Cloudflare R2
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=your_r2_public_url
```

### 3. Supabaseデータベースのセットアップ

`supabase/migrations/001_initial_schema.sql`をSupabaseのSQLエディタで実行してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 機能

### 実装済み

- ✅ マップ表示（Mapbox Satellite）
- ✅ 範囲選択機能
- ✅ ジョブ作成API
- ✅ ジョブ状態管理
- ✅ データベーススキーマ

### 未実装

- ⏳ 3Dモデル生成処理（バックグラウンドジョブ）
- ⏳ 3Dモデル表示（Three.js）
- ⏳ 認証（Better Auth）
- ⏳ 決済（Polar）
- ⏳ ファイルアップロード（Cloudflare R2）

## プロジェクト構造

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   └── MapView.tsx        # マップ表示コンポーネント
├── lib/                   # ライブラリ設定
│   ├── supabase/         # Supabaseクライアント
│   └── r2/               # Cloudflare R2クライアント
├── types/                 # TypeScript型定義
│   └── database.ts       # データベース型
└── supabase/             # Supabaseマイグレーション
    └── migrations/
        └── 001_initial_schema.sql
```

## 次のステップ

1. 3Dモデル生成処理の実装
2. バックグラウンドジョブキューシステムの構築
3. Better Authによる認証実装
4. Polarによる決済実装
5. Cloudflare R2へのファイルアップロード実装

