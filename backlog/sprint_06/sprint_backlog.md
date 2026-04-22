# Sprint 06 Sprint Backlog

**スプリント期間**: 2026-04-22 〜
**スプリントゴール**: lightbulbアイコン復元・UTコード整備・レビュー観点追加により、UXの品質とテスト基盤を向上させる

---

## 対象Issue一覧

| Issue | タイトル | タイプ | ブランチ | SP |
|-------|---------|--------|---------|-----|
| #16 | lightbulbアイコン復元 | bug | fix/10-housework-template-i18n | 1 |
| #15 | テストコードの整備とconvention-reviewerへのUT観点追加 | bug | feature/12-delete-shopping-item | 2 |

---

## Issue #16: lightbulbアイコン復元

**GitHub Issue**: ryokkon624/hw-hub-manage#16
**ブランチ**: `fix/10-housework-template-i18n`（既存ブランチを継続使用）
**コミット番号参照**: ryokkon624/hw-hub-manage#16

### ユーザーストーリー

**As a** 管理者
**I want to** 家事テンプレート画面で「おすすめ」列の lightbulb アイコンを確認したい
**So that** おすすめの有無を視覚的に把握できる

### 発生事象

Sprint 05 #10（家事テンプレート画面のi18n対応）の実装後、「おすすめ」列の lightbulb アイコンが表示されなくなっている。

### Acceptance Criteria

- [x] AC1: `AdminHouseworkTemplatesPage.vue` の「おすすめ」列に Lucide の `lightbulb` アイコンが表示される
- [x] AC2: アイコンはおすすめコメントありの行にのみ表示される（既存の表示ロジックに準ずる）
- [x] AC3: 他の列・他の画面の表示に影響を与えない

### 備考

- アイコンライブラリ: Lucide（プロジェクト既存のものを使用）
- **ブランチ注意**: `fix/10-housework-template-i18n` はまだ main にマージされていない。このブランチ上で #16 を修正することで、#10 の変更を含んだ状態で対応できる
- 対象ファイル: `hw-hub-frontend` の `AdminHouseworkTemplatesPage.vue`

---

## Issue #15: テストコードの整備とconvention-reviewerへのUT観点追加

**GitHub Issue**: ryokkon624/hw-hub-manage#15
**ブランチ**: `feature/12-delete-shopping-item`（既存ブランチを継続使用）
**コミット番号参照**: ryokkon624/hw-hub-manage#15

### ユーザーストーリー

**As a** スクラムチーム
**I want to** UTが整備され、レビューで自動的にUT漏れが検出される状態にしたい
**So that** 今後のスプリントでUT漏れが繰り返されない

### 発生事象

Sprint 05 #12 のコードレビューで、frontend/backend ともにUTコードが改修されていないことが判明した。また、convention-reviewer のレビュー観点にUT確認が含まれていないため、今後も見落とされる可能性がある。

### Acceptance Criteria

- [x] AC1: Sprint 05 #12 で変更したフロントエンドのファイルに対してUTが追加・修正されている
- [x] AC2: Sprint 05 #12 で変更したバックエンドのファイルに対してUTが追加・修正されている
- [x] AC3: `.claude/agents/convention-reviewer.md` のレビュー観点に「変更ファイルに対応するUTの追加・修正漏れを確認する」旨の項目が追加されている

### 備考

- convention-reviewer.md はエージェント基盤リポジトリ（scrum-agent-base）のファイル
- #12 の変更対象: 買い物アイテム削除機能（frontend/backend 両方）
- 既存ブランチ `feature/12-delete-shopping-item` に追加コミットする

---

## 作業順序

1. **#16** を先に対応（独立した1ファイル修正、シンプル）
2. **#15** を後に対応（frontend/backend UT追加 + convention-reviewer.md更新）

---

## 完了定義（DoD）

- 全ACが達成されていること
- コードレビュー（規約・セキュリティ・パフォーマンス）で指摘なし（または対応済み）
- コミット前に format を実施済み（frontend: `npm run format` / backend: `./gradlew spotlessApply`）
- GitHub Issue番号をコミットメッセージに含める（例: `fix: #16 restore lightbulb icon`）
