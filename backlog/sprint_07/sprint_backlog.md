# Sprint 07 スプリントバックログ

**スプリント期間**: 2026-04-23 〜
**スプリントゴール**: APIドキュメント整備・パフォーマンス改善・SP版UI修正による品質底上げ

---

## 対象Issue一覧

| Issue | タイトル | ラベル | ブランチ | SP |
|-------|---------|-------|---------|-----|
| #17 | [#12作業漏れ] api_integration.md の更新 | bug | `docs/17-update-api-integration-doc` | 1 |
| #18 | onClickCompletePurchase の並列化 | refactor | `refactor/18-parallelize-complete-purchase` | 3 |
| #19 | SP版LandingPageのサインアップボタン折り返し | bug | `fix/19-sp-header-layout` | 2 |

**合計SP**: 6

---

## #17 AC一覧

コミット番号: `(ryokkon624/hw-hub-manage#17)`
ブランチ: `docs/17-update-api-integration-doc`

- [x] AC1: hw-hub-frontend/doc/api_integration.md に DELETE /api/shopping-items/{id} のエンドポイント情報が追加されている
- [x] AC2: 既存の記載フォーマットに準拠している

---

## #18 AC一覧

コミット番号: `(ryokkon624/hw-hub-manage#18)`
ブランチ: `refactor/18-parallelize-complete-purchase`

- [x] AC1: バックエンドにバッチ更新APIを追加し、`onClickCompletePurchase` からそのAPIを呼び出すことでAPI呼び出しが1回になっている
- [x] AC2: 既存の動作（完了処理の結果）に影響を与えない
- [x] AC3: UTが追加・修正されている

---

## #19 AC一覧

コミット番号: `(ryokkon624/hw-hub-manage#19)`
ブランチ: `fix/19-sp-header-layout`

- [x] AC1: SP版ヘッダに「Housework Hub」ロゴとLanguageSwitcherのみ表示される
- [x] AC2: SP版ヘッダに「機能」「こんな方に」リンク・「ログイン」「サインアップ」ボタンが表示されない
- [x] AC3: PC版のヘッダ表示は現状から変更されない

---

## チャレンジ項目

- Claudeモデル最新バージョン確認（現在: claude-sonnet-4-6、知識カットオフ: 2025年8月）
- api_integration.md更新漏れ防止チェックリストの整備（#17実装時にDEVへ依頼）

---

## リスク

- #18はバックエンドAPI追加 + フロントエンド修正 + UTの3点セットのため工数最大
- #18でバッチAPIのエンドポイント仕様（URL・リクエストBody・レスポンス）はDEVが設計してよい（ACを満たすなら実装方針はDEVに委ねる）
