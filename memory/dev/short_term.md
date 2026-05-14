# Dev 短期記憶

**スプリント**: Sprint 33
**最終更新**: 2026-05-13

---

## スプリントゴール

買い物リスト画面をモバイルに実装し、タブ切り替え・スワイプ操作で買い物中の体験を向上させる

---

## 対象Issue（featureラベル）

| Issue | 内容 | SP | ブランチ |
|-------|------|----|----|
| #85 | [mobile] 買い物リスト画面を実装する (#13) | TBD | `feature/85-mobile-shopping-list` |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`

---

## 承認済み実装方針

### #85: 買い物リスト画面を実装する

**コミットメッセージ**: `feat: モバイルの買い物リスト画面を実装する (ryokkon624/hw-hub-manage#85)`

**全体アーキテクチャ（My Tasks(#67)実装パターンを踏襲）**:

`features/shopping/` 配下に feature-first 構成で実装する。

```
features/shopping/
├── shopping_providers.dart                # Repository / Notifier の Provider 定義
├── data/
│   ├── shopping_repository.dart           # interface + impl
│   └── models/
│       └── shopping_item_dto.dart         # 既存 home 配下のDTOを移動 or 新規（hasImage, favorite, memo, purchasedAt 含む）
└── presentation/
    ├── shopping_list_notifier.dart        # AsyncNotifier
    ├── shopping_list_state.dart           # items / locationFilter / activeTab / isLoading
    └── widgets/
        ├── shopping_tab_bar.dart                # 3タブ（バッジ件数つき）
        ├── shopping_location_filter.dart        # 未購入タブ用の購入場所フィルタ
        ├── unpurchased_tab.dart                 # 未購入タブの本体
        ├── basket_tab.dart                      # かごタブの本体（一括購入済みボタン含む）
        ├── purchased_tab.dart                   # 購入済みタブの本体（日付グループ）
        ├── swipeable_shopping_card.dart         # 未購入・かごのスワイプ可能カード（variant切替）
        ├── purchased_item_tile.dart             # 購入済みタブのアイテム行
        └── bulk_purchase_dialog.dart            # かご一括購入済み確認ダイアログ
```

**ルーティング**:
`app_router.dart` の `AppRoutes.shopping` の builder を `const _P('買い物リスト')` から `const ShoppingListPage()` に差し替える。サブルート（`/shopping/new`・`/shopping/:id`）は本Issueのスコープ外（プレースホルダー維持）。

**Repository（`shopping_repository.dart`）の責務**:
- `fetchItems({required int householdId})` → `GET /api/households/{householdId}/shopping-items`
- `updateStatus({required int shoppingItemId, required String status})` → `PATCH /api/shopping-items/{id}/status`
- `bulkUpdateStatus({required List<int> ids, required String status})` → `PATCH /api/shopping-items/bulk-status`（**リクエストキーは `ids`**。webの api と一致）
- `toggleFavorite({required int shoppingItemId, required String favorite})` → `PATCH /api/shopping-items/{id}/favorite`
- `deleteItem({required int shoppingItemId})` → `DELETE /api/shopping-items/{id}`

`DioException` → `AppException` 変換は既存 `MyTasksRepositoryImpl` と同じパターン。

**AC2 購入場所フィルタ方針（web ShoppingStoreTypeFilter.vue 調査結果）**:
webのSP版は `すべて / スーパー(1) / ドラッグストア(3) / オンライン(2)` を **固定4ボタン**で常に表示する（動的増減なし）。モバイルも同方針で実装する。`PurchaseLocationType` enum 全値（3種）＋「すべて」の計4ボタン固定表示。

**State 設計**:

```dart
enum ShoppingTab { unpurchased, basket, purchased }

class ShoppingListState {
  final List<ShoppingItemDto> items;        // 全アイテム（フィルタ前）
  final String? locationFilter;              // null=全て、PurchaseLocationType.code値
  final ShoppingTab activeTab;
  // 派生 getter: unpurchasedItems / basketItems / purchasedItems(直近7日)
  //              filteredUnpurchasedItems / purchasedItemsByDate
}
```

**Notifier の操作**:
- `setTab(ShoppingTab)` / `setLocationFilter(String?)` … state 更新のみ
- `moveToBasket(int)` / `markPurchased(int)` / `moveBackToUnpurchased(int)` … `updateStatus` を呼んでローカル state も更新
- `bulkPurchase()` … basket 内全件の id を集めて `bulkUpdateStatus` を呼ぶ
- `deleteItem(int)` … `deleteItem` API → state から除外
- `toggleFavorite(int)` … 現在の favorite を反転して `toggleFavorite` API

**スワイプ実装方針（AC11）**:
`SwipeableTaskCard` と同じく **`Dismissible` を使う**。`dismissThresholds` で30%、`confirmDismiss` でアクションを実行して true を返すパターン。

- 未購入カード: `background`（左→右スワイプ・右側に出る色 emerald-500 「かごへ」）/ `secondaryBackground`（右→左スワイプ・rose-500 「削除」、ただし削除は確認ダイアログ表示後にのみ確定するため `confirmDismiss` で `showDialog` を await し、キャンセル時は false を返してカードを戻す）
- かごカード: emerald-500「購入済みに」/ slate-400「戻す」
- 購入済みカード: `Dismissible` を使わず通常の `Container` にする

> AC11 のドラッグ追従とアクション確定は `Dismissible` が標準で備えている挙動でカバーできる。トーストは `ScaffoldMessenger` の SnackBar で表示する。

**i18n 追加キー（ja/en/es）**:
- `shoppingListTitle` / `shoppingListAddItemButton`
- `shoppingTabUnpurchased` / `shoppingTabBasket` / `shoppingTabPurchased`
- `shoppingFilterAll` / `shoppingFilterSupermarket` / `shoppingFilterDrugstore` / `shoppingFilterOnline`
- `shoppingSwipeMoveToBasket` / `shoppingSwipeDelete` / `shoppingSwipeMarkPurchased` / `shoppingSwipeMoveBack`
- `shoppingBulkPurchaseButton` / `shoppingBulkPurchaseConfirm` / `shoppingBulkPurchaseConfirmMessage`
- `shoppingDeleteConfirm` / `shoppingDeleteConfirmMessage`
- `shoppingToastMovedToBasket` / `shoppingToastMarkedPurchased` / `shoppingToastDeleted` / `shoppingToastMovedBack` / `shoppingToastBulkPurchased`
- `shoppingPurchasedDateGroupToday` / `shoppingPurchasedDateGroupYesterday` / `shoppingPurchasedDateGroupOther`
- `shoppingEmptyUnpurchased` / `shoppingEmptyBasket` / `shoppingEmptyPurchased`

**カラー方針**:
- 購入場所カラーバー: `PurchaseLocationType` の各色（mobile-conventions に従って既存 surfaceCard / border 等を使いつつ、購入場所別の色は新規トークン化が必要なら追加）
- スワイプ背景は `colors.swipeAction`（emerald-500相当）/ `colors.swipeDelete`（rose-500相当）/ `colors.swipeDisabled`（slate-400相当）を使い回す（既存定義あり）

---

## 作業順序（TDD: RED → GREEN → REFACTOR）

1. **Repository**: interface 定義 → impl 実装 → repository_test（成功パス + DioException 変換）
2. **State + Notifier**: state クラス → notifier の各操作 → notifier_test（タブ切替・フィルタ・各 API 操作の状態遷移）
3. **i18n キー追加**: ja/en/es の ARB を編集 → `flutter gen-l10n`
4. **Page + Widget**: tab_bar → list ページ → swipeable_shopping_card → dialog → page_test（ウィジェットテスト）
5. **router 差し替え**: `_P('買い物リスト')` を `ShoppingListPage()` に
6. **AC16: カバレッジ計測**: `coverage.ps1` で ≥95% 達成を確認

---

## テスト方針

| 対象 | テスト |
|------|--------|
| `ShoppingRepositoryImpl` | 各メソッドの成功パス + DioException→AppException 変換 |
| `ShoppingListNotifier` | タブ切替・フィルタ・moveToBasket / markPurchased / moveBackToUnpurchased / bulkPurchase / deleteItem / toggleFavorite の状態遷移（成功・エラー） |
| `ShoppingListPage`（ウィジェット） | 3タブ表示・件数バッジ・購入場所フィルタ・空状態表示・スワイプによる状態遷移・確認ダイアログ・「+ アイテムを追加」「カードタップ」のナビゲーション |

---

## 変更ファイル一覧

**新規:**
- `lib/features/shopping/shopping_providers.dart`
- `lib/features/shopping/data/shopping_repository.dart`
- `lib/features/shopping/data/models/shopping_item_dto.dart`（home配下のDTOを共通化）
- `lib/features/shopping/presentation/shopping_list_page.dart`
- `lib/features/shopping/presentation/shopping_list_notifier.dart`
- `lib/features/shopping/presentation/shopping_list_state.dart`
- `lib/features/shopping/presentation/widgets/shopping_tab_bar.dart`
- `lib/features/shopping/presentation/widgets/shopping_location_filter.dart`
- `lib/features/shopping/presentation/widgets/unpurchased_tab.dart`
- `lib/features/shopping/presentation/widgets/basket_tab.dart`
- `lib/features/shopping/presentation/widgets/purchased_tab.dart`
- `lib/features/shopping/presentation/widgets/swipeable_shopping_card.dart`
- `lib/features/shopping/presentation/widgets/purchased_item_tile.dart`
- `lib/features/shopping/presentation/widgets/bulk_purchase_dialog.dart`
- `test/features/shopping/` 配下にテスト一式

**編集:**
- `lib/app_router.dart`（`_P('買い物リスト')` を `ShoppingListPage()` に差し替え）
- `lib/l10n/app_ja.arb` / `lib/l10n/app_en.arb` / `lib/l10n/app_es.arb`（i18nキー追加）
- 必要に応じて `lib/core/theme/app_color_scheme.dart`（購入場所カラーバー用トークン追加）

---

## コミット前チェックリスト

- [ ] ACをすべて満たしているか（特に AC1〜AC16）
- [ ] `dart format .`
- [ ] `flutter analyze`（警告ゼロ）
- [ ] `flutter test`（全グリーン）
- [ ] `coverage.ps1` でカバレッジ ≥95%
- [ ] シミュレーターまたはウィジェットテストで実際の見た目（タブ・スワイプ・カード幅・バッジ件数）を確認した
- [ ] AppLocalizations の import パスは `lib/l10n/app_localizations.dart` への相対パス
- [ ] `git push -u origin feature/85-mobile-shopping-list`

---

## 作業ルール

- [DEV] プレフィックスをDiscord投稿に必ずつける
- 作業スレッドID: `1504024781492584583`
- ブランチ: `feature/85-mobile-shopping-list`（main から新規作成）
- PRはSMが行う。DEVはpushまでが担当

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #85 買い物リスト画面実装 | バグ修正完了・push済み（feature/85-mobile-shopping-list） |

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-05-13 | カバレッジ計測で home/ ファイルが混入 | lcov.infoのSF:パスが `features\shopping` と `features\home` を両方含む | awk でパス判定して features.shopping のみ集計 |
| 2026-05-13 | ServerException のコンストラクタがnamed引数 | `const ServerException('msg')` → コンパイルエラー | `const ServerException(message: 'msg')` に修正 |
| 2026-05-13 | find.text('削除') が複数ヒット | スワイプ背景のラベルとダイアログボタン両方にある | `find.text('削除').last` でダイアログボタンを特定 |
| 2026-05-13 | Sprint Review中に「予期しないエラー」が表示される | `fetchItems()` が `response.data as List<dynamic>` でキャストしていたが、実際のレスポンスは `{"items": [...]}` のラッパー形式 | `(response.data as Map<String, dynamic>)['items'] as List<dynamic>` に修正。テストのモックも同様に修正 |
