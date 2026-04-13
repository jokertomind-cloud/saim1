# 本番強度向上プラン

## 短期

- admin 判定を `Custom Claims 優先 + Firestore role フォールバック` に統一する
- Firestore Rules でも `request.auth.token.admin == true` を優先できる形にする
- 管理者付与/剥奪を安全なスクリプトで行えるようにする
- ローカルと本番の Firebase 設定を README 上で分離する

## 中期

- 動画視聴記録、クイズ採点、解放判定を Cloud Functions へ寄せる
- 進行イベントログを残し、監査しやすくする
- Rules テストに claims 経由の admin パターンを追加する

## 長期

- `users.role` を補助表示用に限定し、権限正本を Custom Claims に一本化する
- 視聴完了判定を YouTube IFrame API 連携へ切り替える
- Functions と Rules の CI を整備し、権限変更の事故を防ぐ
