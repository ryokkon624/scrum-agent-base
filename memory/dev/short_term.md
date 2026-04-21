# Dev 短期記憶

**スプリント**: Sprint 05  
**最終更新**: 2026-04-21

---

## 担当タスクメモ

### PBI-009: 家事テンプレート画面のi18n対応
- ブランチ: fix/10-housework-template-i18n (hw-hub-frontend)
- 対応内容:
  - i18nキー `columns.nameJa` を `columns.name` にリネームし列タイトルを「家事名」に変更
  - `useHouseworkTemplate` の `getLocalizedName` を使い、locale に応じた家事名表示に対応
  - おすすめバッジのハードコード「あり」を `columns.recommendationYes` i18nキーに置換（ja: あり / en: Yes / es: Si）
  - PC版テーブル・SP版カード両方を修正

### PBI-010: 買い物アイテム削除機能
- ブランチ: feature/12-delete-shopping-item (hw-hub-frontend + hw-hub-backend)
- バックエンド:
  - `ShoppingItemRepository` に `deleteById` メソッド追加
  - `ShoppingItemService.delete()` で認可チェック + 添付画像削除 + 本体削除
  - `ShoppingItemController` に `DELETE /api/shopping-items/{shoppingItemId}` エンドポイント追加
- フロントエンド:
  - `shoppingItemApi.deleteItem()` 追加
  - `shoppingStore.deleteItem()` でAPI呼び出し + キャッシュからアイテム除去
  - `ShoppingItemDetailPage.vue` に削除ボタン追加（未購入ステータスのみ表示）
  - confirm ダイアログ → 削除 → router.back() で一覧に戻る

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 05ではなし) | - | - | - |

---

## POへの未解決質問

なし

---

*スプリント終了後、long_term.mdに要約して移す*
