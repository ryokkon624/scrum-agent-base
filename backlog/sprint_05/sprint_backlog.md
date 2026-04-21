# Sprint 05 バックログ

**スプリント期間**: 2026-04-21 〜
**スプリントゴール**: 家事テンプレート画面のi18n対応と買い物アイテム削除機能を完成させ、管理画面の多言語UXとデータ管理を改善する

---

## PBI一覧

### PBI-009: 家事テンプレート画面のi18n対応

**GitHub Issue**: [#10](https://github.com/ryokkon624/hw-hub-manage/issues/10)
**種別**: bug
**ブランチ**: `fix/10-housework-template-i18n`
**コミット参照**: `(ryokkon624/hw-hub-manage#10)`

#### 概要

`AdminHouseworkTemplatesPage.vue` の家事名・おすすめ列がi18n対応されていない。

#### Acceptance Criteria

| # | AC内容 | 確認方法 |
|---|--------|---------|
| AC1 | [x] 「家事名（日）」列タイトルを「家事名」に変更する | 画面表示で確認 |
| AC2 | [x] 家事名の値がlocaleに応じて日本語・英語・スペイン語に切り替わる（`useHouseworkTemplate.ts` の `localize` 関数を活用） | 言語切替で確認 |
| AC3 | [x] 「おすすめ」列の「あり」がlocaleに応じた文言に切り替わる（日本語: あり / 英語: Yes / スペイン語: Sí） | 言語切替で確認 |

#### 実装方針

- `useHouseworkTemplate.ts` の `localize` 関数を流用して家事名を取得
- おすすめ文言はi18nキーを追加して対応

---

### PBI-010: 買い物アイテム削除機能

**GitHub Issue**: [#12](https://github.com/ryokkon624/hw-hub-manage/issues/12)
**種別**: feature
**ブランチ**: `feature/12-delete-shopping-item`
**コミット参照**: `(ryokkon624/hw-hub-manage#12)`

#### 概要

未購入の買い物アイテムを削除できるようにする。

#### Acceptance Criteria

| # | AC内容 | 確認方法 |
|---|--------|---------|
| AC1 | [x] 未購入ステータスのアイテムの編集画面（`ShoppingItemDetailPage.vue`）に削除ボタンが表示される | 画面表示で確認 |
| AC2 | [x] 購入済みのアイテムには削除ボタンが表示されない | 購入済みアイテムで確認 |
| AC3 | [x] 削除ボタン押下で確認ダイアログが表示される（他の削除機能と同じ挙動） | ボタン押下で確認 |
| AC4 | [x] 確認後、アイテムが物理削除される | API呼び出しで確認 |
| AC5 | [x] 削除後、買い物アイテム一覧画面に遷移し、削除したアイテムが一覧に表示されない | 画面遷移で確認 |
| AC6 | [x] 削除後の一覧キャッシュ更新は、買い物アイテム追加時のstoreの方針に準ずる | storeの更新で確認 |

#### 実装方針

- 既存の削除機能（他の削除画面）のパターンを流用
- storeのキャッシュ更新は追加時の方針（`cacheByKey`から直接参照）に合わせる

---

## リスク・注意事項

| # | 内容 | 対策 |
|---|------|------|
| R1 | `localize` 関数の既存利用箇所との整合性 | `useHouseworkTemplate.ts` の実装を事前確認 |
| R2 | 削除APIのエンドポイント・レスポンス仕様 | バックエンドの既存削除APIを確認 |
| R3 | i18nキー追加による翻訳漏れ（英語・スペイン語） | 3言語セットで追加 |

---

## チャレンジ項目

- Claudeモデル最新確認: 現在 `claude-sonnet-4-6`（短期記憶より。Planning時点で最新のため継続）

---

## DEVへの作業指示

1. `fix/10-housework-template-i18n` ブランチで PBI-009 を実装する
2. `feature/12-delete-shopping-item` ブランチで PBI-010 を実装する
3. 各PBIのACを1件ずつ実装コードと照合して確認する
4. 完了後、ブランチ名と共にSMにSendMessageで報告する
