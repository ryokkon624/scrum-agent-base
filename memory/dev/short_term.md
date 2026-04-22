# Dev 短期記憶

**スプリント**: Sprint 06  
**最終更新**: 2026-04-22

---

## 担当タスクメモ

### Issue #16: lightbulbアイコン復元
- ブランチ: fix/10-housework-template-i18n (hw-hub-frontend) ※SMの指示でブランチ変更
- 対応内容:
  - `AdminHouseworkTemplatesPage.vue` にLucide `Lightbulb` コンポーネントをimport
  - PC版テーブル・SP版カード両方の「おすすめ」バッジにLightbulbアイコンを追加
  - i18nキー `recommendationYes` は fix/10 ブランチに既に存在していたため追加不要だった
- 注意: 最初に fix/16-restore-lightbulb-icon ブランチ（mainベース）で作業したが、SMから fix/10 ブランチへの変更指示があり再対応。fix/16 ブランチは不要（未削除）

### Issue #15: テストコードの整備とconvention-reviewerへのUT観点追加
- ブランチ: feature/12-delete-shopping-item (hw-hub-frontend + hw-hub-backend + scrum-agent-base)
- フロン��エンド:
  - `shoppingItemApi.spec.ts` に `deleteItem` のUT追加（DELETE /api/shopping-items/:id の呼び出し確認）
  - `shoppingStore.spec.ts` に `deleteItem` のUT追加（API��び出し + キャッシュ除去の確認、空配列ケース）
- バックエンド:
  - `ShoppingItemServiceSpec.groovy` に `delete` メソッドのUT3件追加:
    - アイテム未存在時のResourceNotFoundException
    - 世帯アクセス不可時のAccessDeniedException
    - 認可OK時の添付画像削除→アイテム削除の順序保証
- scrum-agent-base:
  - `.claude/agents/convention-reviewer.md` のレビュー観点に「UT追加・修正漏れ確認」を追加

---

## ハマりポイントログ

| 日付 | 問題 | 原因 | 解決策 |
|------|------|------|--------|
| 2026-04-22 | #16のブランチを間違えた | バックログのブランチ指定を確認せずmainから新規ブランチを切った | SMからの指示で fix/10 ブランチに再コミット。未マージブランチ上のバグ修正は、そのブランチに追加コミットする |

---

## POへの未解決質問

なし

---

*スプリント終了後、long_term.mdに要約して移す*
