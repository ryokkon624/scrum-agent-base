# Dev 短期記憶

**スプリント**: Sprint 35
**最終更新**: 2026-05-14

---

## スプリントゴール

買い物リスト機能の状態反映・削除機能バグを修正し、ユーザーが操作結果をリアルタイムで確認できるようにする

---

## 対象Issue（すべて bug ラベル）

| Issue | 内容 | コミット番号 |
|-------|------|----|
| #88 | かごタブスワイプ購入済み後、購入済みタブに即時表示されない | `fix: かごタブスワイプ購入済み後の購入済みタブ即時反映を修正 (ryokkon624/hw-hub-manage#88)` |
| #93 | アイテム追加後・お気に入り操作後、買い物リストに反映されない | `fix: アイテム追加・お気に入り操作後の買い物リスト即時反映を修正 (ryokkon624/hw-hub-manage#93)` |
| #96 | 画像削除モーダルが消えず、画像も削除されない | `fix: 買い物アイテム詳細画面の画像削除モーダル・削除処理バグを修正 (ryokkon624/hw-hub-manage#96)` |
| #94 | 削除ダイアログでボタン押下してもアイテムが削除されない | `fix: 買い物アイテム詳細画面の削除ダイアログ・削除ボタン表示バグを修正 (ryokkon624/hw-hub-manage#94)` |

リポジトリパス: `C:\work\hw-hub\hw-hub-mobile`
ブランチ: `feature/85-mobile-shopping-list`（既存・新規作成しない）
作業スレッドID: `1504411180876435597`
**各Issueごとに個別コミットを作成すること。**

---

## 承認済み実装方針

### #88: かご→購入済みスワイプ後、購入済みタブに表示されない

**原因**:
`shopping_list_state.dart` の `purchasedItems` getter は `status == '9'` かつ `purchasedAt != null` の両方を要求している。
一方 `shopping_list_notifier.dart` の `markPurchased` / `bulkPurchase` は `_copyItemWithStatus` で
status を '9' に変えるが `purchasedAt: item.purchasedAt`（元の null のまま）を保持する。
そのため購入済みタブの getter フィルタを通らず表示されない。
未購入↔かごは `purchasedAt` を条件にしないため即時反映される。再起動後はサーバーから `purchasedAt` 付きで返るため表示される。

**改修方針**:
`_copyItemWithStatus` に `purchasedAt` 引数を追加し、
- `markPurchased` / `bulkPurchase`（status='9'）→ `purchasedAt: DateTime.now().toIso8601String()` を渡す
- `moveToBasket`（'1'）/ `moveBackToUnpurchased`（'0'）→ `purchasedAt: null` を渡す（購入済みから戻したケースのクリーンアップ）
- 修正ファイル: `lib/features/shopping/presentation/shopping_list_notifier.dart`

### #93: アイテム追加後・お気に入り操作後、買い物リストに反映されない

**原因**:
`shopping_item_new_notifier.dart` の `submit` は `createItem` 成功後に
一覧側（`shoppingListNotifierProvider`）を invalidate していない。
詳細画面の `toggleFavorite` も同様。
`ShoppingListNotifier` は `AutoDispose` だが、`StatefulShellRoute.indexedStack` 配下では
一覧画面ウィジェットが `IndexedStack` で保持されるため AutoDispose が破棄されず古い state が残る。

**改修方針**:
Page 側の `ref.listen` で一覧 Provider を invalidate する（依存方向を守るため Notifier 内ではなく Page 側で実施）。
- `shopping_item_new_page.dart`: `ref.listen` の `successItemId` 検知ブロックに `ref.invalidate(shoppingListNotifierProvider)` を追加
- `shopping_item_detail_page.dart`: 詳細画面の `_DetailBody` でお気に入りスイッチ操作の都度 `ref.invalidate(shoppingListNotifierProvider)` を呼ぶ（りょこさん承認済み方針）
- 修正ファイル: `lib/features/shopping/presentation/shopping_item_new/shopping_item_new_page.dart`、
  `lib/features/shopping/presentation/shopping_item_detail/shopping_item_detail_page.dart`

### #96: 画像削除モーダルが消えず、画像も削除されない

**原因**:
`shopping_item_detail_page.dart` の `_confirmDeleteAttachment` 内の `AlertDialog` で
`builder: (_) => AlertDialog(...)` とダイアログの BuildContext を `_` で捨て、
actions の `Navigator.pop(context, true)` を外側（`_DetailBodyState`）の `context` で呼んでいる。
go_router 環境で外側 context の `Navigator.pop` を呼ぶと、ダイアログではなく
詳細画面ルート自体が pop される（→「メイン画面が買い物リストに遷移」）。
ダイアログは閉じず（barrier タップで初めて閉じる）、`showDialog` の `await` も完了しないため
`deleteAttachment` が呼ばれず画像も削除されない。

**改修方針**:
`AlertDialog` の `builder` でダイアログ context を受け取り（`builder: (dialogContext) =>`）、
actions の `Navigator.pop` をその `dialogContext` で呼ぶ。これでダイアログだけが閉じる。
- 修正ファイル: `lib/features/shopping/presentation/shopping_item_detail/shopping_item_detail_page.dart`（`_confirmDeleteAttachment`）

### #94: 削除ダイアログのボタンを押してもアイテムが削除されない

**原因**:
#96 と同一原因。`_confirmDeleteItem` 内の `AlertDialog` actions も `builder: (_)` で
ダイアログ context を捨て、外側 context で `Navigator.pop` している。
加えて削除ボタン表示制御の `isNotPurchased` getter が `notPurchased` だけでなく
`inBasket`（かご）も `true` を返すため、かご状態でも削除ボタンが表示される（AC3違反）。

**改修方針**:
1. `_confirmDeleteItem` の `AlertDialog` を `builder: (dialogContext) =>` にし、actions の `Navigator.pop` を `dialogContext` で呼ぶ（#96 と同じ修正）
2. `shopping_item_detail_state.dart` の `isNotPurchased` getter を `item?.status == ShoppingItemStatus.notPurchased.code` のみ true を返すよう修正（`inBasket` を条件から外す）。getter 名が実態と合致する形になる
- 修正ファイル: `lib/features/shopping/presentation/shopping_item_detail/shopping_item_detail_page.dart`（`_confirmDeleteItem`）、
  `lib/features/shopping/presentation/shopping_item_detail/shopping_item_detail_state.dart`（`isNotPurchased`）

---

## 作業順序（TDD: RED → GREEN → REFACTOR）／コミット単位

1. **#88**: `shopping_list_notifier_test.dart` に「markPurchased / bulkPurchase 後に purchasedItems に含まれる」テストを追加（RED）→ `_copyItemWithStatus` に purchasedAt 引数追加（GREEN）→ コミット
2. **#94**: `shopping_item_detail_state` の `isNotPurchased` テスト（かご→false）を追加（RED）→ getter 修正＋ダイアログ context 修正（GREEN）→ `shopping_item_detail_page_test` でダイアログ削除ボタンタップ→削除呼出を検証 → コミット
3. **#96**: `shopping_item_detail_page_test` で画像削除ダイアログのボタンタップ→deleteAttachment 呼出・ダイアログ閉じを検証（RED）→ ダイアログ context 修正（GREEN）→ コミット
4. **#93**: `shopping_item_new_page_test` / `shopping_item_detail_page_test` で成功時・お気に入り操作時に `shoppingListNotifierProvider` が invalidate されることを検証（RED）→ Page に invalidate 追加（GREEN）→ コミット

> #94 と #96 は同一ファイル（`shopping_item_detail_page.dart`）を触るが、Issue ごとに個別コミットするため
> #94 のコミット → #96 のコミットの順で、それぞれ該当メソッドのみを変更してコミットする。

---

## テスト方針

| 対象 | テスト |
|------|--------|
| `ShoppingListNotifier`（#88） | markPurchased / bulkPurchase 後、`state.purchasedItems` に該当アイテムが含まれること。moveToBasket / moveBackToUnpurchased 後は purchasedItems から外れること |
| `ShoppingItemDetailState`（#94） | `isNotPurchased`: notPurchased=true / inBasket=false / purchased=false |
| `ShoppingItemDetailPage`（#94/#96） | 削除ダイアログ・画像削除ダイアログでボタンタップ後、Notifier の deleteItem/deleteAttachment が呼ばれること、ダイアログが閉じること（詳細画面が pop されないこと） |
| `ShoppingItemNewPage` / `ShoppingItemDetailPage`（#93） | 追加成功時・お気に入り操作時に `shoppingListNotifierProvider` が invalidate されること |

---

## コミット前チェックリスト

- [ ] 各Issueの AC をすべて満たしているか
- [ ] `dart format .`
- [ ] `flutter analyze`（警告ゼロ）
- [ ] `flutter test`（全グリーン）
- [ ] 各Issueごとに個別コミットを作成したか
- [ ] AppLocalizations の import パスは `lib/l10n/app_localizations.dart` への相対パス
- [ ] `git push origin feature/85-mobile-shopping-list`

---

## 作業ルール

- [DEV] プレフィックスをDiscord投稿に必ずつける
- 作業スレッドID: `1504411180876435597`
- ブランチ: `feature/85-mobile-shopping-list`（既存・新規作成しない）
- 各Issueごとに個別コミット
- PRはSMが行う。DEVはpushまでが担当

---

## 実装状況

| Issue | 状態 |
|-------|------|
| #88 | 計画フェーズ完了・Sonnetでの実装フェーズ待ち |
| #93 | 計画フェーズ完了・Sonnetでの実装フェーズ待ち |
| #96 | 計画フェーズ完了・Sonnetでの実装フェーズ待ち |
| #94 | 計画フェーズ完了・Sonnetでの実装フェーズ待ち |

---

## ハマりポイントログ

（実装フェーズで都度追加する）
