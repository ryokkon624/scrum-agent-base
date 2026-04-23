# Sprint 08 スプリントバックログ

**期間**: 2026-04-23〜
**スプリントゴール**: セキュリティ脆弱性の修正とAPIドキュメントの整備

---

## 対象Issue

| Issue | タイトル | ブランチ | SP | 優先度 |
|-------|---------|---------|-----|--------|
| #20 | [security] HouseworkTaskService.bulkUpdateStatus の認可チェック漏れ | `fix/20-bulk-update-status-auth` | 3 | 高 |
| #22 | [#18 作業漏れ] hw-hub-frontend/doc/api_integration.md に bulk-status エンドポイントを追加 | `docs/22-api-integration-bulk-status` | 1 | 中 |

---

## Issue #20: bulkUpdateStatus 認可チェック漏れ修正

**ユーザーストーリー**: 世帯メンバーとして、他世帯のタスクを自分のリクエストで変更されないようにしたい

**発生事象**:
`HouseworkTaskService.bulkUpdateStatus` で、リスト先頭のタスクID（`taskIds.get(0)`）のみで世帯認可チェックを実施。残りのIDへの認可チェックが漏れており、悪意のあるユーザーが自世帯のタスクIDと他世帯のタスクIDを混在させてリクエストすると、他世帯のタスクのステータスを不正に更新できる。

**深刻度**: 高

**AC一覧**:

- [x] AC1: `bulkUpdateStatus` に渡された全 `taskIds` が、認証ユーザーの世帯に属することを検証し、1件でも不正なIDが含まれる場合は 403 を返す
- [x] AC2: 自世帯のタスクIDのみを含むリクエストは正常に処理される（既存動作を壊さない）
- [x] AC3: 他世帯のタスクIDを混在させたリクエストで、他世帯のステータスが更新されないことをテストで確認

**GitHub Issue**: `(ryokkon624/hw-hub-manage#20)`

---

## Issue #22: api_integration.md に bulk-status エンドポイント追加

**ユーザーストーリー**: フロントエンド開発者として、API連携ドキュメントにbulk-statusエンドポイントの情報がほしい

**発生事象**:
Sprint 07 #18（onClickCompletePurchase並列化）でバックエンドにバッチ更新API（POST /api/shopping-items/bulk-status）を追加したが、hw-hub-frontend/doc/api_integration.md の更新が漏れている。

**AC一覧**:

- [x] AC1: `hw-hub-frontend/doc/api_integration.md` に `POST /api/shopping-items/bulk-status` のエンドポイント情報が追加されている
- [x] AC2: 既存の記載フォーマットに準拠している

**GitHub Issue**: `(ryokkon624/hw-hub-manage#22)`

---

## 作業順序

1. **#20 を先に実施**（深刻度: 高・セキュリティ修正優先）
2. #22 を実施（ドキュメント整備）

---

## 完了チェックリスト（DEV用）

- [x] 各ACを実装コードと照合して確認
- [x] `npm run format`（フロントエンド変更時）または `./gradlew spotlessApply`（バックエンド変更時）を実施
- [x] API追加・変更時は `hw-hub-frontend/doc/api_integration.md` を必ず更新
- [x] コミットメッセージにIssue番号を含める（例: `fix: #20 bulkUpdateStatus全taskIdの認可チェック追加`）
- [x] 作業開始時・完了時・レビュー指摘対応完了時に `#20-sprint` の作業スレッドに投稿
