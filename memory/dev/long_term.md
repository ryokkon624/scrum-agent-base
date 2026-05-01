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
