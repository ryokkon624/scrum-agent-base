# Dev 短期記憶

**スプリント**: Sprint 14
**最終更新**: 2026-05-01

---

## 担当タスクメモ

### Issue #45: スワイプ背景アイコン削除（SP:1）【完了】

- **ブランチ**: `fix/45-remove-swipe-bg-icon`
- **ステータス**: 実装完了・push済み
- **コミット**: `fix: 購入済みアイテム左スワイプ時の背景アイコンと背景色を削除`

---

### Issue #44: スケルトンスクリーン導入（SP:3）【完了・レビュー指摘対応済み】

- **ブランチ**: `feature/44-skeleton-screen`
- **ステータス**: レビュー指摘対応完了・push済み
- **コミット（実装）**: `feat: スケルトンスクリーンを家事割り当て・MyTasks・買い物リスト画面に導入`
- **コミット（レビュー対応）**: `refactor: レビュー指摘対応 - SkeletonItemの不要なcomputed削除・memberMapでO(1)参照に改善 (ryokkon624/hw-hub-manage#44)`
- **変更ファイル**:
  - `src/components/ui/SkeletonItem.vue`（新規・containerClass/itemClass computed削除）
  - `src/views/housework/assignment/HouseworkAssignmentPage.vue`（memberMap computed追加）
  - `src/views/housework/tasks/MyTasksPage.vue`
  - `src/views/shopping/ShoppingListPage.vue`

---

## 作業順

1. #45（fix/45-remove-swipe-bg-icon）→ コミット・push ✅
2. #44（feature/44-skeleton-screen）→ コミット・push ✅

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 14ではなし) | | | |

---

*スプリント終了後、long_term.mdに要約して移す*
