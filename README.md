# ドット学習マップ MVP

Next.js App Router + TypeScript + Firebase Authentication + Cloud Firestore で作る、スマホ向け教育 Web アプリです。  
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
- Firebase Hosting

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

初回 admin ユーザーは Firestore の `users/{uid}.role` を `admin` に変更してください。  
この判定は暫定で、将来は Firebase Admin SDK やカスタムクレームへ移行しやすい構成です。

## ローカル開発

```bash
npm run dev
```

ブラウザで以下を開きます。

```txt
http://localhost:3000
```

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
- admin 判定は `users.role == "admin"` を利用

## Firebase Hosting へのデプロイ

この MVP は Firebase 中心で構成しています。  
Next.js を Firebase に載せる場合は、プロジェクト状況に応じて以下のいずれかを使ってください。

1. Firebase Hosting + Web Frameworks
2. Firebase App Hosting

一般的には次で開始できます。

```bash
firebase experiments:enable webframeworks
firebase deploy
```

運用方針に応じて Hosting / App Hosting を選んでください。

## 未解決事項と注意点

- YouTube の視聴完了は MVP では `視聴完了として記録` ボタンで扱っています
- 厳密な再生率判定は将来 YouTube IFrame API で強化可能です
- Firestore Rules は権限制御中心で、進行ロジックの厳密検証まではしていません
- 本番では admin 判定をカスタムクレームへ移行するのがより安全です

## 今後の拡張案

- 複数マップ
- 管理画面の専用編集ページ化
- クイズ複数問対応の強化
- 視聴率ベースの進行判定
- 先生ロール追加
- Firebase Functions による進行計算の安全化
