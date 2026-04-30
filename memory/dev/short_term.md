# Dev 短期記憶

**スプリント**: Sprint 12
**最終更新**: 2026-04-30

---

## 担当タスクメモ

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

## 過去スプリントの担当タスクメモ

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
