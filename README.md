# ドット学習マップ MVP

Next.js App Router + TypeScript + Firebase Authentication + Cloud Firestore で作る、スマホ向け教育 Web アプリです。

このアプリの現在の推奨構成は次です。

- フロント公開: **Firebase App Hosting**
- 認証: **Firebase Authentication**
- データ: **Cloud Firestore**
- 権限制御: **Firestore Security Rules**

自分で Web サーバーを立てる前提ではなく、**Firebase の既存サービスを組み合わせて公開する**構成に寄せています。

## 今の実装範囲

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

## 最短の始め方

ローカル起動なしで始めたい場合は、まずこのガイドを見てください。

- [Firebase App Hosting 超入門ガイド](docs/APP_HOSTING_BEGINNER_GUIDE.md)

このガイドでは、

- GitHub へこのリポジトリを置く準備
- Firebase プロジェクト作成
- Blaze プラン設定
- Auth / Firestore 有効化
- App Hosting 接続
- 環境変数設定
- `/setup` で初期データ投入と最初の管理者作成

までを、初心者向けに順番で説明しています。

## 初回セットアップ画面

Firebase App Hosting にデプロイしたあと、次の URL を開くと初回セットアップ画面が使えます。

```txt
https://あなたの公開URL/setup
```

この画面でできること:

- サンプルアバター投入
- サンプルマップ投入
- サンプル地点投入
- サンプル動画投入
- サンプルクイズ投入
- 最初の管理者アカウント作成
- admin 権限付与

必要なもの:

- App Hosting に設定した `APP_SETUP_TOKEN`
- 最初の管理者のメールアドレス / パスワード

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

## 重要な環境変数

### App Hosting に設定するもの

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `APP_SETUP_TOKEN`

### ローカルの管理スクリプトでも使うもの

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

`APP_SETUP_TOKEN` は公開しない値にしてください。
初回セットアップ成功後は、同じ値を使い続けずに更新する運用を推奨します。

## 管理者権限の考え方

admin 判定は次の順で見ます。

1. Firebase Custom Claims
2. `users.role`

つまり現在は `Custom Claims 優先 / users.role フォールバック` です。  
本番では Custom Claims を正本に寄せる想定です。

### ローカル運用スクリプト

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

## 動画取得と未解放情報の扱い

YouTube の限定公開 URL は完全には秘匿できません。  
そのためこのアプリでは以下の方針を取っています。

- 未解放動画は一覧に出しすぎない
- ダッシュボードでは解放済み / 再視聴可の教材だけ表示
- 動画詳細画面は `userProgress.unlockedVideoIds` を確認してから詳細取得
- UI 上で `未解放` `解放済み` `再視聴可` を分離

## Firestore Rules 方針

- 一般ユーザーは自分のプロフィールと進行データのみ読み書き可
- 教材マスタ編集は admin のみ
- claims に `admin: true` がある管理者を優先して許可
- `users.role` はフォールバック用途も兼ねる

### ローカル CLI を使わずに Rules を反映したい場合

Firebase Console の `Firestore Database > ルール` 画面に、[firebase/firestore.rules](/abs/path/c:/Users/sanwa/work/saim1/firebase/firestore.rules) の内容を貼り付けて公開しても始められます。  
インデックスは初回アクセス時に Firebase が作成リンクを出す場合があるので、そのリンクを開いて作成してください。

## ローカル開発とテスト

公開運用は App Hosting を推奨していますが、開発用のローカル実行も残しています。

### 起動

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

### 検証

```bash
npm run verify
npm run test:rules
npm run test:e2e:smoke
npm run test:e2e
npx tsc --noEmit
npm run lint
npm run build
```

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
docs/
  APP_HOSTING_BEGINNER_GUIDE.md
```

## 本番強度と運用計画

- 本番強度プラン: `docs/PRODUCTION_HARDENING_PLAN.md`
- 運用効率化プラン: `docs/OPERATIONS_PLAN.md`

## 未解決事項と注意点

- YouTube の視聴完了は MVP では `視聴完了として記録` ボタンで扱っています
- 厳密な再生率判定は将来 YouTube IFrame API で強化可能です
- Firestore Rules は権限制御中心で、進行ロジックの厳密検証まではしていません
- App Hosting は Blaze プラン必須です

## 今後の拡張案

- 複数マップ
- 管理画面の専用編集ページ化
- クイズ複数問対応の強化
- 視聴率ベースの進行判定
- 先生ロール追加
- Firebase Functions による進行計算の安全化
