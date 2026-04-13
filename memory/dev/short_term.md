# Dev 短期記憶

**スプリント**: Sprint 04  
**最終更新**: 2026-04-13

---

## 担当タスクメモ

### PBI-006 / PBI-007: ホーム画面カード件数0件バグ修正
- ブランチ: fix/7-8-fix-home-card-count (hw-hub-frontend)
- 原因: HomePage.vueでPromise.allによりfetchTasks(NOT_DONE)とfetchTasks(DONE)が並列実行され、
  後に完了した方がtaskStore.itemsを上書きしていた。MyTasksCardとUnassignedTasksCardが
  taskStore.itemsを参照していたため、DONE fetchが後に完了するとNOT_DONEデータが消え件数0件になった
- 修正: 両カードでtaskStore.itemsではなくtaskStore.cacheByKeyからNOT_DONEキャッシュを直接参照するように変更
  (HouseholdSituationCard.vueが既にこのパターンを使用していた)

### PBI-008: GET /api/housework-tasks 下限日付追加
- ブランチ: feature/9-add-lower-limit-when-retrieve-tasks (hw-hub-backend)
- 実装: Service層でLocalDate.now().minusDays(7)を算出し、Repository→Mapper経由でSQLのWHERE句に
  `t.target_date >= #{lowerDate}` を追加
- 影響範囲: selectTasksForAssignクエリのみ。他のエンドポイントは影響なし

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-04-13 | MyTasks/UnassignedTasksカード件数0件 | Promise.allでfetchTasksが並列実行されtaskStore.itemsが上書きされる | cacheByKeyから直接キャッシュを参照 |

---

## POへの未解決質問

なし

---

*スプリント終了後、long_term.mdに要約して移す*
