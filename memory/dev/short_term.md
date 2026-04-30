# Dev 短期記憶

**スプリント**: Sprint 13
**最終更新**: 2026-04-30

---

## 担当タスクメモ

### Issue #42: 買い物リスト画面にスワイプジェスチャーを導入したい（SP:5）

- **ブランチ**: `feature/42-swipe-gesture`
- **対象**: hw-hub-frontend のみ（バックエンド変更なし。既存の updateStatus / deleteItem API を流用）
- **実装方針（りょこさん承認済み 2026-04-30）**:
  - **アーキテクチャ**:
    1. スワイプ検知ロジックは `composables/useSwipeGesture.ts` に切り出す（TDD対象）
       - touchstart / touchmove / touchend をハンドリング
       - 入力: 要素のRef、左右の閾値（30%）、左/右コールバック
       - 出力: translateX（リアルタイムオフセット）, swipeState（'idle' | 'dragging-left' | 'dragging-right'）
       - マウスイベントは無視（タッチのみ）
    2. アイテム単位で背景レイヤー＋前面レイヤーの2層構成
       - 背景: スワイプ方向に応じた色＋アイコン
       - 前面: 既存のリストアイテム（translateXでドラッグ追従）
    3. 新規共通コンポーネント `components/shopping/SwipeableShoppingItem.vue`（SP版のスワイプUI担当）
    4. 削除確認はブラウザの `confirm()` を使用（新規ConfirmDialog不要 / 承認済み）
    5. AC5の「編集画面で更新してください」は `uiStore.showToast` で表示（承認済み）
  - **PC/SP分岐戦略**: PC版はスワイプ不要（DEV判断 / 承認済み）
    - SP版（md未満）でSwipeableShoppingItemを使用、PC版（md以上）は従来のボタン操作を維持
  - **ファイル変更一覧**:
    - 新規: `src/composables/useSwipeGesture.ts`（TDD必須）
    - 新規: `src/__tests__/composables/useSwipeGesture.spec.ts`
    - 新規: `src/components/shopping/SwipeableShoppingItem.vue`
    - 編集: `src/views/shopping/ShoppingListPage.vue`
    - 編集: `src/i18n/ja.json` / `en.json` / `es.json`
  - **AC対応マッピング**:
    - AC1 未購入→右: updateStatus(IN_BASKET) / 緑 / shopping-cart
    - AC2 未購入→左: confirm() → deleteItem / 赤 / trash-2
    - AC3 かご→左: updateStatus(NOT_PURCHASED) / グレー / list-restart
    - AC4 かご→右: updateStatus(PURCHASED) / 緑 / wallet
    - AC5 購入済み→左: uiStore.showToast でメッセージ表示
    - AC6: ドラッグ追従＋画面幅30%閾値（useSwipeGesture内）
    - AC7: SP版（md未満）のみ有効
  - **TDD対象（useSwipeGesture.spec.ts）**:
    - 右スワイプ30%以上で右コールバック発火
    - 左スワイプ30%以上で左コールバック発火
    - 30%未満で指を離すと translateX が0に戻る
    - マウスイベントは無視される
- **ステータス**: 実装完了・コミット済み（2026-04-30）
- **コミット**: `bef3c31 feat: 買い物リスト画面にスワイプジェスチャーを導入 (ryokkon624/hw-hub-manage#42)`
- **TaskCreateリスト**:
  - [x] useSwipeGesture composable のテスト作成（RED）
  - [x] useSwipeGesture composable の実装（GREEN）
  - [x] SwipeableShoppingItem.vue 新規作成
  - [x] ShoppingListPage.vue へSwipeableShoppingItem組み込み
  - [x] i18n追加（ja/en/es）
  - [x] コミット前チェック・コミット

---

## 過去スプリントの担当タスクメモ

### Issue #34: [SP版]買い物リスト画面の3フレームをタブ構成に変更（SP:5）

- **ブランチ**: `feature/34-shopping-list-tab-layout`
- **対象**: hw-hub-frontend のみ
- 実装方針（りょこさん承認済み 2026-04-30）:
  - `src/components/shopping/ShoppingListTabBar.vue`（新規）
    - 3タブ（未購入・かご・購入済み）のヘッダーUI
    - 件数バッジ: 未購入・かごのみ（購入済みはバッジなし）
    - `v-model:activeTab` で `'notPurchased' | 'basket' | 'completed'` を受け渡し
    - `md:hidden` でPC時は非表示
  - `src/views/shopping/ShoppingListPage.vue`（既存編集）
    - `activeTab = ref<'notPurchased' | 'basket' | 'completed'>('notPurchased')` を導入（AC6: デフォルト「未購入」）
    - SP時: `ShoppingListTabBar` を表示、各セクションを `:class="[activeTab === '...' ? 'block' : 'hidden', 'md:block']"` で切替
    - SP時の購入済みタブ: 折りたたみ廃止・常時展開（PC時は折りたたみ維持）
    - PC時（md以上）: 従来の2カラムgrid + 折りたたみ購入済みを完全維持（AC7）
  - i18n追加（ja/en/es）:
    - `shopping.list.tabs.notPurchased` = "未購入" / "Not purchased" / "Sin comprar"
    - `shopping.list.tabs.basket` = "かご" / "Basket" / "Cesta"
    - `shopping.list.tabs.completed` = "購入済み" / "Completed" / "Comprados"
  - TDD: 全て View/Component の見た目変更のみ → テスト不要
- **ステータス**: 実装完了・コミット済み（2026-04-30）
- **コミット**: `269a80b feat: SP版買い物リスト画面を3タブ構成に変更 (ryokkon624/hw-hub-manage#34)`
- **TaskCreateリスト**:
  - [x] #35: ShoppingListTabBar.vue 新規作成（タブUIコンポーネント）
  - [x] #36: ShoppingListPage.vue タブ切替対応（SP時のみ）
  - [x] #37: i18n追加（ja/en/es: shopping.list.tabs.*）

---

### Issue #33: ユーザアイコンが取得できない場合にイニシャルアイコンを表示（SP:2）

- **ブランチ**: `fix/33-user-icon-fallback`
- **対象**: hw-hub-frontend のみ
- 実装方針（りょこさん承認済み 2026-04-30）:
  - **原因**: imgタグの `@error` イベントを未ハンドリング。iconUrlが設定されていても画像取得失敗時（403/404/ネットワークエラー）にbroken imageが表示される
  - **改修方針選択理由**: 同じパターンが4箇所に分散しているため共通コンポーネント化を採用。インライン対応はコピペコードが増えるため非採用。AccountSettingsPageはAC3例外なので個別対応（共通化すると仕様分岐が増え可読性が下がる）
  - `src/components/ui/UserAvatar.vue`（新規）
    - props: `iconUrl: string | null`, `label: string`, `size?: 'sm' | 'md' | 'lg'`, `alt?: string`
    - `imageError = ref(false)` を持ち `@error="imageError = true"` で切替
    - `iconUrl` が null/空 OR `imageError === true` のときイニシャル表示
    - イニシャル算出: `label.trim().slice(0, 2).toUpperCase()`
    - スタイル統一: `bg-hwhub-surface-subtle`, `text-hwhub-heading`, `font-semibold`
    - サイズ: size prop で切り替え（sm=w-6/h-6, md=w-8/h-8, lg=w-9/h-9）
  - 置き換え対象（既存編集、UserAvatarを使う）:
    - `src/components/AppHeader.vue`
    - `src/views/settings/HouseholdSettingsPage.vue:296`
    - `src/views/housework/assignment/HouseworkAssignmentPage.vue:64, 197`（2箇所）
  - AC3例外（UserAvatarは使わず個別対応）:
    - `src/views/settings/AccountSettingsPage.vue:117`
    - `imageError = ref(false)` + `@error="imageError = true"` を付与
    - 画像取得失敗時: `<img>` を非表示（`v-if="userIconUrl && !imageError"` に変更）にして空グレー丸を表示（イニシャルなし）
  - TDD: 全て View/Component の見た目変更のみ → テスト不要
- **ステータス**: 実装完了・コミット済み（2026-04-30）
- **コミット**: `0b7a639 fix: ユーザアイコン取得失敗時にイニシャルアイコンを表示 (ryokkon624/hw-hub-manage#33)`
- **TaskCreateリスト**:
  - [x] #38: UserAvatar.vue 新規作成（共通アイコンコンポーネント）
  - [x] #39: UserAvatarへの置き換え（AppHeader・HouseholdSettings・HouseworkAssignment）
  - [x] #40: AccountSettingsPage.vue 画像取得失敗時の空グレー丸表示（AC3例外）

---

### Issue #32: houseworkTaskStoreカプセル化（SP:2）
- **ブランチ**: `refactor/32-housework-task-store-encapsulation`（Sprint 10）

### Issue #3: おうち未所属ガード＆導線整理（SP:5）
- **ブランチ**: `feature/3-household-guard-guide`（Sprint 10）

### Issue #31: 買い物アイテム更新APIのURL変更
- ブランチ: refactor/31-shopping-item-put-url（Sprint 9）

### Issue #28: storeの内部状態フィールドカプセル化
- ブランチ: refactor/28-store-internal-field-encapsulation（Sprint 9）

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 12ではなし) | | | |

---

*スプリント終了後、long_term.mdに要約して移す*
