# Dev 短期記憶

**スプリント**: Sprint 15
**最終更新**: 2026-05-01

---

## スプリントゴール

SP版のスワイプ体験を統一・改善する

---

## 担当タスクメモ

### Issue #48: [SP版] My Tasks画面の家事タスクカードにスワイプを導入（SP:3）

- **ブランチ**: `feature/48-add-swipe-to-mytasks`
- **コミット参照**: `(ryokkon624/hw-hub-manage#48)`
- **ステータス**: 実装完了・push済み・レビュー待ち

**新規ファイル**:
- `src/components/housework/SwipeableTaskCard.vue`
- `src/components/housework/__tests__/SwipeableTaskCard.spec.ts`

**編集ファイル**:
- `src/views/housework/tasks/MyTasksPage.vue`
- `src/i18n/ja.json` / `en.json` / `es.json`

**仕様**:
- SwipeableShoppingItem.vue の2層構造（背景＋前面）を踏襲
- 右スワイプ → 完了（`bg-hwhub-swipe-action` (emerald-500)背景、`CheckCheck`アイコン、白文字「完了/Done/Hecho」）
- 左スワイプ → スキップ（`bg-hwhub-swipe-back` (slate-400)背景、`CircleMinus`アイコン、白文字「スキップ/Skip/Omitir」）
- 背景アイコンは大きめ（w-10相当）で不透明度20%
- スキップ理由入力（window.prompt）は不要。理由なしでスキップ実行
- SP版のみSwipeableTaskCard、PC版は既存ボタンUI維持（`hidden md:block` / `md:hidden`で分岐）
- emit: `swipe-right` → `markDone(task)`、`swipe-left` → `skipTask(task)`
- i18nキー: `myTasks.swipe.done` / `myTasks.swipe.skip`

---

### Issue #49: [SP版] 買い物リスト画面の購入済みのスワイプ改善（SP:2）

- **ブランチ**: `feature/49-improve-purchased-swipe`
- **コミット参照**: `(ryokkon624/hw-hub-manage#49)`
- **ステータス**: 実装完了・push済み・レビュー待ち

**編集ファイル**:
- `src/composables/useSwipeGesture.ts`
- `src/composables/__tests__/useSwipeGesture.spec.ts`
- `src/components/shopping/SwipeableShoppingItem.vue`

**仕様**:
- useSwipeGesture にオプション引数 `disableLeft?: boolean` / `disableRight?: boolean` を追加
- `handleTouchMove` で該当方向の差分を0にクランプ
- 購入済みアイテム（PURCHASED）に `disableRight: true` を渡す
- 購入済みアイテムの左スワイプ背景を `bg-transparent` → `bg-hwhub-swipe-back` (slate-400) に変更
- AC3: 未購入アイテムのスワイプ動作には影響しない

---

## 作業順

1. #48（feature/48-add-swipe-to-mytasks）→ TDD（テストファースト）→ コミット・push
2. #49（feature/49-improve-purchased-swipe）→ TDD（テストファースト）→ コミット・push

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 15ではまだなし) | | | |

---

*スプリント終了後、long_term.mdに要約して移す*
