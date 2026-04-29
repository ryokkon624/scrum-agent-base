# Dev 短期記憶

**スプリント**: Sprint 10  
**最終更新**: 2026-04-28

---

## 担当タスクメモ

### Issue #31: 買い物アイテム更新APIのURL変更
- ブランチ: refactor/31-shopping-item-put-url (hw-hub-backend / hw-hub-frontend)
- 対応内容:
  - **バックエンド**:
    - `ShoppingItemController.update`: `PUT /api/households/{householdId}/shopping-items/{shoppingItemId}` → `PUT /api/shopping-items/{shoppingItemId}` に変更
    - `ShoppingItemService.update`: `householdId` 引数を削除し、認可チェックを `updateStatus`/`updateFavorite` と同じく `item.getHouseholdId()` ベースに統一
    - 例外を `IllegalArgumentException`/`IllegalStateException` から `ResourceNotFoundException`/`AccessDeniedException` に変更（他メソッドと統一）
    - `ShoppingItemControllerSpec` / `ShoppingItemServiceSpec` を新シグネチャに更新（TDDで RED→GREEN）
  - **フロントエンド**:
    - `shoppingItemApi.updateItem`: 引数から `householdId` を削除し、URL を `/api/shopping-items/{shoppingItemId}` に変更
    - `shoppingStore.updateItemBasicInfo`: 新シグネチャに合わせて API 呼び出しを更新
    - `doc/api_integration.md` のURL記載を更新
- **コードレビュー指摘対応 (2026-04-28追加)**:
  - `ShoppingItemIntegrationSpec` に `PUT /api/shopping-items/{shoppingItemId}` の統合テストを追加
    - 正常系（200）: name/memo/storeType/favorite を更新 → DBが更新されること
    - 認可エラー（403）: 別世帯のアイテムを更新しようとして拒否されること
  - `./gradlew test` および `./gradlew integrationTest` ともに BUILD SUCCESSFUL を確認
  - コミット: `999ad9f` test: PUT /api/shopping-items/{id} の統合テストを追加 (ryokkon624/hw-hub-manage#31)

### Issue #28: storeの内部状態フィールドカプセル化
- ブランチ: refactor/28-store-internal-field-encapsulation (hw-hub-frontend)
- 対応内容:
  - `houseworkStore` に `isFetchedFor(householdId: number): boolean` getter を追加
  - `OnboardingCard.vue` の `lastFetchedAtByHouseholdId` への直接アクセスを `isFetchedFor` 経由に変更
  - `houseworkStore.spec` に `isFetchedFor` の単体テストを追加（TDDで RED→GREEN）
- 横展開確認結果:
  - `lastFetchedAtByHouseholdId` の直接参照: 修正対象の `OnboardingCard.vue` のみ
  - 別フィールド `itemsByHouseholdId` の直接参照を `HouseholdSettingsPage.vue:868` で発見 → りょこさんに別Issue化要確認（投げかけ済み、未返信）

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 10ではなし) | | | |

---

## POへの未解決質問

- Issue #28 の AC3 横展開確認の結果、`HouseholdSettingsPage.vue:868` で `houseworkStore.itemsByHouseholdId` の直接参照を発見。別Issueに切り出すか今回スコープに含めるか判断待ち（Discord投稿済み）

---

*スプリント終了後、long_term.mdに要約して移す*
