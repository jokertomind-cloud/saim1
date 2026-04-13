# テスト仕様書

## 目的

本仕様書は、ドット学習マップ Web アプリの MVP に対して、以下の観点を漏れなく検証するためのものです。

- 入力バリデーション
- 学習進行ロジック
- Firestore に投入する seed データ整合性
- Firestore Security Rules
- localhost ブラウザのスモークテスト
- localhost ブラウザの詳細 E2E
- ビルド可能性
- 型整合性
- lint 品質

## 前提

- Firebase 本番プロジェクトへの書き込みを伴う E2E は本仕様には含めない
- 外部公開 URL へのテストは行わない
- `localhost` と Firestore Emulator を使ったローカル検証を基本とする
- ブラウザテストも `localhost` と Firebase Emulator 内で完結させる
- 代わりに以下を組み合わせて総当たりに近づける
  - 型チェック
  - lint
  - production build
  - seed データ参照整合性検証
  - 入力スキーマ検証
  - 学習進行ロジックのケース検証
  - 人手操作を想定した Playwright スモークテスト
  - 人手操作を想定した Playwright 詳細 E2E

## テスト観点

### 1. 入力テスト

対象:

- 新規登録
- プロフィール更新
- マップ CRUD
- 地点 CRUD
- 動画 CRUD
- クイズ CRUD
- アバター CRUD

確認事項:

- 必須項目が空のときに失敗する
- 数値項目が下限未満のときに失敗する
- enum 項目が不正値のときに失敗する
- URL 項目が不正形式のときに失敗する
- 正常系で通る

### 2. 動作テスト

対象:

- 性別一致判定
- 動画解放判定
- 視聴回数達成判定
- クイズ採点
- クイズ合格後の進行再計算

確認事項:

- 対象性別が不一致なら解放されない
- 前提動画未達成なら次動画は解放されない
- 前提クイズ未合格なら次動画は解放されない
- 視聴回数が閾値未満/以上で状態が変わる
- クイズが満点/不合格で状態が変わる
- 動画1完了+クイズ1合格で動画2が解放される
- 動画2完了+クイズ2合格で動画3が解放される

### 3. DB/seed 整合性テスト

対象:

- avatars
- maps
- mapPoints
- videos
- quizzes
- quizQuestions

確認事項:

- `mapPoints.mapId` が既存 `maps` を参照する
- `videos.mapPointId` が既存 `mapPoints` を参照する
- `quizzes.videoId` が既存 `videos` を参照する
- `quizQuestions.quizId` が既存 `quizzes` を参照する
- `mapPoints.videoIds` が既存 `videos` を参照する
- `prerequisiteVideoIds` / `prerequisiteQuizIds` が既存データを参照する
- マップ座標が範囲内である
- 障害物座標が範囲内である
- 開始座標が範囲内である
- クイズ正解キーが選択肢に存在する
- true/false 問題の選択肢数が2である
- 各動画にクイズが1つ以上ある
- 各クイズに問題が1つ以上ある

### 4. 品質ゲート

対象:

- TypeScript
- ESLint
- Next.js build

確認事項:

- `npx tsc --noEmit` 通過
- `npm run lint` 通過
- `npm run build` 通過

### 5. Firestore Rules 結合テスト

対象:

- `users`
- `userProgress`
- `userVideoStats`
- 公開マスタ
- admin 専用書き込み

確認事項:

- 未認証ユーザーが公開マスタを読める
- 一般ユーザーが自分の `users` / `userProgress` を読める
- 一般ユーザーが他人の `users` / `userProgress` を読めない
- 一般ユーザーが自分の `userVideoStats` を書ける
- 一般ユーザーが教材マスタを書けない
- 一般ユーザーが `role` を `admin` に変更できない
- admin が教材マスタを書ける
- admin が他人の進行情報を読める

### 6. localhost ブラウザスモークテスト

対象:

- トップページ
- ログイン
- 新規登録
- 保護ページリダイレクト
- admin 画面

確認事項:

- トップページが描画される
- ログイン画面が描画される
- 新規登録画面で seed 済みアバターが表示される
- 未ログインで保護ページへ行くとログイン画面へ戻る
- admin ユーザーで管理画面概要を開ける
- admin ユーザーがユーザー一覧から進行度詳細を見られる

### 7. localhost ブラウザ詳細 E2E

対象:

- 新規登録
- プロフィール更新
- マップ移動
- 動画視聴記録
- クイズ回答
- 履歴確認
- admin CRUD

確認事項:

- 新規登録した学習者がダッシュボードへ到達する
- プロフィールで表示名とアバターを更新できる
- マップ上を十字移動して地点接触メッセージが表示される
- 地点から解放済み動画へ遷移できる
- 視聴完了記録で視聴回数更新メッセージが出る
- クイズ合格で次動画が解放される
- 履歴画面に視聴履歴とクイズ履歴が出る
- 再ログイン後も解放状態が維持される
- admin が動画を追加できる
- admin がクイズを追加できる

## 実行手順

### 推奨実行順

1. `npm run test:e2e:smoke`
2. `npm run test:e2e`
3. `npm run verify`
4. `npm run test:rules`
5. `npx tsc --noEmit`
6. `npm run lint`
7. `npm run build`

### 人手操作を想定した詳細確認シナリオ

学習者:

1. 新規登録画面で表示名、性別、アバター、メール、パスワードを入力する
2. ダッシュボードに遷移し、現在レベルと次の行動が見えることを確認する
3. プロフィールで表示名とアバターを変更して保存する
4. マップを開いて仮想パッドまたは隣接タップで移動する
5. 地点に接触して地点情報と解放済み動画だけが見えることを確認する
6. 動画詳細へ進み、視聴完了を記録する
7. クイズへ進み、正解して次の動画が解放されることを確認する
8. 履歴で視聴履歴とクイズ結果が残っていることを確認する
9. いったんログアウトし、再ログイン後も進行状態が維持されることを確認する

admin:

1. 管理者でログインする
2. 動画一覧で新しい動画を追加する
3. クイズ一覧で新しいクイズを追加する
4. ユーザー一覧から対象ユーザーを開き、進行度を確認する
5. 一般ユーザーでは同じ編集導線が使えないことを確認する

### 自動検証

```bash
npm run verify
npm run test:rules
npm run test:e2e:smoke
npm run test:e2e
npx tsc --noEmit
npm run lint
npm run build
```

## カバー範囲

自動検証でカバーするもの:

- 入力仕様
- 進行ロジック
- DB投入前の seed データ整合性
- 参照関係
- Firestore Rules の主要権限制御
- localhost 上の主要画面遷移
- localhost 上の学習者フロー
- localhost 上の admin CRUD 基本操作
- ビルド可能性

自動検証で未カバーのもの:

- 実機 iPhone Safari / Android Chrome の操作感
- Firebase Auth / Firestore 実接続時の権限挙動
- YouTube 埋め込みの実再生状態
- Hosting 本番配信後のネットワーク条件差
- 公開インターネット上での運用条件差

## 残る手動確認

- 実機でマップ操作
- admin / 一般ユーザーの画面遷移
- Firestore Rules を Emulator または実 Firebase で確認
- YouTube 埋め込み表示確認
- iPhone Safari / Android Chrome の実機レイアウト確認
