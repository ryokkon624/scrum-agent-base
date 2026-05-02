# Dev 長期記憶

**最終更新**: 2026-05-01

---

## 技術的なハマりポイントと解決策

（スプリントごとのshort_termから移してくる）

### AWS / インフラ
- AWS SDK v2を使う。spring-cloud-awsはSpring Boot 4.xと非互換なので使わない
- STG環境はEphemeral構成。使うときだけ `terraform apply`、終わったら `terraform destroy`

### Spring Boot / バックエンド
- MyBatisはJava recordをサポートしている
- ドメインRepositoryインターフェースを使ったレイヤードアーキテクチャを守る
- ShoppingItem系の認可チェックパターンは `item.getHouseholdId()` を取得して `householdAuthorizationService.canAccessHousehold` で判定する形で統一（updateStatus / updateFavorite / update / delete すべて同じ）。例外は `ResourceNotFoundException` / `AccessDeniedException` を投げる

### Vue 3 / フロントエンド
- ローカライズユーティリティはcomposablesに移動済み
- Pinia + Composition APIで状態管理
- store の内部状態フィールド（`lastFetchedAtByHouseholdId` 等）はコンポーネントから直接参照せず、getter（`isFetchedFor` 等）経由でアクセスする（カプセル化）
- スワイプジェスチャーは `composables/useSwipeGesture.ts` に切り出し、touchstart/touchmove/touchend のみ扱う（マウスイベントは無視）。translateX をリアルタイム返却して2層構成（背景＋前面）でドラッグ追従を実現
- スワイプ背景色は `main.css` に `bg-hwhub-swipe-action/delete/back/disabled` の4トークンを定義してカラートークン経由で指定する（生クラス禁止）
- ユーザーアイコンの broken image 対策は `components/ui/UserAvatar.vue`（共通コンポーネント）で `imageError = ref(false)` + `@error="imageError = true"` パターン。AC3例外箇所は個別に空グレー丸表示で対応する
- SP/PCのレイアウト分岐はTailwindの `md:` ブレークポイントで切り替え（`md:hidden` でSP専用UI、`md:block` でPC専用UI）
- スケルトンスクリーンは `components/ui/SkeletonItem.vue`（variant別 + count指定）として共通化。初回ロード中は `withLoading` を使わず `isInitialLoading` フラグで制御することで二重ローディング表示を回避

---

## Sprint 13 サマリー（2026-04-30完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #34 | SP版買い物リスト画面を3タブ構成に変更（SP:5） | ShoppingListTabBar.vue 新規・SP時のみタブ切替、PC時は2カラムgrid維持 |
| #33 | ユーザーアイコン取得失敗時のイニシャル表示（SP:2） | UserAvatar.vue 共通化・AC3例外箇所のみ個別対応 |
| #42 | 買い物リスト画面にスワイプジェスチャー導入（SP:5） | useSwipeGesture composable + SwipeableShoppingItem.vue・カラートークン4種追加 |

---

## Sprint 14 サマリー（2026-05-01完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #44 | スケルトンスクリーン導入（SP:3） | SkeletonItem.vue 新規・家事割り当て/MyTasks/買い物リスト3画面に適用。レビュー指摘で memberMap で O(1) 参照に改善 |
| #45 | 購入済みアイテム左スワイプ時の背景アイコン削除（SP:1） | SwipeableShoppingItem の購入済み時の左スワイプ背景アイコン・背景色を削除 |

---

## Sprint 18 サマリー（2026-05-01完了）

| Issue | 内容 | 成果 |
|-------|------|------|
| #43 | ダークモード対応（SP:5） | `main.css` に CSS変数ベースのライト/ダーク2テーマ実装、`@custom-variant dark` 宣言、`prefers-color-scheme` 連動 + `<html class="dark/light">` で手動上書き。`themeStore.ts`（SYSTEM/LIGHT/DARK 3択・LSキー `hwhub_theme`）と `ThemeSwitcher.vue`（SegmentControl）新規。`index.html` に FOUC防止インラインスクリプト、`main.ts` で `useThemeStore().init()` 配線。主要レイアウト・ページコンテナ・モーダルは `bg-hwhub-surface-card`/`text-hwhub-heading`/`border-hwhub-border` 等のトークンに置換。残存生Tailwindカラーは Sprint19 へ持ち越し（Issue #51） |

### Sprint 18 で習得したこと（テーマ実装）
- Tailwind v4 では `@custom-variant dark (&:where(.dark, .dark *):not(.light *):not(.light));` で `dark:` バリアントを定義する
- `:root` に CSS変数を定義し、`:root.dark` で上書き、さらに `@media (prefers-color-scheme: dark) { :root:not(.light):not(.dark) {...} }` で OS追従を実現する三段構成
- FOUC（テーマ切替時の白フラッシュ）防止は `index.html` の `<head>` 内インラインスクリプトで LS から読んで即 `<html class>` をセットする方式が確実
- `themeStore.init()` を `main.ts` で `app.use(router)` の前に呼ぶ（matchMedia リスナー登録のため）
- カラートークン化は「ライト/ダーク両方で意味的に同じ役割を持つ色」を抽象化する作業。`bg-white` のように「ダークモードでは別色になるべき箇所」と「意図的に白固定にしたい箇所」（トグルつまみ・Googleブランドボタン・ダーク背景上の半透明白オーバーレイ等）を見極めて使い分ける

---

## 習得したスキルログ

| スプリント | 習得内容 | 備考 |
|-----------|---------|------|
| | | |

---

## 削除したスキルログ

（モデルアップデートなどで不要になったSkill）

| スプリント | 削除内容 | 削除理由 |
|-----------|---------|---------|
| | | |
