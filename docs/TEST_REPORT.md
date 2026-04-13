# テスト実施報告書

## 実施日

- 2026-04-13

## 実施方針

- まず `localhost` 上でスモークテストを実施
- その後、人が順番に画面を触ることを想定した詳細 E2E を実施
- さらに入力、進行ロジック、seed 整合性、Firestore Rules、型、lint、build を再確認
- 外部公開や本番 Hosting は使わず、ローカルと Firebase Emulator 内で完結

## 実施コマンド

```bash
npm run test:e2e:smoke
npm run test:e2e
npm run verify
npm run test:rules
npx tsc --noEmit
npm run lint
npm run build
```

## 実施結果

### 1. ブラウザスモーク

- `npm run test:e2e:smoke` : PASS
- iPhone 相当レイアウト : PASS
- Android 相当レイアウト : PASS

確認できた内容:

- トップ、ログイン、新規登録がモバイル幅で崩れず表示される
- 未ログインで保護ページへ行くとログインへ戻る
- 下部固定メニューの表示条件が崩れていない
- seed 済み admin で管理画面とユーザー進行確認へ到達できる

### 2. ブラウザ詳細 E2E

- `npm run test:e2e` : PASS

学習者フロー:

- 新規登録
- 性別登録
- アバター選択
- ダッシュボード到達
- プロフィール更新
- マップ移動
- 地点接触
- 解放済み動画遷移
- 視聴完了記録
- クイズ合格
- 履歴確認
- 再ログイン後の進行維持確認

admin フロー:

- 管理画面ログイン
- 動画追加
- クイズ追加
- 一覧反映確認

### 3. 入力・ロジック・seed 整合性

- `npm run verify` : PASS

確認できた内容:

- 各 zod schema の正常系/異常系
- 視聴回数閾値による解放判定
- クイズ採点
- 動画1→動画2→動画3の解放連鎖
- seed コレクション間参照整合
- 座標と選択肢の整合

### 4. Firestore Rules

- `npm run test:rules` : PASS

確認できた内容:

- 公開マスタ読取
- 本人データのみの read/write
- 他人データ参照拒否
- 一般ユーザーの教材編集拒否
- `users.role` の勝手な昇格拒否
- admin の教材編集許可

### 5. 品質ゲート

- `npx tsc --noEmit` : PASS
- `npm run lint` : PASS
- `npm run build` : PASS

## 実施中に修正した点

- Firestore のユーザー系読取を `uid` 条件付きクエリへ寄せて Rules と整合
- 未作成ドキュメントへの直接 `getDocument` を避け、所有データ一覧から探索する方式へ修正
- `users` 更新 Rules を差分ベースの許可項目判定へ整理
- `userVideoStats` / `userQuizResults` の Rules を create/update/read で明示化
- E2E の曖昧セレクタを `exact: true` へ修正
- Firebase Emulator 対応の localhost E2E 環境を追加

## 未カバー/今後の確認

- 実機 iPhone Safari の慣性スクロールやキーボード表示時の余白
- 実機 Android Chrome のアドレスバー伸縮時の見切れ
- YouTube 埋め込みの実再生完了判定
- 本番向け admin 権限の Custom Claims 化
