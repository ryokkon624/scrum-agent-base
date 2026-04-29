# Dev 短期記憶

**スプリント**: Sprint 10  
**最終更新**: 2026-04-29

---

## 担当タスクメモ

### Issue #32: houseworkTaskStoreカプセル化（SP:2）
- **ブランチ**: `refactor/32-housework-task-store-encapsulation`
- 実装方針（りょこさん承認済み 2026-04-29）:
  - `houseworkTaskStore.ts` に `tasksFor(householdId, status)` getter を追加（`itemsFor` と同パターン）
  - 3コンポーネントの `cacheByKey` 直接参照をgetter経由に変更:
    - `src/components/home/MyTasksCard.vue` (29行目)
    - `src/components/home/UnassignedTasksCard.vue` (27行目)
    - `src/components/home/HouseholdSituationCard.vue` (64-65行目)
  - `getCacheKey` action の使用箇所確認後、不要なら削除
  - `tasksFor` の単体テスト追加（TDD: RED → GREEN → REFACTOR）
- **TaskCreateリスト**:
  - [ ] #32 tasksFor getter追加（テスト先行）
  - [ ] #32 3コンポーネントのgetter経由修正
  - [ ] #32 getCacheKey action 不要なら削除

### Issue #3: おうち未所属ガード＆導線整理（SP:5）
- **ブランチ**: `feature/3-household-guard-guide`
- 実装方針（りょこさん承認済み 2026-04-29）:
  - **AC7先行（必須）**: `OnboardingCard` 内の「おうちに参加・作成する」カードを `OnboardingStepCard.vue` として切り出し。もう一つのカード切り出しはDEV判断
  - **AC1**: `ShoppingListPage.vue` — おうち未所属時に `OnboardingStepCard` を表示（追加メッセージあり）
  - **AC2**: `ShoppingListPage.vue` の「追加する」ボタンを非活性。`ShoppingItemCreatePage.vue` は登録ボタン非活性のみ（OnboardingCard表示は不要）
  - **AC3**: `HouseworkSettingsPage.vue` — おうち未所属時に `OnboardingStepCard` を表示（追加メッセージあり）
  - **AC4**: `HouseworkSettingsPage.vue` の登録ボタンを非活性。`HouseworkCreatePage.vue` は登録ボタン非活性のみ
  - **AC5**: PC版 `AppLayout.vue` — 「おうちが選択されていません」を「＋ おうちに参加・作成」リンクボタンに変更（カッコよいスタイル・他ナビボタン踏襲不要）
  - **AC6**: `HouseholdSwitcherField.vue` — `noneSelected` キーの使用箇所確認、他で使われていなければキーの値を「+ おうちに参加・作成」に変更。おうち設定画面へ遷移
  - **i18n**: 新規追加・変更キーは ja/en/es 3言語全対応必須
- **TaskCreateリスト**:
  - [ ] #3 OnboardingStepCard.vue 切り出し（AC7先行）
  - [ ] #3 AC1・AC2 ShoppingListPage修正
  - [ ] #3 AC3・AC4 HouseworkSettingsPage修正
  - [ ] #3 AC5 PC版AppLayout修正
  - [ ] #3 AC6 HouseholdSwitcherField修正
  - [ ] #3 i18n（ja/en/es）追加・変更

---

## 過去スプリントの担当タスクメモ

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
