# Dev 短期記憶

**スプリント**: Sprint 08  
**最終更新**: 2026-04-23

---

## 担当タスクメモ

### Issue #20: bulkUpdateStatus 認可チェック漏れ修正
- ブランチ: fix/20-bulk-update-status-auth (hw-hub-backend)
- 対応内容:
  - `HouseworkTaskRepository` に `countByIdsAndHouseholdId` メソッドを追加
  - `HouseworkTaskCustomMapper.xml` に COUNT クエリを追加
  - `HouseworkTaskService.bulkUpdateStatus` で全taskIdが同一世帯に属することを検証
  - 不正なIDが含まれる場合は `AccessDeniedException`（403）を返す
  - `HouseworkTaskServiceSpec` に他世帯ID混在テストを追加、既存テストにcountモック追加

### Issue #22: api_integration.md に bulk-status エンドポイント追加
- ブランチ: docs/22-api-integration-bulk-status (hw-hub-frontend)
- 対応内容:
  - `doc/api_integration.md` のセクション3「買い物リスト」に `PATCH /api/shopping-items/bulk-status` を追記
  - 既存フォーマット（空セル継続行パターン）に準拠

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 08ではなし) | | | |

---

## POへの未解決質問

なし

---

*スプリント終了後、long_term.mdに要約して移す*
