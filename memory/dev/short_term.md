# Dev 短期記憶

**スプリント**: Sprint 16
**最終更新**: 2026-05-01

---

## スプリントゴール

SP版の家事割り当て画面でスワイプ操作による直感的な担当変更体験を実現する

---

## 担当タスクメモ

### Issue #47: [SP版]家事割り当て画面の家事タスクカードにスワイプを導入したい（SP:5）

- **ブランチ**: `feature/47-add-swipe-to-assignment`
- **コミット参照**: `(ryokkon624/hw-hub-manage#47)`
- **ステータス**: 実装完了・レビュー待ち

**スワイプ仕様**:

| 操作 | アクション | 背景色 | アイコン | 文字 (JP/EN/ES) |
|--|--|--|--|--|
| 左スワイプ | 自分にする（即時実行） | bg-sky-500 | UserCheck | 自分にする / Mine / Para mí |
| 右スワイプ | メンバー選択モーダル起動 | bg-amber-500 | Users | メンバーへ / Members / Miembros |

**新規作成ファイル**:
- `src/components/housework/SwipeableAssignmentCard.vue` — SwipeableTaskCard.vue と同構造を踏襲
- `src/components/housework/AssigneePickerModal.vue` — ボトムシート風モーダル（下からせり上がるアニメーション）
- `src/components/housework/__tests__/SwipeableAssignmentCard.spec.ts`
- `src/components/housework/__tests__/AssigneePickerModal.spec.ts`

**編集ファイル**:
- `src/views/housework/assignment/HouseworkAssignmentPage.vue` — SP/PCで `md:hidden` / `hidden md:flex` 分岐（AC6担保）
- `src/assets/main.css` — カラートークン追加（bg-hwhub-swipe-self: sky-500 / bg-hwhub-swipe-members: amber-500）
- i18nファイル3件（ja/en/es）: assign.swipe.self / assign.swipe.members / assign.picker.title / assign.picker.unassigned

**承認済み決定事項**:
- モーダルアニメーションは固定速度（250ms ease-out）でAC5を満たす（スワイプ速度連動はBEST要件として後回し）
- BaseModalは使わず、ボトムシート風コンポーネントを新規作成
- 左スワイプの「自分にする」は確認ダイアログなしで即時実行

**Sprint15参考**:
- `SwipeableTaskCard.vue` の2層構造を踏襲
- `useSwipeGesture` コンポーザブルをそのまま流用
- 背景アイコンは大きめ（w-10相当）で不透明度20%
- SP版のみスワイプ対応、PC版は既存UIを温存（`md:hidden` / `hidden md:flex` で分岐）

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| (Sprint 16ではまだなし) | | | |

---

*スプリント終了後、long_term.mdに要約して移す*
