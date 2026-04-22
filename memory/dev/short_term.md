# Dev 短期記憶

**スプリント**: Sprint 06  
**最終更新**: 2026-04-22

---

## 担当タスクメモ

### Issue #16: lightbulbアイコン復元
- ブランチ: fix/16-restore-lightbulb-icon (hw-hub-frontend)
- 対応内容:
  - `AdminHouseworkTemplatesPage.vue` にLucide `Lightbulb` コンポーネントをimport
  - PC版テーブル・SP版カード両方の「おすすめ」バッジで絵文字 `💡` をLightbulbアイコンに置換
  - ハードコード「あり」を `t('admin.houseworkTemplate.columns.recommendationYes')` i18nキーに置換
  - i18nキー `recommendationYes` を3言語（ja: あり / en: Yes / es: Si）で追加

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
| 2026-04-22 | #16のブランチ指定がバックログ更新で変更されていた | Planningで fix/10 を指定されたが実際は新規ブランチ fix/16 で作業 | 新規ブランチで作業完了。mainからの差分として独立したバグ修正になる |

---

## POへの未解決質問

なし

---

*スプリント終了後、long_term.mdに要約して移す*
