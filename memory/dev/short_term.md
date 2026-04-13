# Dev 短期記憶

**スプリント**: Sprint 03  
**最終更新**: 2026-04-13

---

## 担当タスクメモ

- PBI-005: ホーム画面「おうちの様子」タスク件数の集計バグ修正完了（AC1〜AC3）
- ブランチ: fix/sprint03-task-count-bug
- 修正箇所: `src/views/home/HomePage.vue` - DONEタスクfetchの`force`を`false`→`true`に変更
- 原因: NOT_DONEはforce: true、DONEはforce: false（デフォルト）で取得していたため、
  タスク完了後にホーム画面に戻るとDONEキャッシュが古くなり総数が減っていた

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-04-13 | おうちの様子のタスク件数が完了後に減る | HomePage.vueでDONEタスクがforce:falseのためキャッシュを使用し、完了後の新DONEタスクが反映されなかった | DONEタスクもforce: trueに統一 |

---

## POへの未解決質問

なし

---

*スプリント終了後、long_term.mdに要約して移す*
