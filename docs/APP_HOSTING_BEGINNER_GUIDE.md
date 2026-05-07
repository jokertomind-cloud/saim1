# Firebase App Hosting 超入門ガイド

このアプリは **Firebase App Hosting + Firebase Authentication + Cloud Firestore** で公開できます。  
自分で Web サーバーを立てる必要はありません。  
一度つなげば、**GitHub に push するたびに自動デプロイ**できます。

この方法では、**自分の PC で localhost を立ち上げなくても使い始められます**。  
その代わり、最初に **GitHub にこのプロジェクトを置く** 必要があります。

## 0. 最初に知っておくこと

- Firebase App Hosting は **Blaze プラン必須**です
- ただし no-cost 枠があるので、小規模なら無料寄りで運用できます
- 料金事故を防ぐため、**予算アラート**は必ず設定してください

公式情報:

- Firebase Pricing: https://firebase.google.com/pricing
- App Hosting costs: https://firebase.google.com/docs/app-hosting/costs
- Firestore pricing: https://firebase.google.com/docs/firestore/pricing
- App Hosting get started: https://firebase.google.com/docs/app-hosting/get-started

## 1. Firebase プロジェクトを作る

1. Firebase Console を開きます
2. `プロジェクトを追加`
3. 好きなプロジェクト名を入力
4. 作成完了まで進めます

## 1.5. GitHub にこのプロジェクトを置く

1. GitHub に新しい private repository を作ります
2. このプロジェクトをそのリポジトリへ push します
3. App Hosting ではその GitHub リポジトリを接続先に選びます

## 2. Blaze プランに変更して予算アラートを入れる

1. Firebase Console 左下の `アップグレード`
2. `Blaze` を選びます
3. Google Cloud の課金設定を完了します
4. その後 Google Cloud Console の `予算とアラート` を開きます
5. 月額予算を小さめに設定します
6. 50% / 80% / 100% 通知を ON にします

## 3. Authentication を有効化する

1. Firebase Console 左メニュー `Authentication`
2. `始める`
3. `Sign-in method`
4. `メール / パスワード`
5. `有効にする`
6. `保存`

## 4. Firestore を有効化する

1. Firebase Console 左メニュー `Firestore Database`
2. `データベースを作成`
3. まずは標準モードで作成
4. リージョンは日本なら近いリージョンを選びます

## 5. Firebase Web アプリを追加する

1. プロジェクト設定を開きます
2. `アプリを追加` から `Web`
3. アプリ名を入れて作成
4. 表示された Firebase SDK 設定を控えます

必要なのはこの値です。

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

## 6. App Hosting を作る

1. Firebase Console 左メニュー `App Hosting`
2. `始める`
3. GitHub アカウントを接続
4. このリポジトリを選択
5. ブランチは `main`
6. ルートディレクトリは通常そのまま
7. リージョンは近い場所を選択

Next.js は自動認識される想定です。

## 7. App Hosting の環境変数を入れる

App Hosting のバックエンド設定画面で、環境変数を追加します。  
このアプリでは少なくとも以下が必要です。

### 公開環境変数

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### セットアップ用シークレット

- `APP_SETUP_TOKEN`

`APP_SETUP_TOKEN` は長くて推測しづらい文字列にしてください。  
例:

```txt
setup-2026-very-long-random-token-123456
```

## 8. Firestore Rules と Indexes を反映する

これは1回だけローカルから実行すれば大丈夫です。

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

もしローカル CLI を使いたくない場合は、次の簡易手順でも始められます。

1. Firebase Console の `Firestore Database > ルール`
2. [firebase/firestore.rules](/abs/path/c:/Users/sanwa/work/saim1/firebase/firestore.rules) の内容を貼り付ける
3. `公開` を押す
4. インデックス不足が出たら、Firebase が表示する作成リンクを押して作る

## 9. 初回デプロイを待つ

App Hosting の画面でビルド完了を待ちます。  
完了すると公開 URL が発行されます。

例:

```txt
https://your-backend-name.web.app
```

## 10. 初回セットアップ画面を開く

公開 URL の末尾に `/setup` を付けて開きます。

```txt
https://your-backend-url/setup
```

この画面で入力するもの:

- セットアップトークン
- 最初の管理者表示名
- 最初の管理者性別
- 最初の管理者アバター
- 最初の管理者メールアドレス
- 最初の管理者パスワード

最後に次のボタンを押します。

`初期データ投入と管理者作成をまとめて実行`

これで次をまとめて行います。

- アバター投入
- マップ投入
- 地点投入
- 動画投入
- クイズ投入
- 最初の管理者アカウント作成
- admin 権限付与

このセットアップは **1回限り** の想定です。  
成功後に同じトークンで繰り返し実行しないよう、`APP_SETUP_TOKEN` を別の値に更新して保管してください。

## 11. ログインして管理画面を開く

1. トップページへ戻る
2. さきほど作った管理者メールアドレスでログイン
3. `/admin` を開く

ここから動画やクイズを追加できます。

## 12. 今後の更新方法

以後は基本的に次だけです。

1. このリポジトリへ変更を commit
2. GitHub に push
3. App Hosting が自動デプロイ

## 13. トラブル時の確認ポイント

- ログインできない
  - Authentication のメール / パスワードが ON か確認
- `/setup` で失敗する
  - `APP_SETUP_TOKEN` が App Hosting に設定されているか確認
  - 入力したトークンが一致しているか確認
  - すでにセットアップ済みなら、再実行ではなく作成済み管理者でログインします
- 画面が真っ白
  - `NEXT_PUBLIC_FIREBASE_*` の値がすべて入っているか確認
- 管理画面に入れない
  - `/setup` が成功したか確認
  - 作成したメールアドレスでログインしているか確認
  - 反映直後は認証情報の反映に少し時間がかかることがあるので、いったんログアウトして再ログインします

## 14. もっと簡単にしたい場合

初心者向けの最短運用は次です。

1. Firebase プロジェクト作成
2. Blaze 設定
3. Auth / Firestore 有効化
4. GitHub 連携で App Hosting 作成
5. `NEXT_PUBLIC_FIREBASE_*` と `APP_SETUP_TOKEN` を設定
6. デプロイ完了
7. `/setup` で最初の管理者作成

この流れなら、ローカルサーバーを立てずに使い始められます。
