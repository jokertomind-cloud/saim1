# ドット学習マップ MVP

Next.js App Router + TypeScript + Firebase Authentication + Cloud Firestore で作る、スマホ向け教育 Web アプリです。  
このリポジトリは **外部公開しない運用** を前提に整理しています。  
基本方針は `フロントはローカルで自分だけが確認`、`無料の Firebase はバックエンド用途のみ利用` です。  
MVP では以下を実装しています。

- メール/パスワード登録とログイン
- 性別登録
- アバター選択
- 軽量な 2D グリッドマップ
- 3地点 / 3動画 / 各動画に 1クイズ
- 視聴回数とクイズ合格による解放
- 学習履歴
- 管理画面
  - マップ CRUD
  - 地点 CRUD
  - 動画 CRUD
  - クイズ CRUD
  - アバター CRUD
  - ユーザー一覧
  - ユーザー進行度確認

## ディレクトリ構成

```txt
src/
  app/
  components/
  lib/
    services/
    utils/
    validators/
  providers/
  types/
firebase/
  firestore.rules
  firestore.indexes.json
  seed/
public/
  avatars/
```

## Firestore コレクション

- `users`
- `avatars`
- `maps`
- `mapPoints`
- `videos`
- `quizzes`
- `quizQuestions`
- `userProgress`
- `userVideoStats`
- `userQuizResults`

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. `.env.local.example` をコピーして `.env.local` を作成

```bash
copy .env.local.example .env.local
```

3. Firebase プロジェクトを作成し、以下を有効化

- Firebase Authentication
  - メール/パスワード
- Cloud Firestore

補足:

- この構成では Firebase を `認証 / DB / rules / seed` 用途に使います
- フロントはまず `localhost` で確認し、**外部公開は行わない** 方針です

4. `.env.local` に Firebase Web SDK の設定を入れる

5. Firestore Rules を適用

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## seed データ投入

`firebase/seed/import-seed.ts` は Firebase Admin SDK を使います。  
`.env.local` に以下も設定してください。

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

投入コマンド:

```bash
npm run seed
```

初回 admin ユーザーも、手動で `users.role` だけを書き換えるのではなく、下記の運用スクリプトで `Custom Claims + Firestore role` を同期して付与してください。  
現在の実装は `Custom Claims 優先 / users.role フォールバック` です。

### 管理者権限の付与と剥奪

本番強度を上げるため、admin 判定は `Custom Claims 優先 / users.role フォールバック` に寄せています。  
運用では以下のスクリプトで両方を同期させる想定です。既存の他 claims は壊さず、`admin` だけを追加・削除します。

付与:

```bash
npm run ops:grant-admin -- --uid=<uid>
```

または

```bash
npm run ops:grant-admin -- --email=<email>
```

剥奪:

```bash
npm run ops:revoke-admin -- --uid=<uid>
```

必要な環境変数:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

## ローカル開発

```bash
npm run dev
```

ブラウザで以下を開きます。

```txt
http://localhost:3000
```

## 非公開運用の方針

- フロントエンドは `localhost` でのみ確認する
- Firebase は無料枠の `Authentication / Firestore / Rules` のみ利用する
- **Firebase Hosting や App Hosting へ公開デプロイしない**
- 検索エンジン露出を避けるため `robots noindex` と `robots.txt` を設定済み

Web アプリである以上、ブラウザ確認にはローカル HTTP サーバー相当が必要です。  
そのため `npm run dev` または `next start` のような **ローカル限定サーバー** は使いますが、外部公開用サーバーは前提にしません。

## localhost ブラウザテスト

人がスマホブラウザで触る流れを想定したテストは、Firebase Emulator と Playwright を使って `localhost` のみで完結します。  
外部公開はせず、Auth / Firestore もローカル Emulator に接続します。

実行コマンド:

```bash
npm run test:e2e:smoke
npm run test:e2e
```

内容:

- `test:e2e:smoke`
  - トップ
  - ログイン
  - 新規登録
  - 保護ページリダイレクト
  - admin 概要
  - ユーザー進行度確認
- `test:e2e`
  - 新規登録
  - プロフィール更新
  - マップ移動
  - 動画視聴記録
  - クイズ合格
  - 履歴確認
  - 再ログイン確認
  - admin の動画追加
  - admin のクイズ追加

補足:

- テスト用に `admin@example.com / Password123!` と `learner@example.com / Password123!` を Emulator へ投入します
- Playwright では iPhone 相当と Android 相当のモバイルレイアウトで確認します
- YouTube など外部メディアはブラウザテスト中にスタブ化し、`localhost` 検証を優先します

## 実装ルールに沿った構成

- 型定義は `src/types/models.ts` に集約
- Firestore アクセスは `src/lib/services/*` から利用
- UI コンポーネントと業務ロジックを分離
- seed データで初期動作確認可能
- 管理画面も service 層経由で CRUD

主な service:

- `auth-service.ts`
- `user-service.ts`
- `avatar-service.ts`
- `map-service.ts`
- `video-service.ts`
- `quiz-service.ts`
- `history-service.ts`
- `admin-service.ts`

## 検証コマンド

型・lint の確認:

```bash
npm run verify
npm run test:rules
npm run test:e2e:smoke
npm run test:e2e
npx tsc --noEmit
npm run lint
npm run build
```

## 本番強度と運用計画

- 本番強度プラン: `docs/PRODUCTION_HARDENING_PLAN.md`
- 運用効率化プラン: `docs/OPERATIONS_PLAN.md`

今回の実装では、次の土台を先に入れています。

- admin 判定の抽象化
- Custom Claims へ移行しやすい auth/provider 構成
- Rules の claims 対応
- admin 付与/剥奪スクリプト
- 管理画面の検索/絞り込み

## 動画取得と未解放情報の扱い

YouTube の限定公開 URL は完全には秘匿できません。  
そのためこのアプリでは以下の方針を取っています。

- 未解放動画は一覧に出しすぎない
- ダッシュボードでは解放済み/再視聴可の教材だけ表示
- 動画詳細画面は `userProgress.unlockedVideoIds` を確認してから詳細取得
- UI 上で `未解放` `解放済み` `再視聴可` を分離

## Firestore Rules 方針

- 一般ユーザーは自分のプロフィールと進行データのみ読み書き可
- 教材マスタ編集は admin のみ
- admin 判定は `Custom Claims 優先 / users.role フォールバック`
- Rules 側も同じ方針で、claims に `admin: true` がある管理者を優先して許可

## 公開デプロイについて

現時点では **外部公開しない** 方針のため、Hosting / App Hosting への公開デプロイ手順は標準運用から外しています。  
将来必要になった場合だけ、別ブランチまたは別設定で公開導線を追加する想定です。

## 未解決事項と注意点

- YouTube の視聴完了は MVP では `視聴完了として記録` ボタンで扱っています
- 厳密な再生率判定は将来 YouTube IFrame API で強化可能です
- Firestore Rules は権限制御中心で、進行ロジックの厳密検証まではしていません
- 本番では admin 判定をカスタムクレームへ移行するのがより安全です
- `npm run test:rules` はローカル Firestore Emulator を使います

## 今後の拡張案

- 複数マップ
- 管理画面の専用編集ページ化
- クイズ複数問対応の強化
- 視聴率ベースの進行判定
- 先生ロール追加
- Firebase Functions による進行計算の安全化
