# Dev 短期記憶

**スプリント**: Sprint 07  
**最終更新**: 2026-04-23

---

## 担当タスクメモ

### Issue #17: api_integration.md の更新
- ブランチ: docs/17-update-api-integration-doc (hw-hub-frontend)
- 対応内容:
  - `doc/api_integration.md` のセクション3「買い物アイテム詳細」に `DELETE /api/shopping-items/{id}` を追記
  - 関連コンポーネント: `shoppingStore` (`shoppingItemApi`)

### Issue #18: onClickCompletePurchase の並列化
- ブランチ: refactor/18-parallelize-complete-purchase (hw-hub-frontend + hw-hub-backend)
- バックエンド:
  - `PATCH /api/shopping-items/bulk-status` エンドポイントを追加
  - `BulkUpdateStatusRequest` DTO (`ids: List<Long>`, `status: String`)
  - `ShoppingItemService.bulkUpdateStatus()` を追加（@Transactional）
  - `ShoppingItemServiceSpec.groovy` にbulkUpdateStatusのUT3件追加
- フロントエンド:
  - `shoppingItemApi.bulkUpdateStatus(ids, status)` を追加
  - `shoppingStore.bulkUpdateStatus(householdId, ids, status)` を追加
  - `ShoppingListPage.vue` の `onClickCompletePurchase` をループ→バッチAPI1回に変更
  - `shoppingItemApi.spec.ts` に bulkUpdateStatus のUT追加
  - `shoppingStore.spec.ts` に bulkUpdateStatus のUT追加（mock追加含む）

### Issue #19: SP版LandingPageのサインアップボタン折り返し
- ブランチ: fix/19-sp-header-layout (hw-hub-frontend)
- 対応内容:
  - `LandingPage.vue` のログインボタン: `hidden sm:block` → `hidden md:block`
  - `LandingPage.vue` のサインアップボタン: `hidden md:block` クラスを追加
  - SP版（md未満）でログイン・サインアップボタンを非表示に変更

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-04-22 | #16のブランチを間違えた | バックログのブランチ指定を確認せずmainから新規ブランチを切った | SMからの指示で fix/10 ブランチに再コミット。未マージブランチ上のバグ修正は、そのブランチに追加コミットする |

---

## POへの未解決質問

なし

---

*スプリント終了後、long_term.mdに要約して移す*
